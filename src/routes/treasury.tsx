import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";

import { AppShell } from "../components/layout/AppShell";
import { DataTable, PageCard, PageSection, SecondaryButton, StatCard } from "../components/ui/signet-ui";
import { getTreasuryData } from "../lib/api/agents.functions";
import { getAnalystTreasury, runInAppStake } from "../lib/api/bonus.functions";

export const Route = createFileRoute("/treasury")({
  head: () => ({
    meta: [
      { title: "Treasury — SIGNET" },
      { name: "description", content: "Earn yield on signal revenue with xALGO." },
    ],
    links: [{ rel: "canonical", href: "/treasury" }],
  }),
  component: TreasuryPage,
});

function TreasuryPage() {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["treasury"],
    queryFn: () => getTreasuryData(),
  });

  const { data: snapshot } = useQuery({
    queryKey: ["treasury-snapshot"],
    queryFn: () => getAnalystTreasury(),
  });

  const stakeMutation = useMutation({
    mutationFn: () => runInAppStake(),
  });

  const folks = snapshot?.folks;

  return (
    <AppShell title="Treasury" subtitle="Put idle earnings to work. Revenue can auto-compound into xALGO yield.">
      <PageSection>
        {folks?.available && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <StatCard label="Pool size" value={folks.xAlgoCirculating?.toFixed(0) ?? "—"} hint="xALGO" />
            <StatCard label="Backing" value={folks.algoBacking?.toFixed(0) ?? "—"} hint="ALGO" />
            <StatCard label="Est. yield" value={`${folks.apyEstimate}%`} />
            <StatCard label="Status" value={folks.canImmediateStake ? "Open" : "Paused"} />
          </div>
        )}

        <PageCard className="p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[13px] text-white/50 max-w-md leading-relaxed">
            Stake unused USDC revenue into the xALGO pool. Everything happens in-app — no external
            tabs.
          </p>
          <SecondaryButton onClick={() => stakeMutation.mutate()} disabled={stakeMutation.isPending}>
            {stakeMutation.isPending ? "Depositing…" : "Deposit to earn"}
          </SecondaryButton>
        </PageCard>

        {stakeMutation.data && (
          <p className="text-[12px] text-white/40 mb-6">
            {stakeMutation.data.skipped
              ? stakeMutation.data.message
              : stakeMutation.data.staked
                ? `Deposited ${stakeMutation.data.staked} ALGO → xALGO`
                : "Done"}
          </p>
        )}

        {isLoading && <p className="text-white/35 text-sm mb-4">Loading…</p>}

        <DataTable
          columns={[
            { key: "agent", label: "Analyst" },
            { key: "staked", label: "Staked" },
            { key: "apy", label: "APY" },
            { key: "yield", label: "Projected" },
            { key: "earned", label: "Earned", align: "right" },
          ]}
          rows={rows.map((r) => ({
            agent: r.agent,
            staked: r.staked.toFixed(1),
            apy: `${r.apy}%`,
            yield: (r.projectedYield ?? 0).toFixed(2),
            earned: r.earned.toFixed(1),
          }))}
          empty="Treasury data will appear as analysts earn from signal sales."
        />
      </PageSection>
    </AppShell>
  );
}
