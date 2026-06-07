export type WalletKind = "pera" | "lute" | "extension";

export type WalletOption = {
  id: WalletKind;
  name: string;
  description: string;
  badge?: string;
};

export const WALLET_OPTIONS: WalletOption[] = [
  {
    id: "pera",
    name: "Pera Wallet",
    description: "Mobile app or browser extension. Scan QR on desktop.",
    badge: "Popular",
  },
  {
    id: "lute",
    name: "Lute",
    description: "Chrome extension built for Algorand developers.",
  },
  {
    id: "extension",
    name: "Browser extension",
    description: "Defly, Exodus, Daffi, and other wallets with Algorand support.",
  },
];

const TESTNET_GENESIS_URL = "https://testnet-api.algonode.cloud/genesis";

type AlgorandProvider = {
  enable?: () => Promise<string[]>;
};

async function fetchTestnetGenesisId() {
  const res = await fetch(TESTNET_GENESIS_URL);
  if (!res.ok) throw new Error("Could not reach Algorand testnet");
  const genesis = (await res.json()) as { network?: string; id?: string };
  return `${genesis.network}-${genesis.id}`;
}

async function connectBrowserExtension() {
  const algorand = (window as Window & { algorand?: AlgorandProvider }).algorand;
  if (!algorand?.enable) {
    throw new Error("No Algorand browser wallet detected. Install Pera or Lute.");
  }
  const accounts = await algorand.enable();
  const account = accounts[0];
  if (!account) throw new Error("Wallet did not return an account.");
  return account;
}

async function connectLute() {
  const { default: LuteConnect } = await import("lute-connect");
  const lute = new LuteConnect("SIGNET");
  const genesisID = await fetchTestnetGenesisId();
  const accounts = await lute.connect(genesisID);
  const account = accounts[0];
  if (!account) throw new Error("Lute connection was cancelled.");
  return account;
}

async function connectPera() {
  const { PeraWalletConnect } = await import("@perawallet/connect");
  const pera = new PeraWalletConnect({ chainId: 416002 });
  const accounts = await pera.connect();
  const account = accounts[0];
  if (!account) throw new Error("Pera connection was cancelled.");
  return account;
}

export async function connectWallet(kind: WalletKind): Promise<string> {
  switch (kind) {
    case "pera":
      return connectPera();
    case "lute":
      return connectLute();
    case "extension":
      return connectBrowserExtension();
    default:
      throw new Error("Unsupported wallet");
  }
}

export function walletLabel(kind: WalletKind | null): string | null {
  if (!kind) return null;
  return WALLET_OPTIONS.find((w) => w.id === kind)?.name ?? null;
}
