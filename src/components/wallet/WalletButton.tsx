import { useWallet } from "./WalletProvider";

export function WalletButton() {
  const { address, walletName, openConnect, disconnect } = useWallet();

  if (address) {
    return (
      <button
        type="button"
        onClick={disconnect}
        title={`${walletName ?? "Wallet"} · ${address}`}
        className="rounded-lg border border-white/10 bg-white/5 text-white/80 text-xs font-medium px-3 py-1.5 hover:bg-white/10 transition-colors max-w-[160px] truncate"
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
