import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { x402Client, wrapFetchWithPayment, x402HTTPClient } from "@x402/fetch";
import { toClientAvmSigner, ExactAvmScheme, ALGORAND_TESTNET_CAIP2 } from "@x402/avm";
import algosdk from "algosdk";

import { getServerEnv } from "../../shared/config/env.ts";
import { listMarketplace, logEvent } from "../../shared/db/client.ts";
import { verifyAlphaForSignal } from "../../shared/bonus/arcade.ts";
import { ensureUsdcOptIn, getUsdcBalance } from "../../shared/wallet/usdc.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../.env") });
config({ path: resolve(__dirname, "../../.env.local") });

function getSecretKeyFromMnemonic(mnemonic: string): string {
  const account = algosdk.mnemonicToSecretKey(mnemonic);
  return Buffer.from(account.sk).toString("base64");
}

export async function runBuyerAgent() {
  const env = getServerEnv();
  const x402Base = env.x402ServerUrl;

  const health = await fetch(`${x402Base}/health`);
  if (!health.ok) {
    throw new Error(
      `x402 server unreachable at ${x402Base}. Start with: npm run server:start`,
    );
  }

  const signals = await listMarketplace({ minAccuracy: 0, maxPrice: 100 });
  if (!signals.length) {
    throw new Error("No signals in marketplace. Publish a signal first.");
  }

  await ensureUsdcOptIn(env.buyerMnemonic);
  const balance = await getUsdcBalance(env.buyerAddress);
  if (!balance.optedIn) {
    throw new Error("Buyer wallet must opt into USDC ASA 10458941 before paying.");
  }

  const affordable = signals.filter((s) => s.price_usdc <= balance.usdc);
  if (!affordable.length) {
    throw new Error(
      `Insufficient USDC (${balance.usdc} available, cheapest signal ${Math.min(...signals.map((s) => s.price_usdc))} USDC). Fund via Circle faucet.`,
    );
  }

  const best = [...affordable].sort(
    (a, b) => (b.accuracy_score || b.confidence || 0) - (a.accuracy_score || a.confidence || 0),
  )[0];

  const url = `${x402Base}/signals/${best.id}`;
  const secretKey = getSecretKeyFromMnemonic(env.buyerMnemonic);
  const avmSigner = toClientAvmSigner(secretKey);
  const client = new x402Client();
  client.register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme(avmSigner));

  const fetchWithPayment = wrapFetchWithPayment(fetch, client);
  const response = await fetchWithPayment(url, { method: "GET" });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`x402 purchase failed (${response.status}): ${body}`);
  }

  const paymentResponse = new x402HTTPClient(client).getPaymentSettleResponse((name) =>
    response.headers.get(name),
  );

  const payload = await response.json();
  const txId =
    typeof paymentResponse === "object" && paymentResponse && "transaction" in paymentResponse
      ? String((paymentResponse as { transaction?: string }).transaction ?? "")
      : undefined;

  await logEvent(
    "buyer_run",
    `Buyer Agent → paid ${best.price_usdc} USDC → Signal #${best.id.slice(0, 8)} → ✓ Delivered`,
    { signalId: best.id, payment: paymentResponse, txId, mode: "live" },
  );

  const alphaVerification = await verifyAlphaForSignal(best.id);

  return {
    mode: "live" as const,
    signalId: best.id,
    title: best.title,
    price: best.price_usdc,
    direction: best.direction,
    category: best.category,
    timeHorizon: best.time_horizon,
    payment: paymentResponse,
    txId,
    signal: payload,
    x402Url: url,
    analystAddress: best.analyst_address,
    alphaVerification,
  };
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  runBuyerAgent()
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
