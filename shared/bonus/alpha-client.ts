/**
 * Alpha Arcade client factory — uses @alpha-arcade/sdk per:
 * https://github.com/phara23/alpha-sdk
 * https://github.com/phara23/alpha-mcp
 */

import algosdk from "algosdk";
import { AlphaClient } from "@alpha-arcade/sdk";

const TESTNET_MATCHER_APP_ID = Number(process.env.ALPHA_MATCHER_APP_ID ?? "0");
const TESTNET_USDC_ASA_ID = Number(process.env.ALPHA_USDC_ASA_ID ?? "10458941");
const MAINNET_MATCHER_APP_ID = 3078581851;
const MAINNET_USDC_ASA_ID = 31566704;

export function getAlphaNetwork() {
  return (process.env.ALPHA_NETWORK ?? "testnet") as "testnet" | "mainnet";
}

export function createAlphaClient(options?: { mnemonic?: string; readOnly?: boolean }) {
  const network = getAlphaNetwork();
  const algodHost =
    network === "mainnet"
      ? process.env.ALPHA_ALGOD_SERVER ?? "https://mainnet-api.algonode.cloud"
      : process.env.ALPHA_ALGOD_SERVER ?? "https://testnet-api.algonode.cloud";
  const indexerHost =
    network === "mainnet"
      ? process.env.ALPHA_INDEXER_SERVER ?? "https://mainnet-idx.algonode.cloud"
      : process.env.ALPHA_INDEXER_SERVER ?? "https://testnet-idx.algonode.cloud";

  const algodClient = new algosdk.Algodv2("", algodHost, 443);
  const indexerClient = new algosdk.Indexer("", indexerHost, 443);

  const mnemonic =
    options?.mnemonic ?? process.env.ALPHA_MNEMONIC ?? process.env.ANALYST_MNEMONIC ?? "";
  const readOnly = options?.readOnly ?? !mnemonic;

  let signer: algosdk.TransactionSigner = async () => [];
  let activeAddress = process.env.AVM_ADDRESS ?? process.env.ANALYST_ADDRESS ?? "";

  if (!readOnly && mnemonic) {
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    signer = algosdk.makeBasicAccountTransactionSigner(account);
    activeAddress = account.addr.toString();
  } else if (!activeAddress) {
    activeAddress = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
  }

  const matcherAppId =
    network === "mainnet"
      ? MAINNET_MATCHER_APP_ID
      : TESTNET_MATCHER_APP_ID || MAINNET_MATCHER_APP_ID;
  const usdcAssetId =
    network === "mainnet" ? MAINNET_USDC_ASA_ID : TESTNET_USDC_ASA_ID;

  return new AlphaClient({
    algodClient,
    indexerClient,
    signer,
    activeAddress,
    matcherAppId,
    usdcAssetId,
    apiKey: process.env.ALPHA_API_KEY,
    apiBaseUrl: process.env.ALPHA_API_BASE_URL ?? "https://platform.alphaarcade.com/api",
  });
}

export async function findMatchingAlphaMarket(signal: {
  title: string;
  category: string;
  direction: string;
}) {
  try {
    const client = createAlphaClient({ readOnly: true });
    const markets = await client.getMarkets();
    if (!markets.length) return null;

    const keywords = extractKeywords(signal.title, signal.category);
    let best = markets[0];
    let bestScore = 0;

    for (const market of markets) {
      const haystack = `${market.title} ${market.slug ?? ""}`.toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (haystack.includes(kw)) score += 2;
      }
      if (signal.category && haystack.includes(signal.category.toLowerCase())) score += 1;

      const signalBullish = signal.direction === "bullish" || signal.direction === "yes";
      const signalBearish = signal.direction === "bearish" || signal.direction === "no";
      if (signal.direction === "neutral") score += 1;
      else if (signalBullish && market.yesProb >= 0.5) score += 2;
      else if (signalBearish && market.yesProb < 0.5) score += 2;

      if (market.isLive !== false) score += 1;
      if ((market.volume ?? 0) > 0) score += 1;

      if (score > bestScore) {
        bestScore = score;
        best = market;
      }
    }

    if (!best.marketAppId && best.id) {
      const full = await client.getMarket(best.id);
      if (full?.marketAppId) best = full;
    }

    if (!best.marketAppId) {
      console.warn("[alpha] matched market has no on-chain app id:", best.title);
      return null;
    }

    return {
      marketId: best.id ?? String(best.marketAppId),
      marketAppId: best.marketAppId,
      slug: best.slug,
      title: best.title,
      yesProb: best.yesProb,
      url: best.slug
        ? `https://alphaarcade.com/market/${best.slug}`
        : `https://alphaarcade.com/market/${best.marketAppId}`,
      matchedScore: bestScore,
      source: "alpha_api",
    };
  } catch (error) {
    console.warn("[alpha] market discovery failed:", error);
    return null;
  }
}

export async function getMarketImpliedYes(marketAppId: number) {
  const client = createAlphaClient({ readOnly: true });
  const book = await client.getOrderbook(marketAppId);
  const yesMid = book.yes.bids[0]?.price ?? book.yes.asks[0]?.price ?? 500_000;
  return { impliedYes: yesMid / 1_000_000, marketAppId };
}

export async function verifySignalAgainstMarket(
  signal: { direction?: string; alpha_arcade_market_id?: string },
  marketAppId?: number,
) {
  if (!marketAppId) return { verified: false, reason: "no_market_linked" };

  try {
    const { impliedYes } = await getMarketImpliedYes(marketAppId);
    const marketLeansYes = impliedYes >= 0.5;
    const signalBullish = signal.direction === "bullish" || signal.direction === "yes";

    const aligned =
      signal.direction === "neutral"
        ? true
        : signalBullish === marketLeansYes;

    return {
      verified: aligned,
      impliedYes,
      marketAppId,
      method: "orderbook_midpoint",
    };
  } catch (error) {
    return {
      verified: false,
      reason: error instanceof Error ? error.message : "orderbook_unavailable",
      method: "orderbook_unavailable",
    };
  }
}

function extractKeywords(title: string, category: string) {
  const base = `${title} ${category}`.toLowerCase();
  const tokens = ["btc", "bitcoin", "eth", "ethereum", "algo", "algorand", "sol", "solana", "defi", "macro"];
  return tokens.filter((t) => base.includes(t));
}
