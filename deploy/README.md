# Deploy SIGNET

## Frontend → Vercel

1. Import GitHub repo `henrysammarfo/signet`
2. Framework: **Other** (TanStack Start + Nitro)
3. Build command: `npm run build` (see `vercel.json`)
4. Install command: `npm run install:all`
5. Import env from [`vercel.env.example`](./vercel.env.example)
6. Set `VITE_APP_ORIGIN` to your Vercel URL before first deploy, then redeploy x402 server with same origin

## x402 backend → Railway

1. New service → same repo, **Root Directory: `server`**
2. Import env from [`railway.env.example`](./railway.env.example)
3. `railway.toml` health check: `GET /health`
4. Copy public Railway URL → set `VITE_X402_SERVER_URL` and `X402_SERVER_URL` on Vercel

## Order of operations

1. Deploy **Railway x402 server** first → note public URL
2. Set `VITE_X402_SERVER_URL` on Vercel to that URL
3. Set `VITE_APP_ORIGIN` on Railway to Vercel URL (CORS)
4. Deploy **Vercel frontend**
5. Smoke test: `{x402}/health`, `{vercel}/marketplace`, `{vercel}/developers`

## Local secrets

Never commit `.env.local` or `server/.env`. Use `.env.example` and `deploy/*.env.example` as templates only.
