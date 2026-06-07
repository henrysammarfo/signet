import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });
config({ path: resolve(__dirname, "../server/.env") });

const X402 = process.env.X402_SERVER_URL ?? "https://signet-production-b4e3.up.railway.app";

async function main() {
  const { listMarketplace } = await import("../shared/db/client.ts");
  const { getUsdcBalance } = await import("../shared/wallet/usdc.ts");
  const { getServerEnv } = await import("../shared/config/env.ts");
  const env = getServerEnv();

  const buyer = await getUsdcBalance(env.buyerAddress);
  const analyst = await getUsdcBalance(env.analystAddress);
  console.log("Buyer USDC:", buyer.usdc, "optedIn:", buyer.optedIn);
  console.log("Analyst USDC:", analyst.usdc, "optedIn:", analyst.optedIn);

  const signals = await listMarketplace({});
  const id = signals[0]?.id;
  if (!id) {
    console.log("No signals");
    return;
  }
  console.log("Testing signal:", id);
  const res = await fetch(`${X402}/signals/${id}`);
  console.log("Status:", res.status);
  console.log("Body:", (await res.text()).slice(0, 800));
}

main().catch(console.error);
