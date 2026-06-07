/**
 * Alpha Arcade integration for SIGNET reputation.
 * Uses @alpha-arcade/sdk (https://github.com/phara23/alpha-sdk) to discover
 * live markets and verify signal accuracy. MCP reference: https://github.com/phara23/alpha-mcp
 */

import { getSignal, updateSignalAccuracy } from "../db/client.ts";
import { alphaMarketLink, parseAlphaMarketMeta } from "./alpha-meta.ts";
import {
  createAlphaClient,
  findMatchingAlphaMarket,
  getMarketImpliedYes,
  verifySignalAgainstMarket,
} from "./alpha-client.ts";

export async function createAlphaArcadeMarket(signal: {
  id: string;
  title: string;
  direction: string;
  category: string;
  time_horizon: string;
}) {
  const matched = await findMatchingAlphaMarket(signal);

  if (matched) {
    const { updateSignalAlphaMarket } = await import("../db/client.ts");
    await updateSignalAlphaMarket(signal.id, matched.marketId, {
      marketAppId: matched.marketAppId,
      slug: matched.slug,
      url: matched.url,
      title: matched.title,
      yesProb: matched.yesProb,
    });

    return {
      marketId: matched.marketId,
      marketAppId: matched.marketAppId,
      slug: matched.slug,
      question: `Track signal "${signal.title}" against Alpha market: ${matched.title}`,
      url: matched.url,
      yesProb: matched.yesProb,
      matchedScore: matched.matchedScore,
      source: matched.source,
    };
  }

  return {
    marketId: null,
    marketAppId: undefined,
    url: null,
    message: "No live Alpha Arcade market matched this signal. Check ALPHA_API_KEY.",
  };
}

export async function resolveAlphaArcadeMarket(
  signalId: string,
  marketId?: string,
  marketAppId?: number,
) {
  const signal = await getSignal(signalId);
  if (!signal) return { marketId, wasCorrect: false, error: "signal_not_found" };

  const meta = parseAlphaMarketMeta(signal.alpha_arcade_market_id);
  const appId = marketAppId ?? meta?.marketAppId;
  const resolvedMarketId = marketId ?? meta?.marketId;

  if (!appId) {
    return { marketId: resolvedMarketId, wasCorrect: false, error: "no_market_linked" };
  }

  const verification = await verifySignalAgainstMarket(signal, appId);
  const wasCorrect = verification.verified ?? false;

  await updateSignalAccuracy(signalId, wasCorrect);

  return {
    marketId: resolvedMarketId,
    marketAppId: appId,
    wasCorrect,
    verification,
    alphaLink: alphaMarketLink(meta),
  };
}

/** Verify reputation for any signal that has Alpha metadata stored. */
export async function verifyAlphaForSignal(signalId: string) {
  const signal = await getSignal(signalId);
  if (!signal) return { ok: false, error: "signal_not_found" as const };
  const meta = parseAlphaMarketMeta(signal.alpha_arcade_market_id);
  if (!meta?.marketAppId) {
    return { ok: false, error: "no_alpha_market" as const, signalId };
  }
  const result = await resolveAlphaArcadeMarket(signalId, meta.marketId, meta.marketAppId);
  return { ok: true, signalId, ...result };
}

export async function getAlphaArcadeLink(signalId: string) {
  const signal = await getSignal(signalId);
  return alphaMarketLink(parseAlphaMarketMeta(signal?.alpha_arcade_market_id));
}

export async function getLiveAlphaMarketsPreview(limit = 5) {
  try {
    const client = createAlphaClient({ readOnly: true });
    const markets = await client.getMarkets();
    return markets.slice(0, limit).map((m) => ({
      id: m.id ?? String(m.marketAppId),
      title: m.title,
      slug: m.slug,
      marketAppId: m.marketAppId,
      yesProb: m.yesProb,
      volume: m.volume,
      endTs: m.endTs,
      isLive: m.isLive ?? true,
      url: m.slug
        ? `https://alphaarcade.com/market/${m.slug}`
        : `https://alphaarcade.com/market/${m.marketAppId}`,
    }));
  } catch (error) {
    return { error: error instanceof Error ? error.message : "failed" };
  }
}

export async function getAlphaMarketContext(marketAppId: number) {
  try {
    const implied = await getMarketImpliedYes(marketAppId);
    const client = createAlphaClient({ readOnly: true });
    const markets = await client.getMarkets();
    const market = markets.find((m) => m.marketAppId === marketAppId);
    return {
      marketAppId,
      title: market?.title,
      slug: market?.slug,
      yesProb: market?.yesProb,
      impliedYes: implied.impliedYes,
      url: market?.slug
        ? `https://alphaarcade.com/market/${market.slug}`
        : `https://alphaarcade.com/market/${marketAppId}`,
    };
  } catch (error) {
    return {
      marketAppId,
      error: error instanceof Error ? error.message : "unavailable",
    };
  }
}
