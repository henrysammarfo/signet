import type { WalletKind } from "../../components/wallet/wallets";

export const STORAGE_ADDRESS = "signet_wallet_address";
export const STORAGE_WALLET = "signet_wallet_kind";
export const WALLET_CHANGE_EVENT = "signet-wallet-change";

export type StoredWallet = {
  address: string | null;
  kind: WalletKind | null;
};

const VALID_KINDS = new Set<WalletKind>(["pera", "lute", "extension"]);

function isWalletKind(value: string | null): value is WalletKind {
  return value !== null && VALID_KINDS.has(value as WalletKind);
}

export function readStoredWallet(): StoredWallet {
  if (typeof window === "undefined") {
    return { address: null, kind: null };
  }

  const address = localStorage.getItem(STORAGE_ADDRESS);
  const kindRaw = localStorage.getItem(STORAGE_WALLET);
  const kind = isWalletKind(kindRaw) ? kindRaw : null;

  if (address && !kind) {
    return { address, kind: "extension" };
  }

  return { address, kind };
}

export function writeStoredWallet(address: string, kind: WalletKind) {
  localStorage.setItem(STORAGE_ADDRESS, address);
  localStorage.setItem(STORAGE_WALLET, kind);
  window.dispatchEvent(new Event(WALLET_CHANGE_EVENT));
}

export function clearStoredWallet() {
  localStorage.removeItem(STORAGE_ADDRESS);
  localStorage.removeItem(STORAGE_WALLET);
  window.dispatchEvent(new Event(WALLET_CHANGE_EVENT));
}

export function subscribeStoredWallet(onStoreChange: () => void) {
  const onChange = () => onStoreChange();
  window.addEventListener(WALLET_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(WALLET_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
