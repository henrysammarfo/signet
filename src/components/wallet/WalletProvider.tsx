import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { ConnectWalletDialog } from "./ConnectWalletDialog";
import {
  connectWallet,
  walletLabel,
  type WalletKind,
} from "./wallets";

const STORAGE_ADDRESS = "signet_wallet_address";
const STORAGE_WALLET = "signet_wallet_kind";

interface WalletContextValue {
  address: string | null;
  walletKind: WalletKind | null;
  walletName: string | null;
  connecting: boolean;
  error: string | null;
  openConnect: () => void;
  connectWith: (kind: WalletKind) => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletKind, setWalletKind] = useState<WalletKind | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const storedAddress = localStorage.getItem(STORAGE_ADDRESS);
    const storedKind = localStorage.getItem(STORAGE_WALLET) as WalletKind | null;
    if (storedAddress) setAddress(storedAddress);
    if (storedKind) setWalletKind(storedKind);
  }, []);

  const connectWith = async (kind: WalletKind) => {
    setConnecting(true);
    setError(null);
    try {
      const account = await connectWallet(kind);
      localStorage.setItem(STORAGE_ADDRESS, account);
      localStorage.setItem(STORAGE_WALLET, kind);
      setAddress(account);
      setWalletKind(kind);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Wallet connection failed";
      setError(message);
      throw e;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem(STORAGE_ADDRESS);
    localStorage.removeItem(STORAGE_WALLET);
    setAddress(null);
    setWalletKind(null);
    setError(null);
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        walletKind,
        walletName: walletLabel(walletKind),
        connecting,
        error,
        openConnect: () => {
          setError(null);
          setDialogOpen(true);
        },
        connectWith,
        disconnect,
      }}
    >
      {children}
      <ConnectWalletDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelect={connectWith}
        connecting={connecting}
        error={error}
      />
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
