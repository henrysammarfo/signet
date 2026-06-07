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
      <div className="max-w-[960px] mx-auto px-5 md:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="text-sm font-medium tracking-wide text-white/90 hover:text-white">
            SIGNET
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                    active ? "text-white bg-white/10" : "text-white/45 hover:text-white/80"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <WalletButton />
            <button
              type="button"
              className="md:hidden text-xs text-white/50 px-2 py-1"
              onClick={() => setOpen((v) => !v)}
            >
              Menu
            </button>
          </div>
        </div>

        {open && (
          <nav className="md:hidden flex flex-col pt-3 pb-1">
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
          <div className="mt-8 pb-6">
            <h1 className="text-[28px] md:text-[32px] font-medium tracking-tight text-white">{title}</h1>
            {subtitle && <p className="text-[14px] text-white/40 mt-2 max-w-lg leading-relaxed">{subtitle}</p>}
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
    <main className="min-h-screen bg-black text-white font-manrope antialiased">
      <PageHeader title={title} subtitle={subtitle} minimal={minimal} />
      <div>{children}</div>
    </main>
  );
}
