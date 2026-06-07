# SIGNET — Deep Integration Resources

Follow these repos and docs in this order for the hackathon stack.

## 1. x402 on Algorand (critical path)

**Repo:** [algorandfoundation/x402-demo](https://github.com/algorandfoundation/x402-demo)

SIGNET's payment layer mirrors `x402-basic-tutorial/server`:
- `@x402/hono` + `paymentMiddleware`
- `@x402/core/server` + GoPlausible facilitator
- Testnet USDC ASA `10458941` (Circle faucet)

**Our implementation:** [`server/index.ts`](../server/index.ts)

**Buyer agent:** [`packages/agents/buyer.ts`](../packages/agents/buyer.ts) uses `@x402/fetch` + `ExactAvmScheme` from the demo client.

**Portal:** [x402 on Algorand — Developer Portal](https://dev.algorand.co/resources/x402-on-algorand/)

---

## 2. Alpha Arcade — reputation / bonus track

| Resource | Use in SIGNET |
|----------|---------------|
| [@alpha-arcade/sdk](https://github.com/phara23/alpha-sdk) | Discover live markets, read orderbooks, verify signal direction |
| [@alpha-arcade/mcp](https://github.com/phara23/alpha-mcp) | Optional Cursor MCP for agent tooling (`get_live_markets`, `get_orderbook`) |
| [alphaarcade.com](https://alphaarcade.com) | Get `ALPHA_API_KEY` (Partners tab) for richer market data |

**Our implementation:**
- [`shared/bonus/alpha-client.ts`](../shared/bonus/alpha-client.ts) — `AlphaClient` factory
- [`shared/bonus/arcade.ts`](../shared/bonus/arcade.ts) — match signal → live market, verify via orderbook midpoint

**Note:** The SDK trades on existing markets; SIGNET links each signal to the best matching live Alpha market rather than creating new ones programmatically.

**Env:**
```bash
ALPHA_API_KEY=          # optional — richer discovery
ALPHA_MNEMONIC=         # optional — trading tools
ALPHA_NETWORK=testnet
ALPHA_MATCHER_APP_ID=   # testnet matcher (ask mentor)
```

---

## 3. Folks Finance — xALGO treasury / bonus track

**Docs:** [docs.folks.finance](https://docs.folks.finance/)

Key sections:
- [xALGO Liquid Staking](https://docs.folks.finance/) — product overview
- [V2 Testnet tips](https://docs.folks.finance/) — testnet setup
- [Official SDKs](https://docs.folks.finance/developer/official-sdks)

**SDK:** [@folks-finance/algorand-sdk](https://github.com/Folks-Finance/algorand-js-sdk)

**Testnet UI:** [testnet.folks.finance/liquid-staking](https://testnet.folks.finance/liquid-staking)

**Our implementation:** [`shared/bonus/yield.ts`](../shared/bonus/yield.ts)
- Reads consensus state via `parseXAlgoConsensusV2GlobalState`
- Optional on-chain mint when `AUTO_STAKE_XALGO=true`
- Demo fallback computes yield from USDC earnings

**Env:**
```bash
FOLKS_XALGO_APP_ID=
FOLKS_XALGO_ASA_ID=
AUTO_STAKE_XALGO=false
```

---

## 4. SIGNET architecture map

```
Frontend (TanStack Start)
  └── createServerFn → shared/db (Supabase or data/signet.json)
  └── /agents → runDemo → analyst + buyer + arcade + yield

x402 Server (Hono :4021)
  └── GET /signals/:id → paymentMiddleware → USDC → reveal content

Agents (packages/agents)
  └── analyst.ts → CoinGecko + Claude → createSignal
  └── buyer.ts → @x402/fetch → pay for signal
```

---

## 5. Mentor questions (technical hooks)

**Alpha Arcade / Mark:**
> We're linking analyst signals to live Alpha markets via `@alpha-arcade/sdk` `getLiveMarkets()` — what's the recommended testnet matcher app ID and market-matching pattern for agent-generated predictions?

**Folks / Camilo:**
> For agent treasury auto-stake, should we use `prepareImmediateMintFromXAlgoConsensusV2` on testnet — and what are the current testnet xALGO app + ASA IDs?

**Algorand Foundation / SJ:**
> For per-signal dynamic x402 pricing on `GET /signals/:id`, is `setSettlementOverrides` the right pattern with `@x402/hono` v2.14?

---

## 6. Run order

```bash
npm install --legacy-peer-deps
cd server && npm install && cd ..
cd packages/agents && npm install && cd ../..

# Terminal 1
npm run server:start

# Terminal 2
npm run dev

# Demo
open http://localhost:5173/agents → Run Full Demo
```
