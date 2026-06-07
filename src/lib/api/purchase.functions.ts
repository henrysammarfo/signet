import { createServerFn } from "@tanstack/react-start";
import algosdk from "algosdk";
import { z } from "zod";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { ALGORAND_TESTNET_CAIP2, ExactAvmScheme, toClientAvmSigner } from "@x402/avm";

import { getServerConfig } from "../config.server";
import { getSignal } from "../db";

function buyerSignerFromMnemonic(mnemonic: string) {
  const account = algosdk.mnemonicToSecretKey(mnemonic);
  return toClientAvmSigner(Buffer.from(account.sk).toString("base64"));
}

export const purchaseSignal = createServerFn({ method: "POST" })
  .inputValidator(z.object({ signalId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const config = getServerConfig();

    if (!config.supabaseConfigured) {
      throw new Error("Supabase is not configured.");
    }
    if (!config.buyerMnemonic || !config.x402ServerUrl) {
      throw new Error("Payments are temporarily unavailable. Please try again later.");
    }

    const signal = await getSignal(data.signalId);
    if (!signal) {
      throw new Error("Signal not found.");
    }

    const health = await fetch(`${config.x402ServerUrl}/health`, {
      signal: AbortSignal.timeout(8000),
    }).catch(() => null);
    if (!health?.ok) {
      throw new Error("Payment service is unavailable. Please try again in a moment.");
    }

    const url = `${config.x402ServerUrl}/signals/${signal.id}`;
    const signer = buyerSignerFromMnemonic(config.buyerMnemonic);
    const client = new x402Client();
    client.register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme(signer));

    const fetchWithPayment = wrapFetchWithPayment(fetch, client);
    const response = await fetchWithPayment(url, { method: "GET" });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`x402 payment failed (${response.status}): ${body.slice(0, 240)}`);
    }

    return response.json();
  });
