import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });
config({ path: resolve(__dirname, "../server/.env") });

type Result = { name: string; ok: boolean; detail: string };

const results: Result[] = [];

function record(name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`[${mark}] ${name}: ${detail}`);
}

async function main() {
  process.on("unhandledRejection", (reason) => {
    console.error("[UNHANDLED]", reason);
    process.exit(1);
  });

  const { createClient } = await import("@supabase/supabase-js");
  const {
    ensureDefaultAgents,
    getAgentStatus,
    listMarketplace,
    getLeaderboard,
    getTreasuryRows,
    logEvent,
  } = await import("../shared/db/client.ts");
  const { getLiveConfigStatus, getServerEnv } = await import("../shared/config/env.ts");
  const { getLiveAlphaMarketsPreview } = await import("../shared/bonus/arcade.ts");
  const { getFolksXAlgoState } = await import("../shared/bonus/yield.ts");

  const env = getServerEnv();

  // 1. Credentials
  const creds = getLiveConfigStatus();
  const missing = creds.filter((c) => !c.configured).map((c) => c.key);
  record("credentials", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : "all set");

  // 2. Supabase tables
  const sb = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
  for (const table of ["agents", "signals", "purchases", "agent_events"]) {
    const { error } = await sb.from(table).select("id").limit(1);
    record(`supabase.${table}`, !error, error?.message ?? "reachable");
  }

  // 3. Seed default agents
  try {
    await ensureDefaultAgents(env.analystAddress, env.buyerAddress);
    record("db.ensureDefaultAgents", true, "analyst + buyer seeded");
  } catch (e) {
    record("db.ensureDefaultAgents", false, e instanceof Error ? e.message : "failed");
  }

  // 4. x402 health
  try {
    const res = await fetch(`${env.x402ServerUrl}/health`, { signal: AbortSignal.timeout(8000) });
    const body = await res.json();
    record("x402.health", res.ok && body.status === "ok", JSON.stringify(body));
  } catch (e) {
    record("x402.health", false, e instanceof Error ? e.message : "unreachable");
  }

  // 5. Platform reads
  try {
    const status = await getAgentStatus();
    record("db.getAgentStatus", status.agents.length >= 0, `${status.agents.length} agents, ${status.events.length} events`);
  } catch (e) {
    record("db.getAgentStatus", false, e instanceof Error ? e.message : "failed");
  }

  try {
    const board = await getLeaderboard();
    record("db.getLeaderboard", true, `${board.length} agents`);
  } catch (e) {
    record("db.getLeaderboard", false, e instanceof Error ? e.message : "failed");
  }

  try {
    const treasury = await getTreasuryRows();
    record("db.getTreasuryRows", true, `${treasury.length} rows`);
  } catch (e) {
    record("db.getTreasuryRows", false, e instanceof Error ? e.message : "failed");
  }

  // 6. Alpha Arcade preview
  try {
    const alpha = await getLiveAlphaMarketsPreview(2);
    const ok = Array.isArray(alpha);
    record("alpha.preview", ok, ok ? `${alpha.length} markets` : String((alpha as { error?: string }).error ?? "failed"));
  } catch (e) {
    record("alpha.preview", false, e instanceof Error ? e.message : "failed");
  }

  // 7. Folks xALGO
  try {
    const folks = await getFolksXAlgoState();
    record(
      "folks.xalgo",
      true,
      folks.available ? `pool ok, fee ${folks.fee}` : folks.reason ?? "unavailable",
    );
  } catch (e) {
    record("folks.xalgo", false, e instanceof Error ? e.message : "failed");
  }

  // 8. Analyst agent (OpenAI + CoinGecko + DB)
  let signalId: string | undefined;
  try {
    const { runAnalystAgent } = await import("../packages/agents/analyst.ts");
    const analyst = await runAnalystAgent();
    signalId = analyst.signalId;
    record("agent.analyst", Boolean(signalId), `signal ${signalId?.slice(0, 8)}… title: ${analyst.title}`);
  } catch (e) {
    record("agent.analyst", false, e instanceof Error ? e.message : "failed");
  }

  // 9. Marketplace list
  try {
    const signals = await listMarketplace({});
    record("db.listMarketplace", signals.length > 0, `${signals.length} signals`);
  } catch (e) {
    record("db.listMarketplace", false, e instanceof Error ? e.message : "failed");
  }

  // 10. x402 unpaid access → expect 402
  const testId = signalId ?? (await listMarketplace({}))[0]?.id;
  if (testId) {
    try {
      const res = await fetch(`${env.x402ServerUrl}/signals/${testId}`, { signal: AbortSignal.timeout(10000) });
      record("x402.signals.unpaid", res.status === 402, `HTTP ${res.status} (expected 402)`);
    } catch (e) {
      record("x402.signals.unpaid", false, e instanceof Error ? e.message : "failed");
    }
  } else {
    record("x402.signals.unpaid", false, "no signal to test");
  }

  // 11. Buyer agent (live x402 USDC payment)
  try {
    const { runBuyerAgent } = await import("../packages/agents/buyer.ts");
    const buyer = await runBuyerAgent();
    record("agent.buyer", true, `purchased ${buyer.signalId?.slice(0, 8)}… tx: ${buyer.txId?.slice(0, 12) ?? "n/a"}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "failed";
    const usdcHint = /402|payment|insufficient|balance|USDC/i.test(msg);
    record("agent.buyer", false, usdcHint ? `${msg} (fund buyer USDC via Circle faucet)` : msg);
  }

  // 12. Event log
  try {
    await logEvent("api_test", "Automated API test run", { pass: results.filter((r) => r.ok).length });
    record("db.logEvent", true, "written");
  } catch (e) {
    record("db.logEvent", false, e instanceof Error ? e.message : "failed");
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log("\n--- SUMMARY ---");
  console.log(`${passed}/${results.length} passed`);
  if (failed.length) {
    console.log("Failed:", failed.map((f) => f.name).join(", "));
  }
  process.exit(failed.some((f) => f.name.startsWith("supabase") || f.name === "x402.health" || f.name === "agent.analyst") ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
