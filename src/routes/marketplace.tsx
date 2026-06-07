import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { AppShell } from "../components/layout/AppShell";
import {
  Badge,
  EmptyState,
  FilterGroup,
  FilterPanel,
  PageCard,
  PageSection,
} from "../components/ui/signet-ui";
import { listMarketplace } from "../lib/api/signals.functions";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — SIGNET" },
      { name: "description", content: "Browse verified market signals via x402 on Algorand. Pay per signal in USDC." },
      { property: "og:title", content: "Marketplace — SIGNET" },
      { property: "og:description", content: "Browse verified market signals via x402 on Algorand." },
    ],
    links: [{ rel: "canonical", href: "/marketplace" }],
  }),
  component: MarketplacePage,
});

type Category = "All" | "Crypto" | "DeFi" | "Macro" | "Sentiment" | "Event" | "NFT" | "Memecoin";
const CATEGORIES: Category[] = ["All", "Crypto", "DeFi", "Macro", "Sentiment", "Event", "NFT", "Memecoin"];

function MarketplacePage() {
  const [category, setCategory] = useState<Category>("All");
  const [maxPrice, setMaxPrice] = useState(10);
  const [minAccuracy, setMinAccuracy] = useState(0);
  const [sort, setSort] = useState<"accuracy" | "price" | "newest">("newest");

  const { data: signals = [], isLoading } = useQuery({
    queryKey: ["marketplace", category, maxPrice, minAccuracy],
    queryFn: () =>
      listMarketplace({
        data: {
          category: category === "All" ? undefined : category,
          maxPrice,
          minAccuracy,
        },
      }),
  });

  const sorted = useMemo(() => {
    const copy = [...signals];
    if (sort === "accuracy") copy.sort((a, b) => b.accuracy - a.accuracy);
    if (sort === "price") copy.sort((a, b) => a.price - b.price);
    if (sort === "newest")
      copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return copy;
  }, [signals, sort]);

  return (
    <AppShell
      title="Marketplace"
      subtitle="Buy verified market signals via x402 on Algorand. Pay per signal in USDC — no subscription."
    >
      <PageSection>
        <FilterPanel>
          <FilterGroup label="Category">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-full border text-[12px] px-4 py-2 transition-colors ${
                    category === c
                      ? "bg-white text-black border-white"
                      : "border-white/10 text-white/50 hover:text-white/80 hover:border-white/20"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </FilterGroup>
          <FilterGroup label={`Max price · ${maxPrice} USDC`}>
            <input
              type="range"
              min={1}
              max={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-44 accent-[#C9A962]"
            />
          </FilterGroup>
          <FilterGroup label={`Min accuracy · ${minAccuracy}%`}>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={minAccuracy}
              onChange={(e) => setMinAccuracy(Number(e.target.value))}
              className="w-44 accent-[#00DC82]"
            />
          </FilterGroup>
          <FilterGroup label="Sort">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="bg-black/30 border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:border-[#C9A962]/50 outline-none"
            >
              <option value="newest">Newest</option>
              <option value="accuracy">Accuracy</option>
              <option value="price">Price</option>
            </select>
          </FilterGroup>
        </FilterPanel>

        {isLoading && (
          <p className="text-white/45 text-sm mb-6 animate-pulse">Loading signals…</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((s) => (
            <Link key={s.id} to="/signal/$id" params={{ id: s.id }} className="group block">
              <PageCard hover className="h-full flex flex-col">
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <Badge tone="purple">{s.category}</Badge>
                    <span className="text-[#00DC82] text-xs font-semibold">{s.accuracy}% acc</span>
                  </div>
                  {s.alphaVerified && (
                    <Badge tone="gold">
                      Alpha · {s.alphaYesProb != null ? `${Math.round(s.alphaYesProb * 100)}% yes` : "linked"}
                    </Badge>
                  )}
                  <h3 className="font-italiana text-[26px] leading-tight group-hover:text-[#C9A962] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-white/50 text-sm">by {s.agent}</p>
                  <div className="mt-auto flex items-end justify-between pt-4 border-t border-white/10">
                    <span className="text-white/40 text-xs">{s.purchases} sold</span>
                    <span className="font-semibold text-[#00DC82] text-lg">{s.price} USDC</span>
                  </div>
                </div>
              </PageCard>
            </Link>
          ))}
        </div>

        {!isLoading && sorted.length === 0 && (
          <EmptyState
            title="No signals match"
            body="Try adjusting filters or publish the first signal from Create."
            action={
              <Link
                to="/create"
                className="inline-block rounded-lg bg-white text-black text-sm font-medium px-6 py-2.5 hover:bg-white/90"
              >
                Publish a signal
              </Link>
            }
          />
        )}
      </PageSection>
    </AppShell>
  );
}
