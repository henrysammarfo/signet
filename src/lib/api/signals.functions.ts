import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getServerConfig } from "../config.server";
import {
  createSignal as dbCreateSignal,
  ensureDefaultAgents,
  getSignal,
  listMarketplace as dbListMarketplace,
  registerAgent,
} from "../db";
import { createAlphaArcadeMarket } from "../bonus/arcade";
import { alphaMarketLink, parseAlphaMarketMeta } from "../../../shared/bonus/alpha-meta.ts";
import { MIN_SIGNAL_PRICE_USDC } from "../../../shared/config/pricing.ts";

const createSignalSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  content: z.string().min(1),
  price_usdc: z.number().min(MIN_SIGNAL_PRICE_USDC),
  embargo_minutes: z.number().min(0).optional(),
  direction: z.string().optional(),
  confidence: z.number().optional(),
  time_horizon: z.string().optional(),
  alpha_arcade_market_id: z.string().optional(),
  analyst_address: z.string().min(10),
  analyst_name: z.string().min(1).optional(),
});

const marketplaceSchema = z
  .object({
    category: z.string().optional(),
    minAccuracy: z.number().optional(),
    maxPrice: z.number().optional(),
  })
  .optional();

export const createSignal = createServerFn({ method: "POST" })
  .inputValidator(createSignalSchema)
  .handler(async ({ data }) => {
    const config = getServerConfig();
    const analystName = data.analyst_name ?? `Analyst ${data.analyst_address.slice(0, 6)}`;

    await registerAgent({
      name: analystName,
      type: "analyst",
      address: data.analyst_address,
      price_per_signal: data.price_usdc,
    });

    if (config.buyerAddress) {
      await ensureDefaultAgents(data.analyst_address, config.buyerAddress);
    }

    const signal = await dbCreateSignal({
      ...data,
      analyst_address: data.analyst_address,
      analyst_name: analystName,
    });

    const alpha = await createAlphaArcadeMarket({
      id: signal.id,
      title: signal.title,
      direction: data.direction ?? "neutral",
      category: signal.category,
      time_horizon: data.time_horizon ?? "24h",
    });

    const x402Url = `${config.x402ServerUrl}/signals/${signal.id}`;

    return {
      signalId: signal.id,
      x402Endpoint: x402Url,
      alpha,
      signal: {
        id: signal.id,
        title: signal.title,
        category: signal.category,
        price_usdc: signal.price_usdc,
        analyst_name: signal.analyst_name,
        analyst_address: signal.analyst_address,
        created_at: signal.created_at,
      },
    };
  });

export const listMarketplace = createServerFn({ method: "GET" })
  .inputValidator(marketplaceSchema)
  .handler(async ({ data }) => {
    const config = getServerConfig();
    const signals = await dbListMarketplace(data ?? {});
    return signals.map((s) => {
      const alphaMeta = parseAlphaMarketMeta(s.alpha_arcade_market_id);
      return {
        id: s.id,
        title: s.title,
        category: s.category,
        accuracy: s.accuracy_score || s.confidence || 0,
        price: s.price_usdc,
        agent: s.analyst_name ?? "Analyst",
        analystAddress: s.analyst_address,
        purchases: s.purchases,
        created_at: s.created_at,
        direction: s.direction,
        endpoint: `${config.x402ServerUrl}/signals/${s.id}`,
        alphaVerified: Boolean(alphaMeta?.marketAppId),
        alphaLink: alphaMarketLink(alphaMeta),
        alphaYesProb: alphaMeta?.yesProb,
      };
    });
  });

export const getSignalById = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const config = getServerConfig();
    const signal = await getSignal(data.id);
    if (!signal) throw new Error("Signal not found");

    const alphaMeta = parseAlphaMarketMeta(signal.alpha_arcade_market_id);
    const alphaArcadeLink = alphaMarketLink(alphaMeta);

    let alphaContext: Awaited<ReturnType<typeof import("../bonus/arcade").getAlphaMarketContext>> | undefined;
    if (alphaMeta?.marketAppId) {
      const { getAlphaMarketContext } = await import("../bonus/arcade");
      alphaContext = await getAlphaMarketContext(alphaMeta.marketAppId);
    }

    return {
      id: signal.id,
      title: signal.title,
      category: signal.category,
      price: signal.price_usdc,
      accuracy: signal.accuracy_score || signal.confidence || 0,
      agent: signal.analyst_name ?? "Analyst",
      analystAddress: signal.analyst_address,
      purchases: signal.purchases,
      created_at: signal.created_at,
      direction: signal.direction,
      confidence: signal.confidence,
      time_horizon: signal.time_horizon,
      alpha_arcade_market_id: signal.alpha_arcade_market_id,
      alphaArcadeLink,
      alphaMeta,
      alphaContext,
      preview: signal.content.slice(0, 200),
      endpoint: `${config.x402ServerUrl}/signals/${signal.id}`,
      content: undefined as string | undefined,
    };
  });
