import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { WALLET_OPTIONS, type WalletKind } from "./wallets";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (kind: WalletKind) => Promise<void>;
  connecting: boolean;
  error: string | null;
};

export function ConnectWalletDialog({ open, onOpenChange, onSelect, connecting, error }: Props) {
  const [pending, setPending] = useState<WalletKind | null>(null);

  const handleSelect = async (kind: WalletKind) => {
    setPending(kind);
    try {
      await onSelect(kind);
      onOpenChange(false);
    } finally {
      setPending(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-medium">Connect wallet</DialogTitle>
          <DialogDescription className="text-white/45 text-[13px]">
            Choose your Algorand wallet. One connection works across all of SIGNET.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 mt-2">
          {WALLET_OPTIONS.map((wallet) => (
            <button
              key={wallet.id}
              type="button"
              disabled={connecting || pending !== null}
              onClick={() => handleSelect(wallet.id)}
              className="flex items-start gap-3 w-full text-left rounded-xl border border-white/[0.08] bg-black px-4 py-3.5 hover:border-white/20 hover:bg-white/[0.03] disabled:opacity-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white/90">{wallet.name}</span>
                  {wallet.badge && (
                    <span className="text-[10px] text-white/50 bg-white/10 px-1.5 py-0.5 rounded">
                      {wallet.badge}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-white/40 mt-1 leading-relaxed">{wallet.description}</p>
              </div>
              <span className="text-[11px] text-white/30 shrink-0 pt-0.5">
                {pending === wallet.id ? "…" : "→"}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <p className="text-[12px] text-red-400/90 mt-2 leading-relaxed">{error}</p>
        )}

        <p className="text-[11px] text-white/25 mt-3 leading-relaxed">
          Browse the marketplace without a wallet. Connect when you want to publish, buy, or manage
          treasury.
        </p>
      </DialogContent>
    </Dialog>
  );
}
