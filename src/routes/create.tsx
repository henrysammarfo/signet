import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell } from "../components/layout/AppShell";
import {
  FormField,
  PageCard,
  PageSection,
  PrimaryButton,
  SecondaryButton,
  inputClass,
} from "../components/ui/signet-ui";
import { useWallet } from "../components/wallet/WalletProvider";
import { createSignal } from "../lib/api/signals.functions";
import { MIN_SIGNAL_PRICE_USDC } from "../../shared/config/pricing.ts";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Publish Signal — SIGNET" },
      { name: "description", content: "Publish analyst signals to the SIGNET marketplace." },
    ],
    links: [{ rel: "canonical", href: "/create" }],
  }),
  component: CreatePage,
});

function CreatePage() {
  const navigate = useNavigate();
  const { address, openConnect, walletName } = useWallet();
  const [form, setForm] = useState({
    title: "",
    category: "Crypto",
    content: "",
    price_usdc: MIN_SIGNAL_PRICE_USDC,
    embargo_minutes: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      if (!address) throw new Error("Connect a wallet to publish.");
      return createSignal({
        data: {
          ...form,
          price_usdc: Number(form.price_usdc),
          embargo_minutes: Number(form.embargo_minutes),
          analyst_address: address,
        },
      });
    },
    onSuccess: (result) => {
      navigate({ to: "/signal/$id", params: { id: result.signalId } });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Failed to publish"),
  });

  return (
    <AppShell
      title="Publish"
      subtitle="Share a market signal. Buyers pay per access — you keep the revenue."
    >
      <PageSection className="max-w-[720px]">
        {!address && (
          <PageCard className="mb-8 p-6">
            <p className="text-sm text-white/75 mb-1 font-medium">Wallet required</p>
            <p className="text-[13px] text-white/40 mb-5 leading-relaxed">
              Connect Pera, Lute, or any Algorand wallet. Payments from buyers go directly to your
              address.
            </p>
            <PrimaryButton onClick={openConnect}>Connect wallet</PrimaryButton>
          </PageCard>
        )}

        {address && (
          <p className="text-[12px] text-white/35 mb-6">
            Publishing as {address.slice(0, 6)}…{address.slice(-4)}
            {walletName ? ` · ${walletName}` : ""}
          </p>
        )}

        <PageCard>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              mutation.mutate();
            }}
            className="p-6 space-y-5"
          >
            <FormField label="Title">
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="BTC outlook — next 24 hours"
                required
              />
            </FormField>

            <FormField label="Category">
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {["Crypto", "DeFi", "Macro", "Sentiment", "Event", "NFT", "Memecoin"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Signal content">
              <textarea
                className={`${inputClass} min-h-[140px] resize-y`}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Your analysis, direction, and reasoning…"
                required
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Price (USDC)">
                <input
                  type="number"
                  min={MIN_SIGNAL_PRICE_USDC}
                  max={50}
                  step={0.01}
                  className={inputClass}
                  value={form.price_usdc}
                  onChange={(e) => setForm((f) => ({ ...f, price_usdc: Number(e.target.value) }))}
                  required
                />
              </FormField>
              <FormField label="Embargo (minutes, optional)">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.embargo_minutes}
                  onChange={(e) => setForm((f) => ({ ...f, embargo_minutes: Number(e.target.value) }))}
                />
              </FormField>
            </div>

            {error && (
              <p className="text-sm text-red-400/90">{error}</p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <PrimaryButton type="submit" disabled={!address || mutation.isPending}>
                {mutation.isPending ? "Publishing…" : "Publish to marketplace"}
              </PrimaryButton>
              {!address && (
                <SecondaryButton type="button" onClick={openConnect}>
                  Connect wallet
                </SecondaryButton>
              )}
            </div>
          </form>
        </PageCard>
      </PageSection>
    </AppShell>
  );
}
