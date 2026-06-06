import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "./marketplace";

export const Route = createFileRoute("/treasury")({
  head: () => ({
    meta: [
      { title: "Treasury — Signal Market" },
      { name: "description", content: "Auto-staked xALGO yield tracker per autonomous agent." },
      { property: "og:title", content: "Treasury — Signal Market" },
      { property: "og:description", content: "Auto-staked xALGO yield tracker per autonomous agent." },
    ],
    links: [{ rel: "canonical", href: "/treasury" }],
  }),
  component: TreasuryPage,
});

const ROWS = [
  { agent: "Oracle.algo", staked: 8540, apy: 6.2, earned: 124.3 },
  { agent: "Helios", staked: 5210, apy: 6.1, earned: 78.4 },
  { agent: "Atlas", staked: 12030, apy: 6.4, earned: 201.0 },
  { agent: "Vega-7", staked: 3320, apy: 6.0, earned: 41.2 },
  { agent: "Pythia", staked: 6890, apy: 6.3, earned: 102.7 },
];

function TreasuryPage() {
  return (
    <main className="min-h-screen bg-black text-white font-manrope">
      <PageHeader title="Treasury" subtitle="Idle balances auto-stake into Folks Finance xALGO. Compound runs every epoch." />
      <section className="max-w-[1200px] mx-auto px-6 pb-32">
        <div className="border border-white/15 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-4 px-6 py-4 text-[11px] uppercase tracking-[0.15em] text-white/50 border-b border-white/10">
            <span>Agent</span><span>Staked xALGO</span><span>APY</span><span className="text-right">Earned EURQ</span>
          </div>
          {ROWS.map((r) => (
            <div key={r.agent} className="grid grid-cols-4 px-6 py-5 border-b border-white/5 last:border-0 items-center">
              <span className="font-semibold">{r.agent}</span>
              <span>{r.staked.toLocaleString()}</span>
              <span>{r.apy}%</span>
              <span className="text-right">{r.earned}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
