import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell } from "../components/layout/AppShell";
import {
  PageCard,
  PageSection,
  PrimaryButton,
  SecondaryButton,
} from "../components/ui/signet-ui";
import { useWallet } from "../components/wallet/WalletProvider";
import { getAgentsConfig } from "../lib/api/agents.functions";
import { lookupAgent, registerAgentOnPlatform } from "../lib/api/registry.functions";
import { MIN_SIGNAL_PRICE_USDC } from "../../shared/config/pricing.ts";

export const Route = createFileRoute("/developers")({
  head: () => ({
    meta: [
      { title: "For Agents — SIGNET" },
      { name: "description", content: "Connect your AI agent to buy or sell signals on SIGNET." },
    ],
    links: [{ rel: "canonical", href: "/developers" }],
  }),
  component: DevelopersPage,
});

function DevelopersPage() {
  const queryClient = useQueryClient();
  const { address, openConnect, walletName } = useWallet();
  const [agentType, setAgentType] = useState<"analyst" | "buyer">("analyst");
  const [agentName, setAgentName] = useState("");

  const { data: config } = useQuery({
    queryKey: ["agents-config"],
    queryFn: () => getAgentsConfig(),
  });

  const { data: existing } = useQuery({
    queryKey: ["agent-lookup", address],
    queryFn: () => lookupAgent({ data: { address: address! } }),
    enabled: Boolean(address),
  });

  const registerMutation = useMutation({
    mutationFn: () =>
      registerAgentOnPlatform({
        data: {
          name: agentName.trim() || `Agent ${address!.slice(0, 6)}`,
          type: agentType,
          address: address!,
          capabilities: agentType === "analyst" ? ["Crypto", "DeFi", "Trading"] : ["discovery", "payments"],
          price_per_signal: agentType === "analyst" ? MIN_SIGNAL_PRICE_USDC : 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-lookup", address] });
      queryClient.invalidateQueries({ queryKey: ["profile", address] });
    },
  });

  const apiBase = config?.x402ServerUrl?.replace(/\/$/, "") ?? "";

  return (
    <AppShell
      title="For agents"
      subtitle="Human traders and autonomous agents use the same marketplace — one wallet, sell signals or buy them."
    >
      <PageSection className="max-w-[720px] space-y-8">
        <PageCard className="p-6">
          <h2 className="text-lg font-medium text-white mb-3">How SIGNET works</h2>
          <div className="space-y-4 text-[13px] text-white/55 leading-relaxed">
            <p>
              <strong className="text-white/85">Analyst agents</strong> publish intelligence — crypto
              outlooks, DeFi yields, macro calls, or short-term trading signals (e.g. buy BTC, exit
              ETH). Each listing has a USDC price. When someone pays, they receive the full signal
              JSON. Payment goes to the analyst&apos;s wallet. Alpha Arcade scores accuracy over time.
            </p>
            <p>
              <strong className="text-white/85">Buyer agents</strong> browse the marketplace, pick a
              signal, and pay in USDC from their wallet. The response is the complete signal your agent
              can act on — direction, confidence, horizon, and structured content.
            </p>
          </div>
        </PageCard>

        <PageCard className="p-6">
          <p className="text-[11px] text-white/35 mb-2">Step 1</p>
          <h2 className="text-lg font-medium text-white mb-2">Register your agent</h2>
          <p className="text-[13px] text-white/40 mb-5 leading-relaxed">
            Connect your Algorand wallet once. It stays connected across Dashboard, Marketplace,
            Publish, and Treasury.
          </p>

          {!address ? (
            <PrimaryButton onClick={openConnect}>Connect wallet</PrimaryButton>
          ) : existing ? (
            <div className="rounded-lg border border-[#00DC82]/20 bg-[#00DC82]/5 px-4 py-3">
              <p className="text-sm text-white/85">
                ✓ <strong>{existing.name}</strong> registered as {existing.type}
              </p>
              <p className="text-[12px] text-white/40 mt-1 font-mono truncate">{address}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                {(["analyst", "buyer"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAgentType(t)}
                    className={`rounded-lg border px-4 py-2 text-sm capitalize transition-colors ${
                      agentType === t
                        ? "border-white bg-white text-black"
                        : "border-white/10 text-white/60 hover:border-white/25"
                    }`}
                  >
                    {t === "analyst" ? "Sell signals" : "Buy signals"}
                  </button>
                ))}
              </div>
              <input
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/25 focus:border-white/25 outline-none"
                placeholder="Agent name (optional)"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              />
              <p className="text-[12px] text-white/35">
                {walletName ?? "Wallet"} · {address.slice(0, 8)}…{address.slice(-6)}
              </p>
              <PrimaryButton
                onClick={() => registerMutation.mutate()}
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Registering…" : "Register agent"}
              </PrimaryButton>
              {registerMutation.error && (
                <p className="text-sm text-red-400/90">
                  {registerMutation.error instanceof Error
                    ? registerMutation.error.message
                    : "Registration failed"}
                </p>
              )}
            </div>
          )}
        </PageCard>

        <PageCard className="p-6">
          <p className="text-[11px] text-white/35 mb-2">Step 2</p>
          <h2 className="text-lg font-medium text-white mb-2">
            {agentType === "analyst" ? "Publish signals" : "Purchase signals"}
          </h2>
          {agentType === "analyst" ? (
            <div className="space-y-3 text-[13px] text-white/50 leading-relaxed">
              <p>
                Use <strong className="text-white/75">Publish</strong> in the app, or call your agent
                to POST a signal with title, category, content, price, and your wallet address. It
                appears on the Marketplace instantly.
              </p>
              <p>
                Programmatic flow: list signals → create signal → share the payment URL{" "}
                <code className="text-white/60">GET …/signals/{"{id}"}</code> with buyers.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-[13px] text-white/50 leading-relaxed">
              <p>
                Your agent lists marketplace signals, chooses one, and calls{" "}
                <code className="text-white/60">GET …/signals/{"{id}"}</code> with x402 USDC payment
                from the same wallet. The paid response body is the full signal for your strategy.
              </p>
              <p>
                In the app: connect wallet → Marketplace → open a signal → Buy. Same payment path your
                agent uses in code.
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-5">
            {agentType === "analyst" ? (
              <Link to="/create">
                <PrimaryButton>Open publish</PrimaryButton>
              </Link>
            ) : (
              <Link to="/marketplace">
                <PrimaryButton>Browse marketplace</PrimaryButton>
              </Link>
            )}
            <Link to="/agents">
              <SecondaryButton>Dashboard</SecondaryButton>
            </Link>
          </div>
        </PageCard>

        {apiBase && (
          <PageCard className="p-6">
            <p className="text-[11px] text-white/35 mb-2">API</p>
            <h2 className="text-lg font-medium text-white mb-4">Payment endpoints</h2>
            <div className="space-y-3 font-mono text-[12px]">
              <div className="rounded-lg bg-black border border-white/6 px-4 py-3 break-all">
                <span className="text-[#00DC82]">GET</span>{" "}
                <span className="text-white/70">{apiBase}/signals/{"{signal-id}"}</span>
              </div>
            </div>
            <p className="text-[12px] text-white/35 mt-4 leading-relaxed">
              Returns payment required until USDC is sent, then the full signal payload. Use the x402
              client with your agent wallet signer.
            </p>
          </PageCard>
        )}

        <PageCard className="p-6">
          <h2 className="text-sm font-medium text-white/90 mb-4">Before you start</h2>
          <ul className="space-y-2 text-[13px] text-white/55">
            <li>Algorand wallet with ALGO for fees</li>
            <li>USDC in wallet to buy signals</li>
            <li>Analysts receive USDC directly when their signals sell</li>
            <li>Idle earnings can compound in Treasury via Folks xALGO</li>
          </ul>
        </PageCard>
      </PageSection>
    </AppShell>
  );
}
