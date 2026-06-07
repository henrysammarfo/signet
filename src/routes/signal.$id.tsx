import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
  StatCard,
} from "../components/ui/signet-ui";
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
  const [purchased, setPurchased] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);

  const { data: signal, isLoading } = useQuery({
    queryKey: ["signal", id],
    queryFn: () => getSignalById({ data: { id } }),
  });

  const accuracyHistory = [{ day: "Current", accuracy: signal?.accuracy ?? 0 }];

  const buySignal = async () => {
    if (!signal?.endpoint) return;
    setBuying(true);
    setBuyError(null);
    try {
      const res = await fetch(signal.endpoint, { method: "GET" });
      if (res.status === 402) {
        setBuyError(
          "This signal requires a USDC payment. Connect a funded wallet to purchase.",
        );
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      setContent(JSON.stringify(body.signal?.content ?? body, null, 2));
      setPurchased(true);
    } catch (e) {
      setBuyError(e instanceof Error ? e.message : "Purchase failed");
    } finally {
      setBuying(false);
    }
  };

  const arcadeLink = signal?.alphaArcadeLink;

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
          <CardHeader title="Signal content" badge={<Badge tone="muted">x402 protected</Badge>} />
          <CardBody className="relative min-h-[220px] pt-0">
            {!purchased ? (
              <>
                <p className="blur-sm select-none text-white/60 leading-relaxed">{signal.preview}</p>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-[2px] gap-4 rounded-b-xl">
                  <PrimaryButton onClick={buySignal} disabled={buying}>
                    {buying ? "Processing…" : `Buy for ${signal.price} USDC`}
                  </PrimaryButton>
                  <p className="text-xs text-white/45 max-w-sm text-center px-4">
                    Connect a wallet with USDC to unlock this signal, or browse free previews first.
                  </p>
                </div>
              </>
            ) : (
              <pre className="text-sm text-white/90 whitespace-pre-wrap font-mono leading-relaxed">{content}</pre>
            )}
            {buyError && (
              <p className="mt-4 text-red-400/90 text-sm px-4 py-3 rounded-xl border border-red-400/20 bg-red-400/5">
                {buyError}
              </p>
            )}
          </CardBody>
        </PageCard>

        <PageCard>
          <CardHeader title="Accuracy history" />
          <CardBody className="pt-0">
            <div className="h-[200px] rounded-xl border border-white/[0.06] bg-black/20 p-2">
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

        {arcadeLink && (
          <PageCard accent="purple">
            <CardHeader title="Alpha reputation" badge={<Badge tone="muted">SDK verified</Badge>} />
            <CardBody className="pt-0 space-y-3">
              <p className="text-[13px] text-white/50">
                Linked to {signal.alphaContext?.title ?? "a live Alpha market"}. Verified in-app via orderbook.
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
