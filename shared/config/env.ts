export class SignetConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SignetConfigError";
  }
}

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new SignetConfigError(
      `Missing required environment variable: ${name}. See .env.example and docs/DEPLOYMENT.md`,
    );
  }
  return value;
}

export function optionalEnv(name: string, fallback = ""): string {
  return process.env[name]?.trim() ?? fallback;
}

export function getServerEnv() {
  return {
    nodeEnv: optionalEnv("NODE_ENV", "development"),
    supabaseUrl: optionalEnv("SUPABASE_URL"),
    supabaseServiceRoleKey: optionalEnv("SUPABASE_SERVICE_ROLE_KEY"),
    analystAddress: requireEnv("AVM_ADDRESS"),
    analystMnemonic: requireEnv("ANALYST_MNEMONIC"),
    buyerMnemonic: requireEnv("BUYER_MNEMONIC"),
    buyerAddress: requireEnv("BUYER_ADDRESS"),
    facilitatorUrl: optionalEnv("FACILITATOR_URL", "https://facilitator.goplausible.xyz"),
    x402ServerUrl: optionalEnv("X402_SERVER_URL", "http://localhost:4021"),
    openaiApiKey: optionalEnv("OPENAI_API_KEY"),
    openaiModel: optionalEnv("OPENAI_MODEL", "gpt-4o-mini"),
    algodUrl: optionalEnv("ALGORAND_ALGOD_URL", "https://testnet-api.algonode.cloud"),
    indexerUrl: optionalEnv("ALGORAND_INDEXER_URL", "https://testnet-idx.algonode.cloud"),
    dataDir: optionalEnv("DATA_DIR", "data"),
    alphaApiKey: optionalEnv("ALPHA_API_KEY"),
    alphaNetwork: optionalEnv("ALPHA_NETWORK", "testnet") as "testnet" | "mainnet",
    alphaMatcherAppId: optionalEnv("ALPHA_MATCHER_APP_ID"),
    folksXAlgoAppId: optionalEnv("FOLKS_XALGO_APP_ID"),
    folksXAlgoAsaId: optionalEnv("FOLKS_XALGO_ASA_ID"),
    autoStakeXAlgo: optionalEnv("AUTO_STAKE_XALGO", "false") === "true",
    appOrigin: optionalEnv(
      "VITE_APP_ORIGIN",
      "http://localhost:8080,http://localhost:5173,http://127.0.0.1:8080",
    ),
  };
}

export function assertDatabaseConfigured() {
  const url = optionalEnv("SUPABASE_URL");
  const key = optionalEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new SignetConfigError(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for production. Apply supabase/migrations/001_initial.sql first.",
    );
  }
}

export function isSupabaseConfigured() {
  return Boolean(optionalEnv("SUPABASE_URL") && optionalEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

/** Validates every credential needed for full live testnet (all integrations). */
export function assertFullLiveConfigured() {
  assertDatabaseConfigured();
  requireEnv("AVM_ADDRESS");
  requireEnv("ANALYST_MNEMONIC");
  requireEnv("BUYER_MNEMONIC");
  requireEnv("BUYER_ADDRESS");
  requireEnv("OPENAI_API_KEY");
  requireEnv("ALPHA_API_KEY");
}

export function getLiveConfigStatus() {
  const keys = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "AVM_ADDRESS",
    "ANALYST_MNEMONIC",
    "BUYER_MNEMONIC",
    "BUYER_ADDRESS",
    "OPENAI_API_KEY",
    "ALPHA_API_KEY",
  ] as const;

  return keys.map((key) => ({
    key,
    configured: Boolean(process.env[key]?.trim()),
  }));
}

export const USDC_TESTNET_ASA_ID = 10458941;
