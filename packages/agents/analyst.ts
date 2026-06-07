import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { createSignal, logEvent } from "../../shared/db/client.ts";
import { createAlphaArcadeMarket } from "../../shared/bonus/arcade.ts";
import { getDefaultSignalPriceUsdc } from "../../shared/config/pricing.ts";
import { requireEnv, SignetConfigError } from "../../shared/config/env.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../.env") });
config({ path: resolve(__dirname, "../../.env.local") });

interface MarketSnapshot {
  symbol: string;
  price: number;
  change24h: number;
}

export async function fetchMarketData(symbols: string[]): Promise<MarketSnapshot[]> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${mapSymbols(symbols)}&vs_currencies=usd&include_24hr_change=true`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`CoinGecko error: ${response.status}`);
  const data = (await response.json()) as Record<string, { usd: number; usd_24h_change?: number }>;

  return symbols.map((symbol) => {
    const id = mapSymbol(symbol);
    return {
      symbol,
      price: data[id]?.usd ?? 0,
      change24h: data[id]?.usd_24h_change ?? 0,
    };
  });
}

function mapSymbols(symbols: string[]) {
  return symbols.map(mapSymbol).join(",");
}

function mapSymbol(symbol: string) {
  const map: Record<string, string> = {
    BTC: "bitcoin",
    ETH: "ethereum",
    ALGO: "algorand",
    SOL: "solana",
  };
  return map[symbol] ?? symbol.toLowerCase();
}

export async function generateSignalAnalysis(marketData: MarketSnapshot[]) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new SignetConfigError(
      "OPENAI_API_KEY is required for the analyst agent. Get one at https://platform.openai.com/api-keys",
    );
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a crypto market analyst. Respond with JSON only: title, direction (bullish|bearish|neutral), confidence (0-100), reason (one sentence), timeHorizon (e.g. 4h, 24h, 1w).",
        },
        {
          role: "user",
          content: `Analyze: ${JSON.stringify(marketData)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI error (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = payload.choices?.[0]?.message?.content ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("OpenAI returned no JSON signal");
  const parsed = JSON.parse(jsonMatch[0]) as {
    title?: string;
    direction?: string;
    confidence?: number;
    reason?: string;
    timeHorizon?: string;
  };

  const lead = marketData[0]?.symbol ?? "Crypto";
  const direction = parsed.direction ?? "neutral";
  const confidence = Number(parsed.confidence ?? 70);

  return {
    title: parsed.title?.trim() || `${direction} ${lead} outlook`,
    direction,
    confidence: Number.isFinite(confidence) ? confidence : 70,
    reason: parsed.reason ?? "AI-generated market read",
    timeHorizon: parsed.timeHorizon ?? "24h",
  };
}

export async function runAnalystAgent() {
  const analystAddress = requireEnv("AVM_ADDRESS");
  requireEnv("OPENAI_API_KEY");

  const marketData = await fetchMarketData(["BTC", "ETH", "ALGO", "SOL"]);
  const signal = await generateSignalAnalysis(marketData);
  const price = getDefaultSignalPriceUsdc();

  const created = await createSignal({
    title: signal.title,
    category: "Crypto",
    content: JSON.stringify(signal),
    price_usdc: price,
    embargo_minutes: 0,
    analyst_address: analystAddress,
    analyst_name: "SIGNET Analyst",
    direction: signal.direction,
    confidence: signal.confidence,
    time_horizon: signal.timeHorizon,
  });

  const market = await createAlphaArcadeMarket({
    id: created.id,
    title: created.title,
    direction: signal.direction,
    category: "Crypto",
    time_horizon: signal.timeHorizon,
  });

  await logEvent("analyst_run", `Published "${created.title}" at ${price} USDC`, {
    signalId: created.id,
    marketId: market.marketId,
  });

  const x402Url = `${process.env.X402_SERVER_URL ?? "http://localhost:4021"}/signals/${created.id}`;

  return {
    signalId: created.id,
    title: created.title,
    price,
    x402Url,
    marketId: market.marketId,
    marketUrl: market.url,
    direction: signal.direction,
    category: "Crypto",
    timeHorizon: signal.timeHorizon,
  };
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  runAnalystAgent()
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch(console.error);
}
