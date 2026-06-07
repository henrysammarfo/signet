export type AlphaMarketMeta = {
  marketId: string;
  marketAppId?: number;
  slug?: string;
  url?: string;
  title?: string;
  yesProb?: number;
};

export function encodeAlphaMarketMeta(meta: AlphaMarketMeta): string {
  if (meta.url && !meta.marketAppId) return meta.url;
  return JSON.stringify(meta);
}

export function parseAlphaMarketMeta(raw?: string | null): AlphaMarketMeta | null {
  if (!raw?.trim()) return null;
  if (raw.startsWith("http")) return { marketId: raw, url: raw };
  try {
    const parsed = JSON.parse(raw) as AlphaMarketMeta;
    if (parsed.marketId || parsed.marketAppId) return parsed;
  } catch {
    return { marketId: raw, url: `https://alphaarcade.com/market/${raw}` };
  }
  return { marketId: raw };
}

export function alphaMarketLink(meta: AlphaMarketMeta | null): string | null {
  if (!meta) return null;
  if (meta.url) return meta.url;
  if (meta.slug) return `https://alphaarcade.com/market/${meta.slug}`;
  if (meta.marketAppId) return `https://alphaarcade.com/market/${meta.marketAppId}`;
  return meta.marketId.startsWith("http")
    ? meta.marketId
    : `https://alphaarcade.com/market/${meta.marketId}`;
}
