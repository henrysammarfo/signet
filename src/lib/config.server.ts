import { getServerEnv, isSupabaseConfigured, optionalEnv } from "../../shared/config/env.ts";

export function getServerConfig() {
  const env = {
    nodeEnv: optionalEnv("NODE_ENV", "development"),
    supabaseUrl: optionalEnv("SUPABASE_URL"),
    supabaseServiceRoleKey: optionalEnv("SUPABASE_SERVICE_ROLE_KEY"),
    analystMnemonic: optionalEnv("ANALYST_MNEMONIC"),
    buyerMnemonic: optionalEnv("BUYER_MNEMONIC"),
    analystAddress: optionalEnv("AVM_ADDRESS") || optionalEnv("ANALYST_ADDRESS"),
    buyerAddress: optionalEnv("BUYER_ADDRESS"),
    facilitatorUrl: optionalEnv("FACILITATOR_URL", "https://facilitator.goplausible.xyz"),
    x402ServerUrl:
      optionalEnv("X402_SERVER_URL") ||
      optionalEnv("VITE_X402_SERVER_URL", "http://localhost:4021"),
    openaiApiKey: optionalEnv("OPENAI_API_KEY"),
    openaiModel: optionalEnv("OPENAI_MODEL", "gpt-4o-mini"),
    alphaApiKey: optionalEnv("ALPHA_API_KEY"),
    appOrigin: optionalEnv("VITE_APP_ORIGIN", "http://localhost:5173"),
  };

  return {
    ...env,
    supabaseConfigured: isSupabaseConfigured(),
  };
}

export function getStrictServerEnv() {
  return getServerEnv();
}

export function getPublicConfig() {
  return {
    x402ServerUrl: import.meta.env.VITE_X402_SERVER_URL ?? "http://localhost:4021",
    appName: "SIGNET",
    network: "algorand-testnet",
  };
}
