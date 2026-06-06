import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";

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

function Index() {
  return (
    <main className="h-screen overflow-y-auto overflow-x-hidden font-manrope bg-black relative">
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background video */}
        <div className="absolute inset-0 z-10">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="object-cover w-full h-full"
          >
            <source
              src="https://res.cloudinary.com/daklr2whx/video/upload/v1778592404/baby-track-video_e968wn.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {/* Top-left: logo + tagline + desktop description */}
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

            {/* Desktop left description */}
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
          <div className="absolute top-[24px] right-[20px] md:top-[64px] md:right-[64px] pointer-events-auto">
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="rounded-[100%] border border-white/40 text-white text-[14px] md:text-[16px] font-semibold px-[20px] py-[10px] md:px-[28px] md:py-[14px] bg-black/10 backdrop-blur-sm md:bg-transparent md:backdrop-blur-0 transition-all duration-200 hover:bg-white hover:text-black md:hover:backdrop-blur-sm cursor-pointer"
            >
              Get started
            </motion.button>
          </div>

          {/* Bottom heading area */}
          <div className="absolute bottom-[32px] left-[20px] right-[20px] md:left-auto md:bottom-[64px] md:right-[64px] md:max-w-[1200px] text-left md:text-right pointer-events-auto flex flex-col md:block">
            {/* Mobile-only description */}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
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
          </div>
        </div>
      </section>
    </main>
  );
}
