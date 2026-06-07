import algosdk from "algosdk";

const USDC_TESTNET_ASA = Number(process.env.ALPHA_USDC_ASA_ID ?? "10458941");

export function getAlgodClient() {
  const url = process.env.ALGORAND_ALGOD_URL ?? "https://testnet-api.algonode.cloud";
  const port = url.includes("localhost") ? 4001 : 443;
  return new algosdk.Algodv2("", url, port);
}

function assetIdOf(entry: Record<string, unknown>): number {
  const raw = entry.assetId ?? entry["asset-id"];
  return Number(raw);
}

export async function getUsdcBalance(address: string) {
  const algod = getAlgodClient();
  const info = await algod.accountInformation(address).do();
  const assets = (info.assets ?? []) as Record<string, unknown>[];
  const asset = assets.find((a) => assetIdOf(a) === USDC_TESTNET_ASA);
  const wrongUsdc = assets.find(
    (a) => assetIdOf(a) !== USDC_TESTNET_ASA && Number(a.amount ?? 0) > 0,
  );
  return {
    optedIn: Boolean(asset),
    microUsdc: asset ? Number(asset.amount) : 0,
    usdc: asset ? Number(asset.amount) / 1_000_000 : 0,
    asaId: USDC_TESTNET_ASA,
    wrongAsaHint:
      wrongUsdc && Number(asset?.amount ?? 0) === 0
        ? `You hold ${Number(wrongUsdc.amount) / 1_000_000} USDC on ASA ${assetIdOf(wrongUsdc)} — x402 needs Circle testnet USDC (ASA ${USDC_TESTNET_ASA}). Use faucet.circle.com.`
        : undefined,
  };
}

/** Opt buyer/analyst into testnet USDC ASA (required before x402 payments). */
export async function ensureUsdcOptIn(mnemonic: string) {
  const algod = getAlgodClient();
  const account = algosdk.mnemonicToSecretKey(mnemonic);
  const address = account.addr.toString();
  const existing = await getUsdcBalance(address);
  if (existing.optedIn) return { address, ...existing, txId: null };

  const params = await algod.getTransactionParams().do();
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: address,
    receiver: address,
    amount: 0,
    assetIndex: USDC_TESTNET_ASA,
    suggestedParams: params,
  });
  const signed = txn.signTxn(account.sk);
  const { txId } = await algod.sendRawTransaction(signed).do();
  try {
    await algosdk.waitForConfirmation(algod, txId, 20);
  } catch {
    // Tx may still land after slow rounds — re-check opt-in below.
  }
  const after = await getUsdcBalance(address);
  if (!after.optedIn) {
    throw new Error(`USDC opt-in pending or failed (tx ${txId}). Retry in a few seconds.`);
  }
  return { address, ...after, txId };
}

export async function getWalletReadiness(buyerMnemonic: string, buyerAddress: string) {
  const buyer = await getUsdcBalance(buyerAddress);
  let optInTxId: string | null = null;

  if (!buyer.optedIn) {
    try {
      const result = await ensureUsdcOptIn(buyerMnemonic);
      optInTxId = result.txId;
      Object.assign(buyer, { optedIn: result.optedIn, usdc: result.usdc, microUsdc: result.microUsdc });
    } catch (error) {
      return {
        ready: false,
        buyer,
        optInTxId,
        error: error instanceof Error ? error.message : "usdc_opt_in_failed",
        hint: "Fund buyer with testnet USDC at faucet.circle.com, then retry.",
      };
    }
  }

  return {
    ready: buyer.optedIn && buyer.usdc > 0,
    buyer,
    optInTxId,
    hint: buyer.wrongAsaHint
      ?? (buyer.usdc <= 0 ? "Opted in but Circle USDC (ASA 10458941) balance is 0 — use faucet.circle.com." : undefined),
  };
}
