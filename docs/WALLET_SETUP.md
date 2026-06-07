# SIGNET Wallet Setup — Lute (Testnet)

Pera is mobile-only. **Lute** works in Chrome on desktop — use it for `/create` and create separate accounts for your autonomous agents.

## What to select in Lute

From **Add an Account**, create **two Algo25 accounts** (one analyst, one buyer):

| Option | Use for SIGNET? | Why |
|--------|-----------------|-----|
| **Algo25 Account** | ✅ **Yes — pick this** | 25-word mnemonic. Matches `ANALYST_MNEMONIC` / `BUYER_MNEMONIC` in `.env` |
| HD Wallet (24-word) | ⚠️ Avoid for agents | Different seed format — x402 buyer agent expects Algo25 |
| Ledger Account | Optional later | Hardware wallet — good for mainnet, overkill for testnet demo |
| Multi-Sig Account | ❌ No | Not needed for MVP |
| 12-Word Account | ❌ No | Exodus/Trust import — skip |

### Step-by-step

1. Install [Lute Chrome extension](https://chromewebstore.google.com/detail/lute/kiaoohollfkjhikdifohdckeidckokjh)
2. Open Lute → **Settings → Network → Testnet**
3. **Add an Account → Algo25 Account** → name it `SIGNET Analyst`
4. Copy the **25-word phrase** → `.env.local` as `ANALYST_MNEMONIC`
5. Copy the **address** → `AVM_ADDRESS`
6. Repeat steps 3–5 for a second account named `SIGNET Buyer` → `BUYER_MNEMONIC` + `BUYER_ADDRESS`

**Never commit mnemonics.** Store only in `.env.local` and `server/.env`.

## Fund both accounts

| Asset | Faucet |
|-------|--------|
| ALGO | [Lora](https://lora.algokit.io/testnet/fund) |
| USDC (ASA 10458941) | [Circle](https://faucet.circle.com) → Algorand Testnet |

The **buyer** account must have USDC — it pays for signals via x402.

## Connect in SIGNET UI

1. Open `/create` or click **Connect Wallet** in the nav
2. SIGNET tries `window.algorand` first, then **Lute Connect**
3. Approve testnet connection in the Lute popup
4. Your connected address becomes the analyst `payTo` when you publish signals

## Agent wallets vs browser wallet

| Role | Where it lives | Env vars |
|------|----------------|----------|
| Analyst agent (CLI) | Algo25 #1 | `AVM_ADDRESS`, `ANALYST_MNEMONIC` |
| Buyer agent (CLI) | Algo25 #2 | `BUYER_ADDRESS`, `BUYER_MNEMONIC` |
| Human publish (`/create`) | Lute browser connect | Uses connected address — can be same as analyst account |

Using the **same analyst account** in Lute and in `AVM_ADDRESS` is fine and recommended.

## Berlin pitch note

If no co-presenter is available, record a **2-minute screen capture**: marketplace → agent console E2E → x402 payment. SJ’s team is stretched finding on-site helpers — a polished remote demo video is a strong backup.
