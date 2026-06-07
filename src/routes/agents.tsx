import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "../components/layout/AppShell";
import {
  FeedList,
  PageCard,
  PageSection,
  PrimaryButton,
  SecondaryButton,
} from "../components/ui/signet-ui";
import { useWallet } from "../components/wallet/WalletProvider";
import { useWalletBalance } from "../hooks/useWalletBalance";
import { getAgentProfile, getAgentStatusData } from "../lib/api/agents.functions";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Dashboard — SIGNET" },
      { name: "description", content: "Your signal marketplace at a glance." },
    ],
    links: [{ rel: "canonical", href: "/agents" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { address, walletName, openConnect } = useWallet();
  const { data: balance } = useWalletBalance(address);

  const { data: profile } = useQuery({
    queryKey: ["profile", address],
    queryFn: () => getAgentProfile({ data: { address: address! } }),
    enabled: Boolean(address),
  });

  const { data: activity, isLoading } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => getAgentStatusData(),
    refetchInterval: 20_000,
  });

  return (
    <AppShell title="Dashboard" minimal>
      <PageSection className="pt-8">
        <div className="mb-10">
          <p className="text-[13px] text-white/40 mb-2">
            {address ? `Connected · ${walletName ?? "Wallet"}` : "Welcome to SIGNET"}
          </p>
          <h1 className="text-[26px] font-medium tracking-tight text-white">
            {address ? "Your dashboard" : "Market signals, on demand"}
          </h1>
          <p className="text-[14px] text-white/35 mt-2 max-w-lg leading-relaxed">
            {address
              ? "Publish insights, track earnings, and buy signals from top analysts — pay only for what you use."
              : "Browse verified market signals without signing up. Connect a wallet when you're ready to publish or pay."}
          </p>
        </div>

        {!address ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <PageCard className="p-6 flex flex-col gap-4">
              <div>
                <p className="text-[11px] text-white/35 mb-2">No wallet needed</p>
                <p className="text-sm text-white/80 font-medium">Explore the marketplace</p>
                <p className="text-[13px] text-white/40 mt-2 leading-relaxed">
                  See live signals, prices, and analyst track records before you commit.
                </p>
              </div>
              <PrimaryButton className="w-full sm:w-auto" onClick={() => navigate({ to: "/marketplace" })}>
                Browse signals
              </PrimaryButton>
            </PageCard>
            <PageCard className="p-6 flex flex-col gap-4">
              <div>
                <p className="text-[11px] text-white/35 mb-2">For creators</p>
                <p className="text-sm text-white/80 font-medium">Publish and get paid</p>
                <p className="text-[13px] text-white/40 mt-2 leading-relaxed">
                  Connect Pera, Lute, or any Algorand wallet to publish signals and receive USDC.
                </p>
              </div>
              <SecondaryButton onClick={openConnect} className="w-full sm:w-auto">
                Connect wallet
              </SecondaryButton>
              <SecondaryButton onClick={() => navigate({ to: "/developers" })} className="w-full sm:w-auto">
                Register as agent
              </SecondaryButton>
            </PageCard>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <PageCard className="p-4">
                <p className="text-[11px] text-white/35 mb-1">Balance</p>
                <p className="text-xl font-medium tabular-nums">
                  {balance ? balance.usdc.toFixed(2) : "—"}
                </p>
                <p className="text-[11px] text-white/30 mt-1">USDC</p>
              </PageCard>
              <PageCard className="p-4">
                <p className="text-[11px] text-white/35 mb-1">Signals</p>
                <p className="text-xl font-medium tabular-nums">{profile?.signals ?? 0}</p>
                <p className="text-[11px] text-white/30 mt-1">Published</p>
              </PageCard>
              <PageCard className="p-4">
                <p className="text-[11px] text-white/35 mb-1">Earned</p>
                <p className="text-xl font-medium tabular-nums">{profile?.revenue ?? 0}</p>
                <p className="text-[11px] text-white/30 mt-1">USDC</p>
              </PageCard>
              <PageCard className="p-4">
                <p className="text-[11px] text-white/35 mb-1">Accuracy</p>
                <p className="text-xl font-medium tabular-nums">{profile?.accuracy ?? 0}%</p>
                <p className="text-[11px] text-white/30 mt-1">Verified</p>
              </PageCard>
            </div>

            <div className="flex flex-wrap gap-3 mb-10">
              <PrimaryButton onClick={() => navigate({ to: "/create" })}>Publish signal</PrimaryButton>
              <SecondaryButton onClick={() => navigate({ to: "/marketplace" })}>
                Browse marketplace
              </SecondaryButton>
              <SecondaryButton onClick={() => navigate({ to: "/treasury" })}>Treasury</SecondaryButton>
            </div>

            {!profile && (
              <PageCard className="p-5 mb-8">
                <p className="text-sm text-white/70">
                  New here? Register as an agent, then publish your first signal.
                </p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <SecondaryButton onClick={() => navigate({ to: "/developers" })}>
                    Register as agent
                  </SecondaryButton>
                  <SecondaryButton onClick={() => navigate({ to: "/create" })}>
                    Publish signal
                  </SecondaryButton>
                </div>
              </PageCard>
            )}

            {balance && !balance.usdcOptedIn && (
              <p className="text-[13px] text-amber-400/80 mb-6 max-w-lg">
                Add testnet USDC to your wallet to buy signals. Payments use Circle USDC on Algorand
                testnet.
              </p>
            )}
          </>
        )}

        <p className="text-[11px] text-white/35 mb-3">Recent activity</p>
        <FeedList
          items={(activity?.events ?? []).slice(0, 10).map((e) => ({
            id: e.id,
            message: e.message,
            time: new Date(e.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }))}
          empty={isLoading ? "Loading…" : "Activity will appear here as signals are published and sold."}
        />
      </PageSection>
    </AppShell>
  );
}
