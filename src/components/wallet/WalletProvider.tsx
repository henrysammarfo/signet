import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ConnectWalletDialog } from "./ConnectWalletDialog";
import {
  clearStoredWallet,
  readStoredWallet,
  subscribeStoredWallet,
  writeStoredWallet,
  type StoredWallet,
} from "../../lib/wallet/storage";
import {
  connectWallet,
  reconnectWallet,
  walletLabel,
  type WalletKind,
} from "./wallets";

interface WalletContextValue {
  address: string | null;
  walletKind: WalletKind | null;
  walletName: string | null;
  ready: boolean;
  connecting: boolean;
  error: string | null;
  openConnect: () => void;
  connectWith: (kind: WalletKind) => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredWallet>({ address: null, kind: null });
  const [ready, setReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setStored(readStoredWallet());
    setReady(true);

    return subscribeStoredWallet(() => {
      setStored(readStoredWallet());
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    const { address, kind } = readStoredWallet();
    if (!address || !kind) return;
    void reconnectWallet(kind, address).catch(() => {
      /* Keep stored address visible; wallet re-auth happens on sign */
    });
  }, [ready]);

  const connectWith = useCallback(async (kind: WalletKind) => {
    setConnecting(true);
    setError(null);
    try {
      const account = await connectWallet(kind);
      writeStoredWallet(account, kind);
      setStored({ address: account, kind });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Wallet connection failed";
      setError(message);
      throw e;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    clearStoredWallet();
    setStored({ address: null, kind: null });
    setError(null);
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      address: stored.address,
      walletKind: stored.kind,
      walletName: walletLabel(stored.kind),
      ready,
      connecting,
      error,
      openConnect: () => {
        setError(null);
        setDialogOpen(true);
      },
      connectWith,
      disconnect,
    }),
    [stored, ready, connecting, error, connectWith, disconnect],
  );

  return (
    <WalletContext.Provider value={value}>
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
