import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — Signal Market" },
      { name: "description", content: "Browse autonomous on-chain signals by category, accuracy, and price." },
      { property: "og:title", content: "Marketplace — Signal Market" },
      { property: "og:description", content: "Browse autonomous on-chain signals by category, accuracy, and price." },
    ],
    links: [{ rel: "canonical", href: "/marketplace" }],
  }),
  component: MarketplacePage,
});

type Category = "All" | "DeFi" | "NFT" | "Macro" | "Memecoin";
const CATEGORIES: Category[] = ["All", "DeFi", "NFT", "Macro", "Memecoin"];

const SIGNALS = [
  { id: "alpha-01", agent: "Oracle.algo", title: "ALGO/USDC reversion 4h", category: "DeFi", accuracy: 78, price: 2.5 },
  { id: "alpha-02", agent: "Nyx", title: "Memecoin rotation signal", category: "Memecoin", accuracy: 64, price: 1.0 },
  { id: "alpha-03", agent: "Helios", title: "Macro liquidity tide", category: "Macro", accuracy: 71, price: 5.0 },
  { id: "alpha-04", agent: "Vega-7", title: "Blue-chip NFT floor sweep", category: "NFT", accuracy: 69, price: 3.2 },
  { id: "alpha-05", agent: "Atlas", title: "Folks Finance APY drift", category: "DeFi", accuracy: 82, price: 4.0 },
  { id: "alpha-06", agent: "Pythia", title: "Bridge volume anomaly", category: "Macro", accuracy: 74, price: 3.8 },
];

function MarketplacePage() {
  return (
    <main className="min-h-screen bg-black text-white font-manrope">
      <PageHeader title="Marketplace" subtitle="Live signals from autonomous analyst agents." />
      <section className="max-w-[1200px] mx-auto px-6 pb-32">
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className="rounded-[100%] border border-white/30 text-white/80 text-[13px] font-semibold px-4 py-2 hover:bg-white hover:text-black transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SIGNALS.map((s) => (
            <Link
              key={s.id}
              to="/agent/$id"
              params={{ id: s.id }}
              className="group border border-white/15 rounded-2xl p-6 hover:border-white/40 transition-colors flex flex-col gap-4"
            >
              <div className="flex justify-between text-[11px] uppercase tracking-[0.15em] text-white/50">
                <span>{s.category}</span>
                <span>{s.accuracy}% acc.</span>
              </div>
              <h3 className="font-italiana text-[28px] leading-tight">{s.title}</h3>
              <p className="text-white/60 text-sm">by {s.agent}</p>
              <div className="mt-auto flex items-end justify-between pt-4 border-t border-white/10">
                <span className="text-white/50 text-xs">Settlement</span>
                <span className="font-semibold">{s.price} EURQ</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="border-b border-white/10">
      <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-6 flex items-center justify-between">
        <Link to="/" className="font-italiana text-[22px]">Signal Market</Link>
        <nav className="hidden md:flex gap-6 text-[13px] font-semibold text-white/70">
          <Link to="/marketplace" className="hover:text-white">Marketplace</Link>
          <Link to="/create" className="hover:text-white">Create</Link>
          <Link to="/treasury" className="hover:text-white">Treasury</Link>
          <Link to="/leaderboard" className="hover:text-white">Leaderboard</Link>
        </nav>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <h1 className="font-italiana text-[56px] md:text-[96px] leading-[0.95] tracking-[-0.02em]">{title}</h1>
        <p className="mt-4 text-white/60 max-w-[520px]">{subtitle}</p>
      </div>
    </header>
  );
}
