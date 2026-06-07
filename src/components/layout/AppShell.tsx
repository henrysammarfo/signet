import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

import { WalletButton } from "../wallet/WalletButton";

const NAV = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/create", label: "Publish" },
  { to: "/agents", label: "Dashboard" },
  { to: "/developers", label: "For agents" },
  { to: "/treasury", label: "Treasury" },
  { to: "/leaderboard", label: "Leaderboard" },
] as const;

export function PageHeader({
  title,
  subtitle,
  minimal = false,
}: {
  title: string;
  subtitle?: string;
  minimal?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
      <div className="max-w-[960px] mx-auto w-full px-4 sm:px-5 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          <Link
            to="/"
            className="shrink-0 text-sm font-medium tracking-wide text-white/90 hover:text-white"
          >
            SIGNET
          </Link>

          <nav className="hidden xl:flex items-center gap-0.5 min-w-0 flex-1 justify-center">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-2.5 py-1.5 rounded-md text-[12px] lg:text-[13px] whitespace-nowrap transition-colors ${
                    active ? "text-white bg-white/10" : "text-white/45 hover:text-white/80"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <WalletButton />
            <button
              type="button"
              className="xl:hidden text-xs text-white/50 px-2 py-1"
              onClick={() => setOpen((v) => !v)}
            >
              Menu
            </button>
          </div>
        </div>

        {open && (
          <nav className="xl:hidden flex flex-col pt-3 pb-1 border-t border-white/[0.06] mt-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm text-white/70"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {!minimal && (
          <div className="mt-6 md:mt-8 pb-4 md:pb-6">
            <h1 className="text-2xl sm:text-[26px] md:text-[32px] font-medium tracking-tight text-white break-words">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[13px] sm:text-[14px] text-white/40 mt-2 max-w-lg leading-relaxed break-words">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
  minimal = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  minimal?: boolean;
}) {
  return (
    <main className="min-h-dvh w-full overflow-x-hidden bg-black text-white font-manrope antialiased">
      <PageHeader title={title} subtitle={subtitle} minimal={minimal} />
      <div className="w-full min-w-0">{children}</div>
    </main>
  );
}
