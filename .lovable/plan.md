# SIGNAL MARKET — Video Hero Section

Build a full-screen video hero as the landing page (`/`), matching the exact spec provided, themed for SIGNAL MARKET (an on-chain AI agent signal marketplace on Algorand).

## Scope

This plan covers ONLY the hero section / landing route. The smart contracts, x402 layer, AI agents, Alpha Arcade integration, and the other frontend routes (`/marketplace`, `/agent/:id`, `/create`, `/treasury`, `/leaderboard`) are out of scope for this turn — say the word and I'll plan those next.

## Files

1. **`src/styles.css`** — prepend Google Fonts `@import` (Italiana, Manrope 400/600, Marck Script) above the existing `@import "tailwindcss"`, then add a `@theme` block registering:
   - `--font-manrope`, `--font-italiana`, `--font-marck`
   Keep the existing shadcn token blocks intact.

2. **`src/routes/index.tsx`** — replace the placeholder with the hero. Update `head()` meta to SIGNAL MARKET copy (title, description, og tags).

3. **`src/routes/__root.tsx`** — add `preconnect` links to `fonts.googleapis.com` and `fonts.gstatic.com` in the root `links` array (fonts must be loaded via `<link>`, not CSS `@import` to a URL — but spec calls for the `@import`; I'll do BOTH: keep the spec's `@import` in CSS AND add preconnect for performance).
   - Note: per stack rules, `@import url(...)` of a remote stylesheet in `src/styles.css` breaks Lightning CSS. I will instead move the Google Fonts URL to a `<link rel="stylesheet">` in `__root.tsx` head and only keep the `@theme` font tokens in `src/styles.css`. This produces the same visual result while keeping the build green.

4. **`package.json`** — add `motion` dependency via `bun add motion` (imported as `motion/react`). Used for a subtle fade/slide-in on the heading and CTA.

## Hero composition (exact spec)

- Root `<main>`: `h-screen overflow-y-auto overflow-x-hidden font-manrope bg-black relative`
- `<section className="relative h-screen w-full overflow-hidden">`
  - **Video layer** (`absolute inset-0 z-10`): autoplay, muted, loop, playsInline, `object-cover w-full h-full`, source = Cloudinary `baby-track-video_e968wn.mp4`.
  - **Overlay** (`absolute inset-0 z-30 pointer-events-none`):
    - **Top-left**: SVG logo (120x120 viewBox, given path, white fill) + tagline. Tagline copy adapted to brand: "Autonomous Signal Markets. Agents Trade. You Earn." (desktop 3-line / mobile 3-line split per spec). Sizes and breakpoints exactly as specified.
    - **Left description** (desktop only, `mt-[400px]`, max-w-[320px]): two paragraphs rewritten for SIGNAL MARKET:
      - P1: on-chain agent registry, time-locked signal vaults, x402 EURQ settlement handling the heavy lifting while you collect yield.
      - P2: idle treasury auto-staked into Folks Finance xALGO; reputation scored against Alpha Arcade prediction markets — scale without micromanaging agents.
    - **Top-right CTA** button: pill (`rounded-[100%]`), label "Get started", mobile gets `bg-black/10 backdrop-blur-sm`, desktop transparent with hover state. Border + padding per spec.
    - **Bottom heading area**: mobile-only paragraph block (same two paragraphs, smaller), then `<h1>` in Italiana — desktop 96px 4-line, mobile 32px 3-line. Copy adapted: "Intelligent On-Chain / Signal Markets For / Autonomous Agents. / You Earn".
- Motion: heading and CTA fade up on mount with `motion.h1` / `motion.button` (200ms stagger, 600ms duration, ease-out). No layout shift.

## SEO / head

- title: "Signal Market — Autonomous On-Chain Signal Marketplace" (<60)
- description: one sentence on agent-to-agent signal trading on Algorand with x402 settlement (<160)
- og:title, og:description mirror; og:type=website

## Verification

After build I'll open the preview at desktop and mobile widths to confirm: video plays, layout matches spec at both breakpoints, fonts load (Italiana on the heading, Manrope elsewhere), no console errors, CTA hover state works, no dark overlay on video.

## Open question

The tagline and heading copy in the spec is generic ("Complete Business Automation…"). I'm rewriting it for SIGNAL MARKET as shown above. If you want the original placeholder copy verbatim instead, say so and I'll keep it.
