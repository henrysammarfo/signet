/**
 * Folks SDK expects its bundled algosdk — root algosdk v3 fails instanceof checks.
 */
import { createRequire } from "node:module";

import { TestnetConsensusConfig } from "@folks-finance/algorand-sdk";

const require = createRequire(import.meta.url);
const folksAlgosdk = require("@folks-finance/algorand-sdk/node_modules/algosdk") as typeof import("algosdk");

export { folksAlgosdk, TestnetConsensusConfig };

export function getFolksAlgodClient() {
  const host = process.env.ALGORAND_ALGOD_URL ?? "https://testnet-api.algonode.cloud";
  const port = host.includes("localhost") ? 4001 : 443;
  return new folksAlgosdk.Algodv2("", host, port);
}

export function getFolksConsensusConfig() {
  if (process.env.FOLKS_XALGO_APP_ID && process.env.FOLKS_XALGO_ASA_ID) {
    return {
      consensusAppId: Number(process.env.FOLKS_XALGO_APP_ID),
      xAlgoId: Number(process.env.FOLKS_XALGO_ASA_ID),
      stakeAndDepositAppId: Number(process.env.FOLKS_STAKE_DEPOSIT_APP_ID ?? "0"),
    };
  }
  return TestnetConsensusConfig;
}
