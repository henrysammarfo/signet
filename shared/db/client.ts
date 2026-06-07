import { createHash, randomUUID } from "node:crypto";

import type {
  Agent,
  AgentEvent,
  CreateSignalInput,
  MarketplaceFilters,
  Purchase,
  Signal,
} from "./types.ts";
import { assertDatabaseConfigured } from "../config/env.ts";
import { priceToX402 } from "../config/pricing.ts";

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL ?? "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  };
}

async function getSupabaseClient() {
  assertDatabaseConfigured();
  const { url, key } = getSupabaseConfig();
  const { createClient } = await import("@supabase/supabase-js");
  try {
    const ws = await import("ws");
    return createClient(url, key, {
      realtime: { transport: ws.default },
    });
  } catch {
    return createClient(url, key);
  }
}

function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}


export { priceToX402 };

export async function ensureDefaultAgents(analystAddress: string, buyerAddress: string) {
  const supabase = await getSupabaseClient();
  const { data } = await supabase.from("agents").select("id").limit(1);
  if (data && data.length > 0) return;

  await supabase.from("agents").insert([
    {
      name: "SIGNET Analyst",
      type: "analyst",
      address: analystAddress,
      capabilities: ["Crypto", "DeFi", "Macro"],
      price_per_signal: 2,
      status: "active",
    },
    {
      name: "SIGNET Buyer",
      type: "buyer",
      address: buyerAddress,
      capabilities: ["discovery", "x402"],
      status: "scanning",
    },
  ]);
}

export async function registerAgent(input: {
  name: string;
  type: "analyst" | "buyer";
  address: string;
  capabilities?: string[];
  price_per_signal?: number;
}): Promise<Agent> {
  const supabase = await getSupabaseClient();
  const existing = await getAgentByAddress(input.address);
  if (existing) return existing;

  const row = {
    name: input.name,
    type: input.type,
    address: input.address,
    capabilities: input.capabilities ?? [],
    price_per_signal: input.price_per_signal ?? 0,
    status: input.type === "analyst" ? "active" : "scanning",
  };

  const { data, error } = await supabase.from("agents").insert(row).select().single();
  if (error) throw new Error(error.message);
  await logEvent("agent_registered", `${input.name} joined as ${input.type}`, {
    address: input.address,
  });
  return data as Agent;
}

export async function createSignal(input: CreateSignalInput): Promise<Signal> {
  const embargoUntil = input.embargo_minutes
    ? new Date(Date.now() + input.embargo_minutes * 60_000).toISOString()
    : undefined;

  const signal: Signal = {
    id: randomUUID(),
    title: input.title,
    category: input.category,
    content: input.content,
    content_hash: hashContent(input.content),
    price_usdc: input.price_usdc,
    embargo_until: embargoUntil,
    analyst_address: input.analyst_address,
    analyst_name: input.analyst_name ?? "SIGNET Analyst",
    purchases: 0,
    accuracy_score: 0,
    direction: input.direction,
    confidence: input.confidence,
    time_horizon: input.time_horizon,
    alpha_arcade_market_id: input.alpha_arcade_market_id,
    created_at: new Date().toISOString(),
  };

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.from("signals").insert(signal).select().single();
  if (error) throw new Error(error.message);

  const analyst = await getAgentByAddress(input.analyst_address);
  if (analyst) {
    await supabase
      .from("agents")
      .update({ signals_count: analyst.signals_count + 1, status: "active" })
      .eq("address", input.analyst_address);
  }

  await logEvent("signal_created", `Analyst published "${signal.title}"`, { signalId: signal.id });
  return data as Signal;
}

export async function getSignal(id: string): Promise<Signal | null> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.from("signals").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Signal) ?? null;
}

export async function listMarketplace(filters: MarketplaceFilters = {}): Promise<Signal[]> {
  const supabase = await getSupabaseClient();
  let query = supabase.from("signals").select("*").order("created_at", { ascending: false });
  if (filters.category && filters.category !== "All") {
    query = query.eq("category", filters.category);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte("price_usdc", filters.maxPrice);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  let results = (data as Signal[]) ?? [];
  if (filters.minAccuracy !== undefined) {
    results = results.filter((s) => s.accuracy_score >= filters.minAccuracy!);
  }
  return results.map(publicSignal);
}

function publicSignal(signal: Signal): Signal {
  return {
    ...signal,
    content: signal.content.slice(0, 120) + (signal.content.length > 120 ? "…" : ""),
  };
}

export async function getSignalContent(id: string): Promise<Signal | null> {
  return getSignal(id);
}

export async function recordPurchase(input: {
  signal_id: string;
  buyer_address: string;
  tx_id?: string;
  amount_usdc: number;
}): Promise<Purchase> {
  const purchase: Purchase = {
    id: randomUUID(),
    signal_id: input.signal_id,
    buyer_address: input.buyer_address,
    tx_id: input.tx_id,
    amount_usdc: input.amount_usdc,
    created_at: new Date().toISOString(),
  };

  const supabase = await getSupabaseClient();
  await supabase.from("purchases").insert(purchase);

  const signal = await getSignal(input.signal_id);
  if (signal) {
    await supabase
      .from("signals")
      .update({ purchases: signal.purchases + 1 })
      .eq("id", signal.id);

    const analyst = await getAgentByAddress(signal.analyst_address);
    if (analyst) {
      await supabase
        .from("agents")
        .update({ revenue_usdc: analyst.revenue_usdc + input.amount_usdc })
        .eq("address", signal.analyst_address);
    }
  }

  await logEvent(
    "purchase",
    `Buyer paid ${input.amount_usdc} USDC for signal ${input.signal_id}`,
    { signalId: input.signal_id, txId: input.tx_id },
  );
  return purchase;
}

export async function getLeaderboard(): Promise<Agent[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("type", "analyst")
    .order("accuracy_score", { ascending: false })
    .limit(10);
  if (error) throw new Error(error.message);
  return (data as Agent[]) ?? [];
}

export async function getAgentStatus() {
  const supabase = await getSupabaseClient();
  const { data: agents } = await supabase.from("agents").select("*");
  const { data: events } = await supabase
    .from("agent_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  return { agents: agents ?? [], events: events ?? [] };
}

export async function getTreasuryRows() {
  const { getFolksXAlgoState, computeProjectedYield } = await import("../bonus/yield.ts");
  const folks = await getFolksXAlgoState();
  const apy = folks.available ? folks.apyEstimate : 6.2;
  const agents = await getLeaderboard();

  return agents.map((a) => {
    const projected = computeProjectedYield(a.revenue_usdc, apy);
    return {
      agent: a.name,
      staked: a.xalgo_staked || projected.staked,
      apy,
      earned: a.revenue_usdc,
      projectedYield: a.xalgo_yield || projected.projected,
      folksAvailable: folks.available,
      xAlgoCirculating: folks.available ? folks.xAlgoCirculating : undefined,
    };
  });
}

export async function getAgentByAddress(address: string): Promise<Agent | null> {
  const supabase = await getSupabaseClient();
  const { data } = await supabase.from("agents").select("*").eq("address", address).maybeSingle();
  return (data as Agent) ?? null;
}

export async function updateSignalAccuracy(signalId: string, wasCorrect: boolean) {
  const delta = wasCorrect ? 5 : -3;
  const signal = await getSignal(signalId);
  if (!signal) return;

  const newScore = Math.max(0, Math.min(100, signal.accuracy_score + delta));
  const supabase = await getSupabaseClient();
  await supabase.from("signals").update({ accuracy_score: newScore }).eq("id", signalId);
  await supabase
    .from("agents")
    .update({ accuracy_score: newScore })
    .eq("address", signal.analyst_address);
  await logEvent("accuracy_update", `Signal ${signalId} ${wasCorrect ? "verified ✓" : "missed ✗"}`, {
    signalId,
    wasCorrect,
  });
}

export async function updateSignalAlphaMarket(
  signalId: string,
  marketId: string,
  meta?: { url?: string; marketAppId?: number; slug?: string; title?: string; yesProb?: number },
) {
  const { encodeAlphaMarketMeta } = await import("../bonus/alpha-meta.ts");
  const supabase = await getSupabaseClient();
  const value = encodeAlphaMarketMeta({
    marketId,
    marketAppId: meta?.marketAppId,
    slug: meta?.slug,
    url: meta?.url,
    title: meta?.title,
    yesProb: meta?.yesProb,
  });
  await supabase.from("signals").update({ alpha_arcade_market_id: value }).eq("id", signalId);
}

export async function updateAgentXAlgoStake(address: string, staked: number, yieldUsdc?: number) {
  const supabase = await getSupabaseClient();
  const patch: { xalgo_staked: number; xalgo_yield?: number } = { xalgo_staked: staked };
  if (yieldUsdc !== undefined) patch.xalgo_yield = yieldUsdc;
  await supabase.from("agents").update(patch).eq("address", address);
}

export async function logEvent(
  event_type: string,
  message: string,
  metadata: Record<string, unknown> = {},
) {
  const event: AgentEvent = {
    id: randomUUID(),
    event_type,
    message,
    metadata,
    created_at: new Date().toISOString(),
  };

  const supabase = await getSupabaseClient();
  await supabase.from("agent_events").insert(event);
}
