import { useWallet } from "./WalletProvider";

export function WalletButton() {
  const { address, walletName, ready, openConnect, disconnect } = useWallet();

  if (!ready) {
    return (
      <div
        className="h-8 w-[108px] rounded-lg bg-white/5 animate-pulse"
        aria-hidden
      />
    );
  }

  if (address) {
    return (
      <button
        type="button"
        onClick={disconnect}
        title={`${walletName ?? "Wallet"} · ${address}`}
        className="rounded-lg border border-[#00DC82]/30 bg-[#00DC82]/10 text-[#00DC82] text-xs font-medium px-3 py-1.5 hover:bg-[#00DC82]/15 transition-colors max-w-[160px] truncate"
      >
        {address.slice(0, 4)}…{address.slice(-4)}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openConnect}
      className="rounded-lg bg-white text-black text-xs font-medium px-3 py-1.5 hover:bg-white/90 transition-colors"
    >
      Connect wallet
    </button>
  );
}
