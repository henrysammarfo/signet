import { useQuery } from "@tanstack/react-query";

const USDC_ASA = 10458941;

export function useWalletBalance(address: string | null) {
  return useQuery({
    queryKey: ["wallet-balance", address],
    queryFn: async () => {
      if (!address) return null;
      const res = await fetch(`https://testnet-api.algonode.cloud/v2/accounts/${address}`);
      if (!res.ok) throw new Error("Could not load balance");
      const info = (await res.json()) as {
        amount: number;
        assets?: { "asset-id"?: number; assetId?: number; amount: number }[];
      };
      const assets = info.assets ?? [];
      const usdcAsset = assets.find((a) => Number(a.assetId ?? a["asset-id"]) === USDC_ASA);
      return {
        algo: info.amount / 1_000_000,
        usdc: usdcAsset ? Number(usdcAsset.amount) / 1_000_000 : 0,
        usdcOptedIn: Boolean(usdcAsset),
      };
    },
    enabled: Boolean(address),
    refetchInterval: 30_000,
  });
}
