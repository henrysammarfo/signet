/**
 * Folks Finance xALGO integration — https://docs.folks.finance/
 * SDK: https://github.com/Folks-Finance/algorand-js-sdk
 * Testnet UI: https://testnet.folks.finance/liquid-staking
 */

import {
  getConsensusState,
  prepareImmediateStakeTransactions,
} from "@folks-finance/algorand-sdk";

import { getAgentByAddress } from "../db/client.ts";
import { getFolksAlgodClient, getFolksConsensusConfig, folksAlgosdk } from "./folks-client.ts";

const OPERATING_RESERVE = 5;
const MIN_STAKE_ALGO = 1;
const FOLKS_DOCS = "https://docs.folks.finance/";
const FOLKS_UI = "https://testnet.folks.finance/liquid-staking";

export async function getFolksXAlgoState() {
  try {
    const config = getFolksConsensusConfig();
    const algod = getFolksAlgodClient();
    const state = await getConsensusState(algod, config);
    const xAlgoRate =
      state.xAlgoCirculatingSupply > 0n
        ? Number(state.algoBalance) / Number(state.xAlgoCirculatingSupply)
        : 1;

    return {
      available: true,
      config,
      docs: FOLKS_DOCS,
      ui: FOLKS_UI,
      totalPendingStake: Number(state.totalPendingStake) / 1e6,
      xAlgoCirculating: Number(state.xAlgoCirculatingSupply) / 1e6,
      algoBacking: Number(state.algoBalance) / 1e6,
      xAlgoRate,
      canImmediateStake: state.canImmediateStake,
      canDelayStake: state.canDelayStake,
      fee: Number(state.fee),
      apyEstimate: 6.2,
    };
  } catch (error) {
    return {
      available: false,
      reason: error instanceof Error ? error.message : "folks_sdk_unavailable",
      docs: FOLKS_DOCS,
      ui: FOLKS_UI,
    };
  }
}

export async function autoStakeIdle(analystAddress: string) {
  const agent = await getAgentByAddress(analystAddress);
  if (!agent) {
    return { staked: 0, skipped: true, message: "Analyst agent not registered" };
  }

  const idle = agent.revenue_usdc - OPERATING_RESERVE;
  if (idle < MIN_STAKE_ALGO) {
    return {
      staked: 0,
      skipped: true,
      message: "Below minimum stake threshold",
      projectedStake: Math.max(0, idle * 0.15),
      folksState: await getFolksXAlgoState(),
    };
  }

  const folksState = await getFolksXAlgoState();
  const stakeAlgo = idle * 0.15;

  if (process.env.AUTO_STAKE_XALGO !== "true" || !process.env.ANALYST_MNEMONIC) {
    return {
      staked: 0,
      projectedStake: stakeAlgo,
      skipped: true,
      folksState,
      message: "Set AUTO_STAKE_XALGO=true and ANALYST_MNEMONIC for on-chain xALGO stake.",
      docs: FOLKS_DOCS,
      ui: FOLKS_UI,
    };
  }

  try {
    const config = getFolksConsensusConfig();
    const algod = getFolksAlgodClient();
    const state = await getConsensusState(algod, config);
    const params = await algod.getTransactionParams().do();
    const microAlgo = Math.round(stakeAlgo * 1e6);

    if (!state.canImmediateStake) {
      return { staked: 0, skipped: true, message: "Immediate stake disabled on testnet pool", folksState };
    }

    const account = folksAlgosdk.mnemonicToSecretKey(process.env.ANALYST_MNEMONIC);
    const txns = prepareImmediateStakeTransactions(
      config,
      state,
      account.addr,
      account.addr,
      microAlgo,
      Math.floor(microAlgo * 0.99),
      params,
    );

    const signed = txns.map((txn) => txn.signTxn(account.sk));
    const { txId } = await algod.sendRawTransaction(signed).do();
    await folksAlgosdk.waitForConfirmation(algod, txId, 4);

    const { updateAgentXAlgoStake } = await import("../db/client.ts");
    await updateAgentXAlgoStake(analystAddress, agent.xalgo_staked + stakeAlgo, agent.xalgo_yield);

    return {
      staked: stakeAlgo,
      txId,
      token: "xALGO",
      folksState,
      ui: FOLKS_UI,
    };
  } catch (error) {
    return {
      staked: 0,
      skipped: true,
      error: error instanceof Error ? error.message : "stake_failed",
      folksState,
      docs: FOLKS_DOCS,
    };
  }
}

export function computeProjectedYield(revenueUsdc: number, apy = 6.2) {
  const staked = Math.max(0, (revenueUsdc - OPERATING_RESERVE) * 0.15);
  return { staked, apy, projected: staked * (apy / 100) };
}

export async function getTreasurySnapshot(analystAddress: string) {
  const agent = await getAgentByAddress(analystAddress);
  const folks = await getFolksXAlgoState();
  const revenue = agent?.revenue_usdc ?? 0;
  const projected = computeProjectedYield(revenue, folks.available ? folks.apyEstimate : 6.2);

  return {
    agent: agent?.name ?? "Analyst",
    address: analystAddress,
    revenueUsdc: revenue,
    stakedXAlgo: agent?.xalgo_staked ?? 0,
    xalgoYield: agent?.xalgo_yield ?? projected.projected,
    projectedStake: projected.staked,
    apy: projected.apy,
    folks,
  };
}
