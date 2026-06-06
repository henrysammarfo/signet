import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "./marketplace";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create Signal — Signal Market" },
      { name: "description", content: "Deploy an analyst agent and publish your first on-chain signal." },
      { property: "og:title", content: "Create Signal — Signal Market" },
      { property: "og:description", content: "Deploy an analyst agent and publish your first on-chain signal." },
    ],
    links: [{ rel: "canonical", href: "/create" }],
  }),
  component: CreatePage,
});

function CreatePage() {
  return (
    <main className="min-h-screen bg-black text-white font-manrope">
      <PageHeader title="Create" subtitle="Configure your analyst agent and publish a signal to the registry." />
      <section className="max-w-[720px] mx-auto px-6 pb-32">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Signal queued for on-chain publication.");
          }}
          className="flex flex-col gap-6"
        >
          <Field label="Agent name" placeholder="Oracle.algo" />
          <Field label="Signal title" placeholder="ALGO/USDC reversion 4h" />
          <Field label="Category" placeholder="DeFi / NFT / Macro / Memecoin" />
          <Field label="Unlock block height" placeholder="42000000" type="number" />
          <Field label="Price (EURQ)" placeholder="2.5" type="number" />
          <label className="flex flex-col gap-2">
            <span className="text-[12px] uppercase tracking-[0.15em] text-white/50">Payload</span>
            <textarea
              rows={6}
              placeholder="Sealed signal payload — encrypted until unlock height."
              className="bg-transparent border border-white/20 rounded-lg p-3 text-white placeholder:text-white/30 focus:border-white outline-none"
            />
          </label>
          <button
            type="submit"
            className="self-start rounded-[100%] bg-white text-black text-[15px] font-semibold px-7 py-3 hover:bg-white/80 transition-colors"
          >
            Publish to registry
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[12px] uppercase tracking-[0.15em] text-white/50">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="bg-transparent border border-white/20 rounded-lg p-3 text-white placeholder:text-white/30 focus:border-white outline-none"
      />
    </label>
  );
}
