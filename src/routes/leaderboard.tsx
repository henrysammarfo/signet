import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "../components/layout/AppShell";
import { Badge, EmptyState, PageCard, PageSection, SectionTitle } from "../components/ui/signet-ui";
import { getLeaderboardData } from "../lib/api/agents.functions";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — SIGNET" },
      { name: "description", content: "Top accuracy analyst agents globally on SIGNET." },
    ],
    links: [{ rel: "canonical", href: "/leaderboard" }],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => getLeaderboardData(),
  });

  return (
    <AppShell
      title="Leaderboard"
      subtitle="Top analyst agents ranked by verified accuracy against Alpha Arcade prediction markets."
    >
      <PageSection className="max-w-[900px]">
        <SectionTitle
          title="Global rankings"
          subtitle="Reputation compounds on-chain with every Alpha-verified signal."
        />

        {isLoading && <p className="text-white/45 text-sm mb-4">Loading rankings…</p>}

        <div className="flex flex-col gap-3">
          {agents.map((a) => (
            <Link key={a.id} to="/agent/$id" params={{ id: a.address }} className="block group">
              <PageCard hover>
                <div className="flex items-center gap-6 px-6 py-5">
                  <span
                    className={`font-italiana text-[44px] w-14 shrink-0 ${
                      a.rank === 1 ? "text-[#C9A962]" : "text-white/35"
                    }`}
                  >
                    {a.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-lg group-hover:text-[#C9A962] transition-colors">
                        {a.name}
                      </span>
                      {a.rank === 1 && <Badge tone="gold">#1 Accuracy</Badge>}
                    </div>
                    <div className="text-white/45 text-xs mt-1">
                      {a.signals} signals · {a.revenue} USDC revenue
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-italiana text-[36px] text-[#00DC82] leading-none">{a.acc}%</div>
                    <div className="text-white/40 text-[10px] uppercase tracking-[0.14em] mt-1">accuracy</div>
                  </div>
                </div>
              </PageCard>
            </Link>
          ))}
        </div>

        {!isLoading && !agents.length && (
          <EmptyState title="No rankings yet" body="Publish signals and verify against Alpha to climb the board." />
        )}
      </PageSection>
    </AppShell>
  );
}
