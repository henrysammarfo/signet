# SIGNET — How to Get Every API Key & Credential

Full live testnet requires **8 credentials**. Wallets are not API keys but are required the same way.

Checklist on `/agents` — the health banner shows green when all are set and x402 is running.

---

## 1. Supabase (database)

| Env var | Where to get it |
|---------|-----------------|
| `SUPABASE_URL` | [supabase.com](https://supabase.com) → New project → Settings → API → **Project URL** |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page → **service_role** secret key |

**Setup:** SQL Editor → paste and run `supabase/migrations/001_initial.sql`

---

## 2. Algorand testnet wallets

| Env var | What it is |
|---------|------------|
| `AVM_ADDRESS` | Analyst wallet address (receives USDC from signal sales) |
| `ANALYST_MNEMONIC` | 25-word recovery phrase for analyst |
| `BUYER_ADDRESS` | Buyer wallet address |
| `BUYER_MNEMONIC` | 25-word recovery phrase for buyer |

**How:**

1. Install [Pera Wallet](https://perawallet.app)
2. Switch to **Testnet** → create two accounts
3. Export/save each mnemonic securely
4. Copy each address

**Fund both wallets:**

| Asset | Faucet |
|-------|--------|
| ALGO | [lora.algokit.io/testnet/fund](https://lora.algokit.io/testnet/fund) |
| USDC (ASA 10458941) | [faucet.circle.com](https://faucet.circle.com) → Algorand Testnet |

The **buyer** wallet must hold USDC — it pays for signals via x402.

---

## 3. OpenAI (analyst AI signals)

| Env var | Where to get it |
|---------|-----------------|
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) → **Create new secret key** |
| `OPENAI_MODEL` | Optional, default `gpt-4o-mini` (cheaper). Use `gpt-4o` for higher quality. |

SIGNET uses OpenAI to generate signal title, direction, confidence, and reasoning from live CoinGecko prices.

**Cost:** A few cents per analyst run with `gpt-4o-mini`.

---

## 4. Alpha Arcade (reputation / bonus track)

| Env var | Where to get it |
|---------|-----------------|
| `ALPHA_API_KEY` | [alphaarcade.com](https://alphaarcade.com) → sign up → **Account → Partners → Create API key** |
| `ALPHA_NETWORK` | Set to `testnet` |
| `ALPHA_USDC_ASA_ID` | `10458941` (testnet USDC) |
| `ALPHA_MATCHER_APP_ID` | Optional — SDK discovers markets on-chain if empty |

Docs: [github.com/phara23/alpha-sdk](https://github.com/phara23/alpha-sdk#getting-an-api-key)

Without this key, Alpha market matching is limited. Full E2E test requires it.

---

## 5. x402 / Algorand nodes (no signup)

| Env var | Value |
|---------|-------|
| `FACILITATOR_URL` | `https://facilitator.goplausible.xyz` |
| `X402_SERVER_URL` | `http://localhost:4021` (or your deployed URL) |
| `VITE_X402_SERVER_URL` | Same as above |
| `VITE_APP_ORIGIN` | `http://localhost:5173` (your frontend URL) |
| `ALGORAND_ALGOD_URL` | `https://testnet-api.algonode.cloud` |
| `ALGORAND_INDEXER_URL` | `https://testnet-idx.algonode.cloud` |

No API keys — public Algorand endpoints + GoPlausible facilitator.

---

## 6. Folks Finance (xALGO treasury — optional but recommended)

| Env var | Where to get it |
|---------|-----------------|
| `FOLKS_XALGO_APP_ID` | Leave empty to use SDK testnet defaults, or [Folks docs](https://docs.folks.finance/) |
| `FOLKS_XALGO_ASA_ID` | Leave empty for SDK defaults |
| `AUTO_STAKE_XALGO` | Set `true` to stake idle analyst revenue on-chain |

Testnet UI: [testnet.folks.finance/liquid-staking](https://testnet.folks.finance/liquid-staking)

No separate API key — uses your `ANALYST_MNEMONIC` for transactions.

---

## Complete `.env.local` template

```bash
# Database
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Wallets
AVM_ADDRESS=ANALYST...
ANALYST_MNEMONIC=word1 word2 ... word25
BUYER_ADDRESS=BUYER...
BUYER_MNEMONIC=word1 word2 ... word25

# x402
FACILITATOR_URL=https://facilitator.goplausible.xyz
X402_SERVER_URL=http://localhost:4021
VITE_X402_SERVER_URL=http://localhost:4021
VITE_APP_ORIGIN=http://localhost:5173

# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini

# Alpha Arcade
ALPHA_API_KEY=your_key
ALPHA_NETWORK=testnet
ALPHA_USDC_ASA_ID=10458941

# Folks
AUTO_STAKE_XALGO=true

# Algorand
ALGORAND_ALGOD_URL=https://testnet-api.algonode.cloud
ALGORAND_INDEXER_URL=https://testnet-idx.algonode.cloud
```

Copy the same file to `server/.env` (or use `server/.env.template` as a guide).

---

## Verify everything works

```bash
npm run server:start   # terminal 1
npm run dev            # terminal 2
```

1. Open `/agents` — health banner should show **liveReady**
2. Click **Run Full E2E Test**
3. Analyst creates signal (OpenAI) → Buyer pays USDC (x402) → Alpha links market → Folks stake step runs

---

## Security notes

- Never commit `.env.local` or `server/.env`
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in the frontend
- Store mnemonics only in server-side env, never in browser
- Rotate keys if leaked
