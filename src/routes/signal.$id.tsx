import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AppShell } from "../components/layout/AppShell";
import {
  BackLink,
  Badge,
  CardBody,
  CardHeader,
  PageCard,
  PageSection,
  PrimaryButton,
  SecondaryButton,
  StatCard,
} from "../components/ui/signet-ui";
import { useWallet } from "../components/wallet/WalletProvider";
import { useWalletBalance } from "../hooks/useWalletBalance";
import { buySignalWithWallet, friendlyPurchaseError } from "../lib/x402/buy-signal";
import { getSignalById } from "../lib/api/signals.functions";

export const Route = createFileRoute("/signal/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Signal ${params.id} — SIGNET` }],
    links: [{ rel: "canonical", href: `/signal/${params.id}` }],
  }),
  component: SignalDetailPage,
});

function SignalDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { address, walletKind, walletName, ready, openConnect } = useWallet();
  const { data: balance } = useWalletBalance(address);
  const [content, setContent] = useState<string | null>(null);

  const { data: signal, isLoading } = useQuery({
    queryKey: ["signal", id],
    queryFn: () => getSignalById({ data: { id } }),
  });

  const buyMutation = useMutation({
    mutationFn: async () => {
      if (!address || !walletKind) {
        throw new Error("Connect your wallet to purchase.");
      }
      if (!signal?.endpoint) {
        throw new Error("This signal is not available.");
      }
      if (balance && !balance.usdcOptedIn) {
        throw new Error("Opt into USDC in your wallet before buying.");
      }
      if (balance && balance.usdc < (signal.price ?? 0)) {
        throw new Error(`You need at least ${signal.price} USDC in your wallet.`);
      }
      return buySignalWithWallet(signal.endpoint, address, walletKind);
    },
    onSuccess: (body) => {
      const payload = (body as { signal?: { content?: unknown } }).signal?.content ?? body;
      setContent(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
      queryClient.invalidateQueries({ queryKey: ["signal", id] });
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["profile", address] });
    },
  });

  const purchased = Boolean(content);
  const accuracyHistory = [{ day: "Current", accuracy: signal?.accuracy ?? 0 }];

  const handleBuy = () => {
    if (!address) {
      openConnect();
      return;
    }
    buyMutation.mutate();
  };

  if (isLoading) {
    return (
      <AppShell title="Signal" subtitle="Loading signal details…">
        <PageSection>
          <p className="text-white/45">Loading…</p>
        </PageSection>
      </AppShell>
    );
  }

  if (!signal) {
    return (
      <AppShell title="Not found" subtitle="This signal does not exist.">
        <PageSection>
          <BackLink to="/marketplace" label="← Back to marketplace" />
        </PageSection>
      </AppShell>
    );
  }

  return (
    <AppShell title={signal.title} subtitle={`${signal.category} · ${signal.agent} · ${signal.accuracy}% accuracy`}>
      <PageSection className="max-w-[920px] space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Price" value={`${signal.price}`} hint="USDC" accent="green" />
          <StatCard label="Purchases" value={String(signal.purchases)} />
          <StatCard label="Direction" value={signal.direction ?? "—"} accent="gold" />
          <StatCard
            label="Confidence"
            value={signal.confidence ? `${signal.confidence}%` : "—"}
          />
        </div>

        <PageCard>
          <CardHeader title="Signal content" badge={<Badge tone="muted">Paid access</Badge>} />
          <CardBody className="relative min-h-[220px] pt-0">
            {!purchased ? (
              <>
                <p className="blur-sm select-none text-white/60 leading-relaxed">{signal.preview}</p>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-[2px] gap-4 rounded-b-xl px-4">
                  {ready && address ? (
                    <p className="text-xs text-[#00DC82]/90 text-center">
                      {walletName ?? "Wallet"} · {address.slice(0, 6)}…{address.slice(-4)}
                      {balance ? ` · ${balance.usdc.toFixed(2)} USDC` : ""}
                    </p>
                  ) : (
                    <p className="text-xs text-white/50 text-center max-w-xs">
                      Connect the same wallet you use across SIGNET to pay and unlock this signal.
                    </p>
                  )}
                  <PrimaryButton onClick={handleBuy} disabled={buyMutation.isPending}>
                    {buyMutation.isPending
                      ? "Confirm in wallet…"
                      : address
                        ? `Buy for ${signal.price} USDC`
                        : "Connect wallet to buy"}
                  </PrimaryButton>
                  {address && balance && !balance.usdcOptedIn && (
                    <p className="text-xs text-amber-400/80 text-center max-w-sm">
                      Add USDC to your wallet before purchasing.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <pre className="text-sm text-white/90 whitespace-pre-wrap font-mono leading-relaxed">{content}</pre>
            )}
            {buyMutation.isError && (
              <p className="mt-4 text-red-400/90 text-sm px-4 py-3 rounded-xl border border-red-400/20 bg-red-400/5">
                {friendlyPurchaseError(buyMutation.error)}
              </p>
            )}
          </CardBody>
        </PageCard>

        <PageCard>
          <CardHeader title="Accuracy history" />
          <CardBody className="pt-0">
            <div className="h-[200px] rounded-xl border border-white/6 bg-black/20 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyHistory}>
                  <XAxis dataKey="day" stroke="#ffffff44" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#ffffff44" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0a0a0a",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#00DC82" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </PageCard>

        {signal.alphaArcadeLink && (
          <PageCard accent="purple">
            <CardHeader title="Alpha reputation" badge={<Badge tone="muted">Verified</Badge>} />
            <CardBody className="pt-0 space-y-3">
              <p className="text-[13px] text-white/50">
                Linked to {signal.alphaContext?.title ?? "a live Alpha market"}. Accuracy is tracked
                on-chain.
              </p>
              {signal.alphaContext?.impliedYes != null && (
                <p className="text-sm text-white/70">
                  Implied yes: {Math.round(signal.alphaContext.impliedYes * 100)}%
                </p>
              )}
            </CardBody>
          </PageCard>
        )}

        <BackLink to="/marketplace" label="← Back to marketplace" />
      </PageSection>
    </AppShell>
  );
}
