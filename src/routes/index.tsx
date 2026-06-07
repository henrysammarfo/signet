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

const VIDEO_SRC =
  import.meta.env.VITE_HERO_VIDEO_URL ??
  HERO_VIDEO_LOCAL;

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

function Index() {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [poster, setPoster] = useState(POSTER_DESKTOP);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const updatePoster = () => setPoster(mq.matches ? POSTER_MOBILE : POSTER_DESKTOP);
    updatePoster();
    mq.addEventListener("change", updatePoster);
    return () => mq.removeEventListener("change", updatePoster);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const play = () => video.play().catch(() => undefined);
    play();
    video.addEventListener("canplay", play);
    return () => video.removeEventListener("canplay", play);
  }, [poster]);

  const fadeUp = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" as const },
      };

  return (
    <main className="min-h-dvh w-full overflow-x-hidden font-manrope bg-black relative">
      {/* ── HERO (template spec) ── */}
      <section className="relative min-h-dvh h-dvh w-full overflow-hidden">
        <div className="absolute inset-0 z-10 bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={poster}
            className="object-cover object-center w-full h-full"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        </div>

        <div className="absolute inset-0 z-30 pointer-events-none">
          {/* Top-left: logo + tagline */}
          <div className="absolute top-[24px] left-[20px] md:top-[64px] md:left-[64px] pointer-events-auto max-w-[calc(100vw-140px)] md:max-w-none">
            <div className="flex items-center gap-[16px] md:gap-[24px]">
              <div className="flex-shrink-0 w-[48px] h-[48px] md:w-[64px] md:h-[64px]">
                <SignetLogo />
              </div>
              <div className="text-white text-[11px] md:text-[16px] w-[112px] md:w-auto leading-[1.2] font-semibold tracking-[0.02em]">
                <span className="hidden md:block">
                  Verified Signal Oracle.
                  <br />
                  Agents Settle On-Chain.
                  <br />
                  You Prosper.
                </span>
                <span className="block md:hidden">
                  Verified Signal
                  <br />
                  Oracle. Agents Settle
                  <br />
                  On-Chain. You Prosper.
                </span>
              </div>
            </div>
          </div>

          {/* Bottom-left: desktop paragraphs */}
          <div className="pointer-events-auto absolute bottom-[32px] left-[20px] hidden max-w-[280px] flex-col gap-[24px] text-left text-[14px] font-normal leading-relaxed text-white md:bottom-[64px] md:left-[64px] md:flex md:max-w-[320px]">
            {DESKTOP_PARAS.map((text) => (
              <p key={text.slice(0, 24)}>{text}</p>
            ))}
          </div>

          {/* Top-right: CTA */}
          <div className="absolute top-[24px] right-[20px] md:top-[64px] md:right-[64px] pointer-events-auto">
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
              <Link
                to="/marketplace"
                className="inline-block rounded-[100%] border border-white/40 text-white text-[14px] md:text-[16px] font-semibold px-[20px] py-[10px] md:px-[28px] md:py-[14px] bg-black/10 backdrop-blur-sm md:bg-transparent md:backdrop-blur-0 transition-all duration-200 hover:bg-white hover:text-black md:hover:backdrop-blur-sm"
              >
                Get started
              </Link>
            </motion.div>
          </div>

          {/* Bottom: heading + mobile paragraphs */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.25 }}
            className="absolute bottom-[32px] left-[20px] right-[20px] md:left-auto md:bottom-[64px] md:right-[64px] md:max-w-[1200px] text-left md:text-right pointer-events-auto flex flex-col md:block"
          >
            <div className="md:hidden flex flex-col gap-[16px] w-full max-w-[280px] text-white text-[12px] font-normal mb-[32px] text-left">
              {DESKTOP_PARAS.map((text) => (
                <p key={text.slice(0, 20)} className="leading-[16px]">
                  {text}
                </p>
              ))}
            </div>

            <h1 className="font-italiana text-white text-[32px] md:text-[96px] leading-[1] tracking-[-0.02em]">
              <span className="hidden md:block">
                Intelligent On-Chain
                <br />
                Signal Markets For
                <br />
                Autonomous Agents.
                <br />
                You Earn
              </span>
              <span className="block md:hidden">
                Intelligent On-Chain Signal Markets For Autonomous Agents. You Earn
              </span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ── MANIFESTO — wine / classical (matches template scroll tone) ── */}
      <section className="relative w-full bg-[#5c1212] text-white py-[120px] md:py-[160px] px-6 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f5e6d3]/20 to-transparent"
          aria-hidden
        />
        <div className="max-w-[720px] mx-auto flex flex-col items-center text-center gap-[40px] relative z-10">
          <SignetLogo className="w-[56px] h-[56px]" />
          <p className="text-[11px] md:text-[13px] font-semibold tracking-[0.14em] uppercase leading-[1.8] max-w-[480px] text-white/90">
            We built this oracle with a single purpose — to eliminate signal chaos and restore trust to
            on-chain alpha discovery.
          </p>
          <p className="font-marck text-white text-[64px] md:text-[96px] leading-none tracking-wide">
            SIGNET
          </p>
          <p className="font-italiana text-[22px] md:text-[28px] text-white/80 italic">
            Σήμα · Signal · Seal
          </p>
        </div>
      </section>

      {/* ── PHILOSOPHERS — full-width middle band ── */}
      <section className="relative w-full min-h-[75vh] flex items-center justify-center px-6 py-[100px] md:py-[120px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${POSTER_PHILOSOPHERS})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[#0A0F1E]/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/80 via-transparent to-[#0A0F1E]/80" />
        <div className="relative z-10 max-w-[640px] text-center">
          <p className="text-[13px] md:text-[16px] leading-[1.9] text-white/90 font-normal">
            Your capital should serve your vision, not consume it. Let our agents handle discovery,
            settlement, and reputation on Algorand testnet — so you can focus on the thesis.
          </p>
          <Link
            to="/agents"
            className="mt-10 inline-block rounded-[100%] border border-white/50 text-white text-[14px] font-semibold px-[28px] py-[12px] hover:bg-white hover:text-[#0A0F1E] transition-colors"
          >
            Meet the agents
          </Link>
        </div>
      </section>

      {/* ── FOUR PRIMITIVES ── */}
      <section className="relative w-full bg-[#0A0F1E] text-white py-[120px] md:py-[160px] px-6">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-italiana text-[40px] md:text-[80px] leading-[1] tracking-[-0.02em] mb-[64px] max-w-[900px]">
            Four primitives.
            <br />
            One autonomous market.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
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
              <div key={c.k} className="border-t border-[#C9A962]/30 pt-6 flex flex-col gap-3">
                <span className="font-italiana text-[#C9A962] text-2xl">{c.k}</span>
                <h3 className="font-italiana text-[28px] md:text-[36px] leading-tight">{c.title}</h3>
                <p className="text-white/70 text-[14px] leading-relaxed max-w-[440px]">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="relative w-full bg-[#5c1212] text-white py-[120px] md:py-[140px] px-6 text-center overflow-hidden">
        <h2 className="font-italiana text-[48px] md:text-[96px] leading-[0.95] tracking-[-0.02em] max-w-[1000px] mx-auto">
          Trade the signal.
          <br />
          Not the noise.
        </h2>
        <div className="mt-12 flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/marketplace"
            className="rounded-[100%] border border-white text-white text-[15px] font-semibold px-[28px] py-[14px] hover:bg-white hover:text-[#5c1212] transition-colors"
          >
            Browse signals
          </Link>
          <Link
            to="/create"
            className="rounded-[100%] bg-white text-[#5c1212] text-[15px] font-semibold px-[28px] py-[14px] hover:bg-black hover:text-white transition-colors"
          >
            Publish as analyst
          </Link>
        </div>
        <p className="mt-16 text-[11px] uppercase tracking-[0.2em] text-white/60">
          © SIGNET — Algorand testnet · x402 USDC
        </p>
      </section>
    </main>
  );
}
