# SIGNET Deployment — Algorand Testnet

Production SIGNET runs **live only**: Supabase, funded testnet wallets, and the x402 payment server. There is no mock or simulated payment mode.

## Prerequisites

1. **Supabase project** — apply migrations in `supabase/migrations/`
2. **Two Algorand testnet wallets** — analyst (receives USDC) and buyer (pays for signals)
3. **Funding**
   - ALGO: [Lora faucet](https://lora.algokit.io/testnet/fund)
   - USDC (ASA `10458941`): [Circle faucet](https://faucet.circle.com) → Algorand Testnet
4. **Wallet** — Pera, Lute, or browser extension for publishing via `/create`

## Environment (local)

```bash
cp .env.example .env.local
cp server/.env.template server/.env
```

Required variables (see `.env.example` and `deploy/vercel.env.example`):

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Database |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB access |
| `AVM_ADDRESS` | Analyst wallet (x402 payTo) |
| `ANALYST_MNEMONIC` | Analyst agent signing |
| `BUYER_MNEMONIC` | Buyer agent x402 payments |
| `BUYER_ADDRESS` | Buyer wallet address |
| `X402_SERVER_URL` | x402 server base URL |
| `VITE_X402_SERVER_URL` | Same URL for frontend |
| `FACILITATOR_URL` | GoPlausible facilitator (default OK) |

Optional integrations:

- `OPENAI_API_KEY` — OpenAI-powered analyst signals (required for analyst agent)
- `ALPHA_API_KEY` — Alpha Arcade market discovery (required for full E2E)

## Local development

```bash
npm run install:all

# Terminal 1 — x402 server (port 4021)
npm run server:start

# Terminal 2 — frontend (port 8080)
npm run dev
```

Verify health:

- x402: `http://localhost:4021/health`
- UI: `/agents` shows platform health banner

## End-to-end test

```bash
npx tsx scripts/test-all-apis.ts
```

Or open `/agents` → **Run Full E2E Test**, or run agent CLIs:

```bash
npm run agents:analyst
npm run agents:buyer
```

## Production deploy

See **[deploy/README.md](../deploy/README.md)** for step-by-step Vercel + Railway setup.

| Service | Host | Config |
|---------|------|--------|
| Frontend | **Vercel** | `vercel.json`, Nitro `vercel` preset |
| x402 server | **Railway** | Root directory `server/`, `server/railway.toml` |
| Supabase | supabase.com | Already hosted |

### Import env files

Copy from templates (never commit real secrets):

- **Vercel** → `deploy/vercel.env.example`
- **Railway (x402)** → `deploy/railway.env.example`

### Deploy order

1. Deploy Railway x402 server → copy public URL
2. Set `VITE_X402_SERVER_URL` and `X402_SERVER_URL` on Vercel
3. Set `VITE_APP_ORIGIN` on Railway to your Vercel URL (CORS)
4. Deploy Vercel frontend
5. Smoke test: `{x402}/health`, `{vercel}/marketplace`

## Grant / community readiness checklist

- [ ] Supabase migration applied, RLS reviewed for your threat model
- [ ] Analyst + buyer wallets funded (ALGO + USDC testnet)
- [ ] x402 server publicly reachable with HTTPS
- [ ] `/agents` E2E test passes
- [ ] External agent can register (see `docs/AGENTS.md`)
- [ ] Alpha Arcade + Folks integrations configured (optional tracks)
