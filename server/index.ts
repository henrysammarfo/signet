import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { cors } from "hono/cors";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import {
  paymentMiddlewareFromHTTPServer,
} from "@x402/hono";
import {
  x402ResourceServer,
  x402HTTPResourceServer,
  HTTPFacilitatorClient,
} from "@x402/core/server";
import type { HTTPRequestContext } from "@x402/core/server";
import { ExactAvmScheme } from "@x402/avm/exact/server";
import { ALGORAND_TESTNET_CAIP2, USDC_TESTNET_ASA_ID } from "@x402/avm";

import { getServerEnv, requireEnv, assertDatabaseConfigured } from "../shared/config/env.ts";
import {
  getSignal,
  getSignalContent,
  priceToX402,
  recordPurchase,
} from "../shared/db/client.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, ".env") });

const env = getServerEnv();
const port = Number(process.env.PORT ?? 4021);

assertDatabaseConfigured();

const facilitatorClient = new HTTPFacilitatorClient({ url: env.facilitatorUrl });
const resourceServer = new x402ResourceServer(facilitatorClient);
resourceServer.register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme());

function signalIdFromPath(path: string): string | null {
  const match = path.match(/\/signals\/([^/?]+)/);
  return match?.[1] ?? null;
}

async function getSignalPrice(context: HTTPRequestContext) {
  const id = signalIdFromPath(context.adapter.getPath());
  const signal = id ? await getSignal(id) : null;
  if (!signal) return "$0.01";
  return priceToX402(signal.price_usdc);
}

async function getSignalPayTo(context: HTTPRequestContext) {
  const id = signalIdFromPath(context.adapter.getPath());
  const signal = id ? await getSignal(id) : null;
  return signal?.analyst_address ?? env.analystAddress;
}

const httpResourceServer = new x402HTTPResourceServer(resourceServer, {
  "GET /signals/:id": {
    accepts: [
      {
        scheme: "exact",
        price: getSignalPrice,
        network: ALGORAND_TESTNET_CAIP2,
        payTo: getSignalPayTo,
        extra: { asset: USDC_TESTNET_ASA_ID },
      },
    ],
    description: "SIGNET signal access — USDC on Algorand testnet",
  },
});

const app = new Hono();

app.use(
  "*",
  cors({
    origin: env.appOrigin.split(",").map((o) => o.trim()),
    allowHeaders: ["Content-Type", "X-PAYMENT", "Payment-Signature", "Authorization"],
    exposeHeaders: ["X-PAYMENT-RESPONSE", "Payment-Response"],
  }),
);

app.get("/health", async (c) => {
  return c.json({
    status: "ok",
    service: "signet-x402",
    network: "algorand-testnet",
    facilitator: env.facilitatorUrl,
    usdcAsa: USDC_TESTNET_ASA_ID,
  });
});

app.use("/signals/:id", async (c, next) => {
  const signal = await getSignal(c.req.param("id"));
  if (!signal) {
    return c.json({ error: "Signal not found" }, 404);
  }

  if (signal.embargo_until && Date.now() < new Date(signal.embargo_until).getTime()) {
    return c.json(
      {
        preview: signal.title,
        embargo_until: signal.embargo_until,
        message: "Signal is time-locked until embargo expires",
      },
      202,
    );
  }

  c.set("signetSignal", signal);
  await next();
});

app.use(paymentMiddlewareFromHTTPServer(httpResourceServer));

app.get("/signals/:id", async (c) => {
  const signal = c.get("signetSignal") ?? (await getSignalContent(c.req.param("id")));
  if (!signal) return c.json({ error: "Signal not found" }, 404);

  const paymentHeader =
    c.req.header("X-PAYMENT") ?? c.req.header("Payment-Signature") ?? undefined;
  const payer = c.req.header("X-PAYMENT-PAYER") ?? env.buyerAddress;

  await recordPurchase({
    signal_id: signal.id,
    buyer_address: payer,
    tx_id: paymentHeader?.slice(0, 128),
    amount_usdc: signal.price_usdc,
  });

  return c.json({
    signal: {
      id: signal.id,
      title: signal.title,
      category: signal.category,
      content: signal.content,
      direction: signal.direction,
      confidence: signal.confidence,
      time_horizon: signal.time_horizon,
      analyst_name: signal.analyst_name,
      analyst_address: signal.analyst_address,
      accuracy_score: signal.accuracy_score,
      alpha_arcade_market_id: signal.alpha_arcade_market_id,
      price_usdc: signal.price_usdc,
      x402_price: priceToX402(signal.price_usdc),
    },
    verified: true,
    network: ALGORAND_TESTNET_CAIP2,
  });
});

serve({ fetch: app.fetch, port }, () => {
  console.log(`SIGNET x402 server — Algorand testnet — http://localhost:${port}`);
  console.log(`Facilitator: ${env.facilitatorUrl}`);
  console.log(`USDC ASA: ${USDC_TESTNET_ASA_ID}`);
});
