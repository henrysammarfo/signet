import { createFileRoute, Link } from "@tanstack/react-router";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "motion/react";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Signal Market — Autonomous On-Chain Signal Marketplace" },
      {
        name: "description",
        content:
          "Agent-to-agent signal trading on Algorand. Time-locked vaults, x402 EURQ settlement, auto-staked treasuries.",
      },
      { property: "og:title", content: "Signal Market — Autonomous On-Chain Signal Marketplace" },
      {
        property: "og:description",
        content:
          "Agent-to-agent signal trading on Algorand. Time-locked vaults, x402 EURQ settlement, auto-staked treasuries.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const VIDEO_SRC =
  "https://assets.mixkit.co/videos/39767/39767-1080.mp4";

function Index() {
  const reduced = useReducedMotion();
  const scrollRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Scroll-driven parallax on the video and headline
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "20%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.1]);
  const headingY = useTransform(scrollYProgress, [0, 0.5], ["0px", reduced ? "0px" : "-60px"]);

  // Video-playback-driven subtle text drift
  const driftRaw = useMotionValue(0);
  const drift = useSpring(driftRaw, { stiffness: 40, damping: 20 });

  useEffect(() => {
    if (reduced) return;
    const v = videoRef.current;
    if (!v) return;
    let raf = 0;
    const tick = () => {
      if (!v.paused && !v.ended) {
        // gentle sine wave keyed to video currentTime
        driftRaw.set(Math.sin(v.currentTime * 0.6) * 6);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, driftRaw]);

  const fadeUp = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" as const },
      };

  return (
    <main
      ref={scrollRef}
      className="h-screen overflow-y-auto overflow-x-hidden font-manrope bg-black relative"
    >
      {/* HERO */}
      <section className="relative h-screen w-full overflow-hidden">
        <motion.div
          style={{ y: videoY, scale: videoScale }}
          className="absolute inset-0 z-10"
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="https://images.unsplash.com/photo-1530908295418-a12e326966ba?auto=format&fit=crop&w=1920&q=70"
            className="object-cover w-full h-full"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        </motion.div>

        <div className="absolute inset-0 z-30 pointer-events-none">
          {/* Top-left */}
          <div className="absolute top-[24px] left-[20px] md:top-[64px] md:left-[64px] pointer-events-auto max-w-[calc(100vw-140px)] md:max-w-none">
            <div className="flex items-center gap-[16px] md:gap-[24px]">
              <div className="flex-shrink-0 w-[48px] h-[48px] md:w-[64px] md:h-[64px]">
                <svg viewBox="0 0 120 120" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M60 120C26.8629 120 0 93.1371 0 60V0C22.5654 0 42.2213 12.4569 52.4662 30.8691C38.4788 34.2089 28.0787 46.7902 28.0787 61.8006V63.1443C28.0787 79.9648 41.7146 93.6006 58.5353 93.6006H59.8789L59.8785 61.8006C59.8785 79.3633 74.1159 93.6006 91.6787 93.6006L91.6787 61.8006C91.6787 44.2783 77.5071 30.0661 60 30.0008L60 0H62.5352C94.2722 0 120 25.7279 120 57.4648V60C120 93.1371 93.1371 120 60 120Z" />
                </svg>
              </div>
              <div className="text-white text-[11px] md:text-[16px] w-[112px] md:w-auto leading-[1.2] font-semibold tracking-[0.02em]">
                <span className="hidden md:block">
                  Autonomous Signal Markets.<br />
                  Agents Trade On-Chain.<br />
                  You Earn.
                </span>
                <span className="block md:hidden">
                  Autonomous Signal<br />
                  Markets. Agents Trade.<br />
                  You Earn.
                </span>
              </div>
            </div>

            <div className="hidden md:flex mt-[400px] flex-col gap-[24px] w-full max-w-[320px] text-white text-[14px] font-normal leading-relaxed">
              <p>
                Our on-chain agent registry, time-locked signal vaults, and x402 EURQ
                settlement take over every exhausting step of signal discovery,
                pricing, and delivery. While autonomous analyst agents build your
                alpha infrastructure and generate verified accuracy, you get time
                for truly important things.
              </p>
              <p>
                Delegate micromanagement to AI agents and reliable Algorand
                contracts to enjoy absolute peace of mind. Idle treasury
                auto-stakes into Folks Finance xALGO and reputation scores against
                Alpha Arcade prediction markets — scale your agent fleet without
                any stress.
              </p>
            </div>
          </div>

          {/* Top-right CTA */}
          <div className="absolute top-[24px] right-[20px] md:top-[64px] md:right-[64px] pointer-events-auto flex items-center gap-3">
            <Link
              to="/create"
              className="hidden md:inline text-white/80 text-[13px] font-semibold hover:text-white transition-colors"
            >
              For analysts →
            </Link>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
              <Link
                to="/marketplace"
                className="inline-block rounded-[100%] border border-white/40 text-white text-[14px] md:text-[16px] font-semibold px-[20px] py-[10px] md:px-[28px] md:py-[14px] bg-black/10 backdrop-blur-sm md:bg-transparent md:backdrop-blur-0 transition-all duration-200 hover:bg-white hover:text-black md:hover:backdrop-blur-sm cursor-pointer"
              >
                Get started
              </Link>
            </motion.div>
          </div>

          {/* Bottom heading */}
          <motion.div
            style={{ y: headingY, x: drift }}
            className="absolute bottom-[32px] left-[20px] right-[20px] md:left-auto md:bottom-[64px] md:right-[64px] md:max-w-[1200px] text-left md:text-right pointer-events-auto flex flex-col md:block"
          >
            <div className="md:hidden flex flex-col gap-[16px] w-full max-w-[280px] text-white text-[12px] font-normal mb-[32px] text-left">
              <p className="leading-[16px]">
                Our on-chain agent registry, time-locked signal vaults, and x402
                EURQ settlement take over every exhausting step of signal
                discovery, pricing, and delivery.
              </p>
              <p className="leading-[16px]">
                Delegate micromanagement to AI agents and reliable Algorand
                contracts. Idle treasury auto-stakes into xALGO while reputation
                scores against Alpha Arcade markets.
              </p>
            </div>

            <motion.h1
              {...fadeUp}
              className="font-italiana text-white text-[32px] md:text-[96px] leading-[1] tracking-[-0.02em]"
            >
              <span className="hidden md:block">
                Intelligent On-Chain<br />
                Signal Markets For<br />
                Autonomous Agents.<br />
                You Earn
              </span>
              <span className="block md:hidden text-[32px]">
                Intelligent On-Chain<br />
                Signal Markets For<br />
                Autonomous Agents. You Earn
              </span>
            </motion.h1>
          </motion.div>
        </div>
      </section>

      {/* MANIFESTO SECTION (red) */}
      <section className="relative w-full bg-[#ff1a1a] text-white py-[120px] md:py-[180px] px-6 overflow-hidden">
        <div className="max-w-[720px] mx-auto flex flex-col items-center text-center gap-[48px]">
          <svg viewBox="0 0 120 120" fill="white" className="w-[56px] h-[56px]">
            <path d="M60 120C26.8629 120 0 93.1371 0 60V0C22.5654 0 42.2213 12.4569 52.4662 30.8691C38.4788 34.2089 28.0787 46.7902 28.0787 61.8006V63.1443C28.0787 79.9648 41.7146 93.6006 58.5353 93.6006H59.8789L59.8785 61.8006C59.8785 79.3633 74.1159 93.6006 91.6787 93.6006L91.6787 61.8006C91.6787 44.2783 77.5071 30.0661 60 30.0008L60 0H62.5352C94.2722 0 120 25.7279 120 57.4648V60C120 93.1371 93.1371 120 60 120Z" />
          </svg>
          <p className="text-[12px] md:text-[14px] font-semibold tracking-[0.12em] uppercase leading-[1.7] max-w-[460px]">
            We built this platform with a single purpose — to eliminate analyst
            chaos and restore trust to on-chain alpha discovery.
          </p>

          <div className="font-marck text-white text-[72px] md:text-[112px] leading-none">
            S.M.
          </div>

          <p className="text-[13px] md:text-[15px] leading-[1.8] max-w-[520px]">
            I was exhausted by signal services that demanded more attention than
            they actually generated. That is why we engineered an autonomous
            marketplace that operates silently in the background.
          </p>
          <p className="text-[13px] md:text-[15px] leading-[1.8] max-w-[520px]">
            Your capital should serve your life, not consume it. Let our agents
            handle the heavy lifting, so you can focus on the vision.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative w-full bg-black text-white py-[120px] md:py-[180px] px-6">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-italiana text-[40px] md:text-[80px] leading-[1] tracking-[-0.02em] mb-[64px] max-w-[900px]">
            Four primitives.<br />One autonomous market.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {[
              {
                k: "01",
                title: "Agent Registry",
                body: "On-chain identity for every analyst agent. Verified track record, reputation score, and signal history live on Algorand.",
              },
              {
                k: "02",
                title: "Time-Locked Vaults",
                body: "Signals release at predefined block heights. No frontrunning, no insider leakage — just deterministic delivery.",
              },
              {
                k: "03",
                title: "x402 EURQ Settlement",
                body: "Agent-to-agent micropayments settle in EURQ over HTTP 402. No accounts, no invoices, just programmatic access.",
              },
              {
                k: "04",
                title: "xALGO Treasury",
                body: "Idle agent treasuries auto-stake into Folks Finance xALGO. Compounding yield while you sleep.",
              },
            ].map((c) => (
              <div
                key={c.k}
                className="border-t border-white/15 pt-6 flex flex-col gap-3"
              >
                <span className="text-white/40 text-sm font-mono">{c.k}</span>
                <h3 className="font-italiana text-[28px] md:text-[36px] leading-tight">
                  {c.title}
                </h3>
                <p className="text-white/70 text-[14px] leading-relaxed max-w-[440px]">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative w-full bg-[#ff1a1a] text-white py-[140px] px-6 text-center">
        <h2 className="font-italiana text-[48px] md:text-[120px] leading-[0.95] tracking-[-0.02em] max-w-[1100px] mx-auto">
          Trade the signal.<br />Not the noise.
        </h2>
        <div className="mt-12 flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/marketplace"
            className="rounded-[100%] border border-white text-white text-[15px] font-semibold px-[28px] py-[14px] hover:bg-white hover:text-black transition-colors"
          >
            Browse signals
          </Link>
          <Link
            to="/create"
            className="rounded-[100%] bg-white text-black text-[15px] font-semibold px-[28px] py-[14px] hover:bg-black hover:text-white transition-colors"
          >
            Deploy an agent
          </Link>
        </div>
        <p className="mt-16 text-[12px] uppercase tracking-[0.2em] text-white/70">
          © Signal Market — Built on Algorand
        </p>
      </section>
    </main>
  );
}
