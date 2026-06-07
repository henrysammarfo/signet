import { createServerFn } from "@tanstack/react-start";

import { runAnalystAgent } from "../../../packages/agents/analyst";
import { runBuyerAgent } from "../../../packages/agents/buyer";
import { getStrictServerEnv } from "../config.server";
import { assertFullLiveConfigured } from "../../../shared/config/env.ts";
import { ensureDefaultAgents, getAgentStatus, logEvent } from "../db";
import { createAlphaArcadeMarket, verifyAlphaForSignal } from "../bonus/arcade";
import { autoStakeIdle } from "../bonus/yield";

export const runDemo = createServerFn({ method: "GET" }).handler(async () => {
  assertFullLiveConfigured();
  const env = getStrictServerEnv();
  const steps: Array<{ step: string; result: unknown; ok: boolean }> = [];

  await ensureDefaultAgents(env.analystAddress, env.buyerAddress);

  let analystResult: Awaited<ReturnType<typeof runAnalystAgent>> | null = null;
  try {
    analystResult = await runAnalystAgent();
    steps.push({ step: "1_analyst_create", result: analystResult, ok: true });
  } catch (error) {
    steps.push({
      step: "1_analyst_create",
      result: { error: error instanceof Error ? error.message : "failed" },
      ok: false,
    });
  }

  let buyerResult: Awaited<ReturnType<typeof runBuyerAgent>> | null = null;
  try {
    buyerResult = await runBuyerAgent();
    steps.push({ step: "2_buyer_purchase", result: buyerResult, ok: true });
  } catch (error) {
    steps.push({
      step: "2_buyer_purchase",
      result: { error: error instanceof Error ? error.message : "failed" },
      ok: false,
    });
  }

  const signalId = buyerResult?.signalId ?? analystResult?.signalId;
  if (signalId) {
    try {
      if (!analystResult?.marketId && buyerResult) {
        const market = await createAlphaArcadeMarket({
          id: signalId,
          title: buyerResult.title ?? "Signal",
          direction: buyerResult.direction ?? "bullish",
          category: buyerResult.category ?? "Crypto",
          time_horizon: buyerResult.timeHorizon ?? "24h",
        });
        steps.push({ step: "3_alpha_arcade", result: market, ok: Boolean(market.marketId) });
      } else {
        steps.push({
          step: "3_alpha_arcade",
          result: {
            marketId: analystResult?.marketId,
            marketUrl: analystResult?.marketUrl,
            linkedAtPublish: true,
          },
          ok: Boolean(analystResult?.marketId),
        });
      }

      const resolved = await verifyAlphaForSignal(signalId);
      steps.push({ step: "4_reputation", result: resolved, ok: resolved.ok });
    } catch (error) {
      steps.push({
        step: "3_alpha_arcade",
        result: { error: error instanceof Error ? error.message : "failed" },
        ok: false,
      });
    }
  }

  const stake = await autoStakeIdle(env.analystAddress);
  steps.push({ step: "5_treasury_stake", result: stake, ok: true });

  const status = await getAgentStatus();
  await logEvent("demo_complete", "End-to-end SIGNET live testnet run completed", {
    steps: steps.length,
    liveX402: true,
  });

  return {
    ok: steps.every((s) => s.ok),
    mode: "live" as const,
    steps,
    events: status.events.slice(0, 8),
    note: "Live x402 USDC payment on Algorand testnet. Requires funded BUYER wallet and x402 server.",
  };
});

export const runAnalyst = createServerFn({ method: "POST" }).handler(async () => {
  return runAnalystAgent();
});

export const runBuyer = createServerFn({ method: "POST" }).handler(async () => {
  return runBuyerAgent();
});
