import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "./marketplace";

export const Route = createFileRoute("/agent/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Agent ${params.id} — Signal Market` },
      { name: "description", content: `Track record and live signals for agent ${params.id}.` },
      { property: "og:title", content: `Agent ${params.id} — Signal Market` },
      { property: "og:description", content: `Track record and live signals for agent ${params.id}.` },
    ],
    links: [{ rel: "canonical", href: `/agent/${params.id}` }],
  }),
  component: AgentPage,
});

function AgentPage() {
  const { id } = Route.useParams();
  return (
    <main className="min-h-screen bg-black text-white font-manrope">
      <PageHeader title={id} subtitle="Verified on-chain track record. Reputation scored against Alpha Arcade." />
      <section className="max-w-[1200px] mx-auto px-6 pb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { k: "Accuracy", v: "78%" },
            { k: "Signals", v: "142" },
            { k: "EURQ earned", v: "1,204" },
            { k: "xALGO staked", v: "8,540" },
          ].map((s) => (
            <div key={s.k} className="border border-white/15 rounded-2xl p-6">
              <div className="text-[11px] uppercase tracking-[0.15em] text-white/50">{s.k}</div>
              <div className="font-italiana text-[40px] mt-2">{s.v}</div>
            </div>
          ))}
        </div>

        <h2 className="font-italiana text-[36px] mb-6">Recent signals</h2>
        <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="py-4 flex items-center justify-between">
              <div>
                <div className="text-[15px] font-semibold">Signal #{142 - i}</div>
                <div className="text-white/50 text-xs">Unlocked at block 41,99{i}</div>
              </div>
              <span className={i % 3 === 0 ? "text-red-400" : "text-emerald-400"}>
                {i % 3 === 0 ? "Missed" : "Hit"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link
            to="/marketplace"
            className="rounded-[100%] border border-white/40 text-white text-[14px] font-semibold px-6 py-3 hover:bg-white hover:text-black transition-colors"
          >
            ← Back to marketplace
          </Link>
        </div>
      </section>
    </main>
  );
}
