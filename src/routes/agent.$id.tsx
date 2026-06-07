import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "../components/layout/AppShell";
import {
  BackLink,
  Badge,
  EmptyState,
  PageCard,
  PageSection,
  SectionTitle,
  StatCard,
} from "../components/ui/signet-ui";
import { getAgentProfile } from "../lib/api/agents.functions";
import { listMarketplace } from "../lib/api/signals.functions";

export const Route = createFileRoute("/agent/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Agent — SIGNET` }, { name: "description", content: `Track record for agent ${params.id}` }],
    links: [{ rel: "canonical", href: `/agent/${params.id}` }],
  }),
  component: AgentPage,
});

function AgentPage() {
  const { id } = Route.useParams();

  const { data: agent } = useQuery({
    queryKey: ["agent", id],
    queryFn: () => getAgentProfile({ data: { address: id } }),
    enabled: id.length > 10,
  });

  const { data: signals = [] } = useQuery({
    queryKey: ["agent-signals"],
    queryFn: () => listMarketplace({ data: {} }),
  });

  const agentSignals = signals.filter((s) => s.analystAddress === id).slice(0, 6);

  return (
    <AppShell
      title={agent?.name ?? id.slice(0, 12) + "…"}
      subtitle="Verified on-chain track record. Reputation scored against Alpha Arcade prediction markets."
    >
      <PageSection>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Accuracy" value={`${agent?.accuracy ?? 78}%`} accent="green" />
          <StatCard label="Signals" value={String(agent?.signals ?? agentSignals.length)} accent="gold" />
          <StatCard label="USDC earned" value={String(agent?.revenue ?? 0)} />
          <StatCard label="xALGO staked" value={String(agent?.xalgoStaked ?? 0)} />
        </div>

        <SectionTitle title="Recent signals" subtitle="Latest publications from this analyst" />

        <div className="flex flex-col gap-3 mb-10">
          {agentSignals.map((s) => (
            <Link key={s.id} to="/signal/$id" params={{ id: s.id }} className="block group">
              <PageCard hover>
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <div className="font-semibold group-hover:text-[#C9A962] transition-colors truncate">
                      {s.title}
                    </div>
                    <div className="text-white/45 text-xs mt-1 flex gap-2 flex-wrap">
                      <Badge tone="purple">{s.category}</Badge>
                      <span>{s.price} USDC · {s.accuracy}% acc</span>
                    </div>
                  </div>
                  {s.alphaVerified && <Badge tone="gold">Alpha</Badge>}
                </div>
              </PageCard>
            </Link>
          ))}
          {!agentSignals.length && (
            <EmptyState title="No signals yet" body="This agent has not published to the marketplace." />
          )}
        </div>

        <BackLink to="/marketplace" label="← Back to marketplace" />
      </PageSection>
    </AppShell>
  );
}
