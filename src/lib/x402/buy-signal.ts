import algosdk from "algosdk";
import type { ClientAvmSigner } from "@x402/avm";

import type { WalletKind } from "../../components/wallet/wallets";

function txnToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

type AlgorandProvider = {
  signTxns?: (groups: { txn: Uint8Array | string; signers: string[] }[][]) => Promise<Uint8Array[]>;
};

async function signWithPera(
  address: string,
  txns: Uint8Array[],
  signSet: Set<number>,
): Promise<(Uint8Array | null)[]> {
  const { PeraWalletConnect } = await import("@perawallet/connect");
  const pera = new PeraWalletConnect({ chainId: 416002 });
  const group = txns.map((bytes, i) => ({
    txn: algosdk.decodeUnsignedTransaction(bytes),
    signers: signSet.has(i) ? [address] : [],
  }));
  const signed = await pera.signTransaction([group]);
  return txns.map((_, i) => (signSet.has(i) ? (signed[i] ?? null) : null));
}

async function signWithLute(
  address: string,
  txns: Uint8Array[],
  signSet: Set<number>,
): Promise<(Uint8Array | null)[]> {
  const { default: LuteConnect } = await import("lute-connect");
  const lute = new LuteConnect("SIGNET");
  const walletTxns = txns.map((bytes, i) => ({
    txn: txnToBase64(bytes),
    signers: signSet.has(i) ? [address] : [],
  }));
  const signed = await lute.signTxns(walletTxns);
  return txns.map((_, i) => (signSet.has(i) ? (signed[i] ?? null) : null));
}

async function signWithBrowserExtension(
  address: string,
  txns: Uint8Array[],
  signSet: Set<number>,
): Promise<(Uint8Array | null)[]> {
  const algorand = (window as Window & { algorand?: AlgorandProvider }).algorand;
  if (!algorand?.signTxns) {
    throw new Error("Your wallet cannot sign transactions. Try Pera or Lute.");
  }
  const group = txns.map((bytes, i) => ({
    txn: bytes,
    signers: signSet.has(i) ? [address] : [],
  }));
  const signed = await algorand.signTxns([group]);
  return txns.map((_, i) => (signSet.has(i) ? (signed[i] ?? null) : null));
}

export function createClientAvmSigner(address: string, kind: WalletKind): ClientAvmSigner {
  return {
    address,
    signTransactions: async (txns, indexesToSign) => {
      const signSet = new Set(indexesToSign ?? txns.map((_, i) => i));
      switch (kind) {
        case "pera":
          return signWithPera(address, txns, signSet);
        case "lute":
          return signWithLute(address, txns, signSet);
        case "extension":
          return signWithBrowserExtension(address, txns, signSet);
        default:
          throw new Error("Unsupported wallet");
      }
    },
  };
}

export function friendlyPurchaseError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Purchase failed";

  if (/cancel|reject|denied|closed|user/i.test(message)) {
    return "Payment cancelled in your wallet.";
  }
  if (/opt.?in|10458941/i.test(message)) {
    return "Opt into USDC in your wallet before buying. You can add USDC from the Circle faucet.";
  }
  if (/insufficient|balance|underflow/i.test(message)) {
    return "Not enough USDC in your wallet for this signal.";
  }
  if (/failed to fetch|network|unreachable|cors/i.test(message)) {
    return "Could not reach the payment service. Try again in a moment.";
  }

  return message.length > 160 ? `${message.slice(0, 160)}…` : message;
}

export async function buySignalWithWallet(
  endpoint: string,
  address: string,
  kind: WalletKind,
) {
  const [{ x402Client, wrapFetchWithPayment }, { ExactAvmScheme, ALGORAND_TESTNET_CAIP2 }] =
    await Promise.all([import("@x402/fetch"), import("@x402/avm")]);

  const signer = createClientAvmSigner(address, kind);
  const client = new x402Client();
  client.register(
    ALGORAND_TESTNET_CAIP2,
    new ExactAvmScheme(signer, { algodUrl: "https://testnet-api.algonode.cloud" }),
  );

  const fetchWithPayment = wrapFetchWithPayment(fetch, client);
  const response = await fetchWithPayment(endpoint, { method: "GET" });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Payment failed (${response.status})`);
  }

  return response.json();
}
