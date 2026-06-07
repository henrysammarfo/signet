import { createServerFn } from "@tanstack/react-start";

import { getServerConfig } from "../config.server";
import { getLiveConfigStatus } from "../../../shared/config/env.ts";
import { getFolksXAlgoState } from "../bonus/yield";
import { getLiveAlphaMarketsPreview } from "../bonus/arcade";

export const getPlatformHealth = createServerFn({ method: "GET" }).handler(async () => {
  const config = getServerConfig();
  let x402Status: "ok" | "down" | "unknown" = "unknown";
  let x402Detail = "";

  try {
    const res = await fetch(`${config.x402ServerUrl}/health`, { signal: AbortSignal.timeout(5000) });
    x402Status = res.ok ? "ok" : "down";
    x402Detail = res.ok ? await res.text() : `HTTP ${res.status}`;
  } catch (e) {
    x402Status = "down";
    x402Detail = e instanceof Error ? e.message : "unreachable";
  }

  const credentials = getLiveConfigStatus();
  const folks = await getFolksXAlgoState();
  const alpha = await getLiveAlphaMarketsPreview(3);

  return {
    network: "algorand-testnet",
    supabase: config.supabaseConfigured,
    openai: Boolean(config.openaiApiKey),
    alphaApi: Boolean(config.alphaApiKey),
    credentials,
    liveReady: credentials.every((c) => c.configured) && x402Status === "ok" && config.supabaseConfigured,
    x402: { status: x402Status, url: config.x402ServerUrl, detail: x402Detail },
    facilitator: config.facilitatorUrl,
    folks,
    alpha: Array.isArray(alpha)
      ? { markets: alpha, count: alpha.length }
      : { markets: [], error: alpha.error },
    autoStakeXAlgo: process.env.AUTO_STAKE_XALGO === "true",
    docs: "docs/API_KEYS.md",
  };
});
