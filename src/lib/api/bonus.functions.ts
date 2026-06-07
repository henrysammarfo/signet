import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getServerConfig } from "../config.server";
import { getLiveAlphaMarketsPreview, getAlphaMarketContext, verifyAlphaForSignal } from "../bonus/arcade";
import { autoStakeIdle, getFolksXAlgoState, getTreasurySnapshot } from "../bonus/yield";
import { getStrictServerEnv } from "../config.server";
import { getWalletReadiness, getUsdcBalance } from "../../../shared/wallet/usdc.ts";

export const getIntegrationsStatus = createServerFn({ method: "GET" }).handler(async () => {
  const config = getServerConfig();
  const [alpha, folks] = await Promise.all([
    getLiveAlphaMarketsPreview(5),
    getFolksXAlgoState(),
  ]);

  return {
    alpha: {
      configured: Boolean(config.alphaApiKey),
      markets: Array.isArray(alpha) ? alpha : [],
      error: Array.isArray(alpha) ? undefined : alpha.error,
    },
    folks: {
      ...folks,
      autoStakeEnabled: process.env.AUTO_STAKE_XALGO === "true",
    },
  };
});

export const getAnalystTreasury = createServerFn({ method: "GET" }).handler(async () => {
  const config = getServerConfig();
  if (!config.analystAddress) return null;
  return getTreasurySnapshot(config.analystAddress);
});

export const getAlphaContext = createServerFn({ method: "GET" })
  .inputValidator(z.object({ marketAppId: z.number() }))
  .handler(async ({ data }) => getAlphaMarketContext(data.marketAppId));

/** Stake idle analyst revenue into xALGO via Folks SDK — no external UI needed. */
export const runInAppStake = createServerFn({ method: "POST" }).handler(async () => {
  const env = getStrictServerEnv();
  return autoStakeIdle(env.analystAddress);
});

/** Verify a signal against its linked Alpha market orderbook. */
export const runAlphaVerify = createServerFn({ method: "POST" })
  .inputValidator(z.object({ signalId: z.string().min(1) }))
  .handler(async ({ data }) => verifyAlphaForSignal(data.signalId));

export const getWalletStatus = createServerFn({ method: "GET" }).handler(async () => {
  const env = getStrictServerEnv();
  const [buyer, analyst] = await Promise.all([
    getUsdcBalance(env.buyerAddress),
    getUsdcBalance(env.analystAddress),
  ]);
  return { buyer, analyst };
});

export const prepareBuyerWallet = createServerFn({ method: "POST" }).handler(async () => {
  const env = getStrictServerEnv();
  return getWalletReadiness(env.buyerMnemonic, env.buyerAddress);
});
