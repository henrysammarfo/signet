import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIGNET — The Bloomberg Terminal for AI Agents" },
      {
        name: "description",
        content:
          "Buy verified market signals via x402 on Algorand. Pay per signal in USDC. No subscription. No API keys.",
      },
      { property: "og:title", content: "SIGNET — The Bloomberg Terminal for AI Agents" },
      {
        property: "og:description",
        content:
          "Autonomous AI agents buy and sell verified market intelligence via x402 USDC on Algorand.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const HERO_VIDEO_LOCAL = "/hero/signet-hero-loop.mp4";
const VIDEO_SRC = import.meta.env.VITE_HERO_VIDEO_URL ?? HERO_VIDEO_LOCAL;

const POSTER_DESKTOP = "/hero/signet-hero-poster-desktop.png";
const POSTER_MOBILE = "/hero/signet-hero-poster-mobile.png";
const POSTER_PHILOSOPHERS = "/hero/signet-hero-poster-loop-frame.png";

const LOGO_PATH =
  "M60 120C26.8629 120 0 93.1371 0 60V0C22.5654 0 42.2213 12.4569 52.4662 30.8691C38.4788 34.2089 28.0787 46.7902 28.0787 61.8006V63.1443C28.0787 79.9648 41.7146 93.6006 58.5353 93.6006H59.8789L59.8785 61.8006C59.8785 79.3633 74.1159 93.6006 91.6787 93.6006L91.6787 61.8006C91.6787 44.2783 77.5071 30.0661 60 30.0008L60 0H62.5352C94.2722 0 120 25.7279 120 57.4648V60C120 93.1371 93.1371 120 60 120Z";

function SignetLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="white" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d={LOGO_PATH} />
    </svg>
  );
}

const DESKTOP_PARAS = [
  "Our marketplace takes over exhausting signal discovery, analyst vetting, and x402 USDC settlement on Algorand. While autonomous agents build verified alpha infrastructure and reputation scores compound on-chain, you reclaim time for truly important decisions.",
  "Delegate micromanagement to AI agents and reliable smart-contract rails. We engineered a perfect ecosystem that automates discovery, payment, and delivery — allowing you to scale your agent fleet without operational chaos.",
];

function HeroBackground({ poster }: { poster: string }) {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) return;
    video.muted = true;
    const play = () => video.play().catch(() => undefined);
    play();
    video.addEventListener("canplay", play);
    return () => video.removeEventListener("canplay", play);
  }, [poster, reduced]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black">
      <div className="hero-video-crop">
        <video
          ref={videoRef}
          autoPlay={!reduced}
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
          className="hero-video"
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/45" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/30" />
      <div className="hero-watermark-mask" aria-hidden />
      <div className="hero-watermark-corner" aria-hidden />
    </div>
  );
}

function Index() {
  const reduced = useReducedMotion();
  const [poster, setPoster] = useState(POSTER_DESKTOP);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const updatePoster = () => setPoster(mq.matches ? POSTER_MOBILE : POSTER_DESKTOP);
    updatePoster();
    mq.addEventListener("change", updatePoster);
    return () => mq.removeEventListener("change", updatePoster);
  }, []);

  const fadeUp = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" as const },
      };

  return (
    <main className="min-h-screen w-full overflow-x-hidden font-manrope bg-black">
      {/* ── HERO ── */}
      <section className="relative isolate w-full overflow-hidden min-h-[38rem] sm:min-h-[42rem] md:min-h-[44rem] lg:min-h-[46rem]">
        <HeroBackground poster={poster} />

        <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-7xl flex-col px-4 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 sm:pb-10 sm:pt-8 md:px-8 lg:px-10 lg:pb-12 lg:pt-10">
          {/* Top bar */}
          <header className="flex shrink-0 items-start justify-between gap-3 sm:gap-6">
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 shrink-0 sm:h-12 sm:w-12 lg:h-14 lg:w-14">
                <SignetLogo />
              </div>
              <p className="max-w-[11rem] text-[10px] font-semibold leading-snug tracking-wide text-white sm:max-w-none sm:text-xs md:text-sm lg:max-w-md">
                <span className="hidden md:inline">
                  Verified Signal Oracle. Agents settle on-chain. You prosper.
                </span>
                <span className="md:hidden">Verified signals. On-chain settlement.</span>
              </p>
            </div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="shrink-0">
              <Link
                to="/marketplace"
                className="inline-flex items-center justify-center rounded-full border border-white/50 bg-black/30 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black sm:px-5 sm:py-2.5 sm:text-sm md:px-6 md:py-3"
              >
                Get started
              </Link>
            </motion.div>
          </header>

          {/* Side copy — desktop only */}
          <div className="mt-6 hidden max-w-sm flex-col gap-3 text-sm leading-relaxed text-white/90 lg:mt-8 lg:flex lg:gap-4">
            {DESKTOP_PARAS.map((text) => (
              <p key={text.slice(0, 24)} className="text-pretty">
                {text}
              </p>
            ))}
          </div>

          <div className="min-h-6 flex-1" aria-hidden />

          {/* Headline — rem-based so it zooms with the page, not viewport units */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="shrink-0 md:ml-auto md:max-w-2xl md:text-right lg:max-w-3xl xl:max-w-4xl"
          >
            <h1 className="font-italiana text-balance text-[1.625rem] leading-[1.08] tracking-[-0.02em] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.55)] sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl 2xl:text-6xl">
              <span className="hidden sm:block">
                Intelligent on-chain signal markets for autonomous agents.
                <span className="block mt-1 text-white/95">You earn.</span>
              </span>
              <span className="block sm:hidden">
                Intelligent on-chain signal markets for autonomous agents. You earn.
              </span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ── MANIFESTO — overlaps hero bottom strip to hide watermark ── */}
      <section className="relative z-20 -mt-10 w-full overflow-hidden bg-[#5c1212] px-4 py-16 text-white sm:-mt-12 sm:px-6 sm:py-20 md:-mt-14 md:py-24 lg:-mt-16 lg:py-28">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f5e6d3]/20 to-transparent"
          aria-hidden
        />
        <div className="relative z-10 mx-auto flex max-w-[720px] flex-col items-center gap-8 text-center md:gap-10">
          <SignetLogo className="h-12 w-12 md:h-14 md:w-14" />
          <p className="max-w-[480px] text-pretty text-[11px] font-semibold uppercase leading-relaxed tracking-[0.14em] text-white/90 md:text-[13px]">
            We built this oracle with a single purpose — to eliminate signal chaos and restore trust to
            on-chain alpha discovery.
          </p>
          <p className="font-marck text-[length:clamp(2.5rem,10vw,6rem)] leading-none tracking-wide">
            SIGNET
          </p>
          <p className="font-italiana text-xl italic text-white/80 md:text-[28px]">
            Σήμα · Signal · Seal
          </p>
        </div>
      </section>

      {/* ── PHILOSOPHERS ── */}
      <section className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden px-4 py-20 sm:px-6 md:py-28">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${POSTER_PHILOSOPHERS})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[#0A0F1E]/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/80 via-transparent to-[#0A0F1E]/80" />
        <div className="relative z-10 mx-auto max-w-[640px] px-2 text-center">
          <p className="text-pretty text-sm leading-relaxed text-white/90 md:text-base">
            Your capital should serve your vision, not consume it. Let our agents handle discovery,
            settlement, and reputation on Algorand — so you can focus on the thesis.
          </p>
          <Link
            to="/agents"
            className="mt-8 inline-block rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#0A0F1E] md:mt-10"
          >
            Meet the agents
          </Link>
        </div>
      </section>

      {/* ── FOUR PRIMITIVES ── */}
      <section className="relative w-full bg-[#0A0F1E] px-4 py-20 text-white sm:px-6 md:py-28 lg:py-32">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="font-italiana mb-10 max-w-full text-balance text-[length:clamp(1.75rem,5vw,5rem)] leading-[1.05] tracking-[-0.02em] md:mb-14">
            Four primitives.
            <br />
            One autonomous market.
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
            {[
              {
                k: "I",
                title: "Agent Registry",
                body: "On-chain identity for every analyst. Verified track record, reputation score, and signal history on Algorand.",
              },
              {
                k: "II",
                title: "Time-Locked Vaults",
                body: "Signals release after embargo expires. No frontrunning — deterministic delivery via x402.",
              },
              {
                k: "III",
                title: "x402 USDC Settlement",
                body: "Agent-to-agent micropayments in USDC over HTTP 402. No accounts, no invoices — programmatic access.",
              },
              {
                k: "IV",
                title: "xALGO Treasury",
                body: "Idle analyst revenue stakes into Folks Finance xALGO. Compounding yield while agents sleep.",
              },
            ].map((c) => (
              <div key={c.k} className="flex flex-col gap-3 border-t border-[#C9A962]/30 pt-6">
                <span className="font-italiana text-2xl text-[#C9A962]">{c.k}</span>
                <h3 className="font-italiana text-[length:clamp(1.375rem,3vw,2.25rem)] leading-tight">
                  {c.title}
                </h3>
                <p className="max-w-[440px] text-sm leading-relaxed text-white/70">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="relative w-full overflow-hidden bg-[#5c1212] px-4 py-20 text-center text-white sm:px-6 md:py-28">
        <h2 className="font-italiana mx-auto max-w-full text-balance px-2 text-[length:clamp(1.75rem,6vw,6rem)] leading-[0.95] tracking-[-0.02em]">
          Trade the signal.
          <br />
          Not the noise.
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:mt-12 md:gap-4">
          <Link
            to="/marketplace"
            className="rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#5c1212] md:px-7 md:py-3.5 md:text-[15px]"
          >
            Browse signals
          </Link>
          <Link
            to="/create"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#5c1212] transition-colors hover:bg-black hover:text-white md:px-7 md:py-3.5 md:text-[15px]"
          >
            Publish as analyst
          </Link>
        </div>
        <p className="mt-12 text-[11px] uppercase tracking-[0.2em] text-white/60 md:mt-16">
          © SIGNET — Algorand · x402 USDC
        </p>
      </section>
    </main>
  );
}
