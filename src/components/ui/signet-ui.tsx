import { Link } from "@tanstack/react-router";

/** Deep black consumer palette */
export const signet = {
  black: "#000000",
  surface: "#0a0a0a",
  border: "rgba(255,255,255,0.08)",
  muted: "rgba(255,255,255,0.45)",
  green: "#00DC82",
  gold: "#C9A962",
} as const;

export function PageSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`max-w-[960px] mx-auto w-full min-w-0 px-4 sm:px-5 md:px-6 pb-16 md:pb-24 ${className}`}>{children}</section>
  );
}

export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-[15px] font-medium text-white/90">{title}</h2>
      {subtitle && <p className="text-[13px] text-white/40 mt-1">{subtitle}</p>}
    </div>
  );
}

export function PageCard({
  children,
  className = "",
  accent = "default",
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: "default" | "green" | "purple" | "gold";
  hover?: boolean;
}) {
  const accents = {
    default: "border-white/[0.08] bg-[#0a0a0a]",
    green: "border-[#00DC82]/20 bg-[#00DC82]/[0.03]",
    purple: "border-white/[0.08] bg-[#0a0a0a]",
    gold: "border-[#C9A962]/20 bg-[#C9A962]/[0.03]",
  };

  return (
    <div
      className={`rounded-xl border ${accents[accent]} ${
        hover ? "transition-colors hover:border-white/15 hover:bg-[#111]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  badge,
  right,
}: {
  title: string;
  badge?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 border-b border-white/[0.06]">
      <div>
        <h3 className="text-sm font-medium text-white/90">{title}</h3>
        {badge}
      </div>
      {right}
    </div>
  );
}

export function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "default" | "green" | "gold";
}) {
  return (
    <PageCard className="p-4 md:p-5">
      <div className="text-[11px] text-white/40 mb-1">{label}</div>
      <div className="text-2xl font-medium text-white tracking-tight">{value}</div>
      {hint && <div className="text-[11px] text-white/30 mt-1">{hint}</div>}
    </PageCard>
  );
}

export function Badge({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "green" | "muted" | "gold";
}) {
  const tones = {
    green: "text-[#00DC82] bg-[#00DC82]/10",
    gold: "text-[#C9A962] bg-[#C9A962]/10",
    muted: "text-white/50 bg-white/5",
  };
  return (
    <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-md ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg bg-white text-black text-sm font-medium px-5 py-2.5 hover:bg-white/90 disabled:opacity-40 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border border-white/10 text-white/80 text-sm font-medium px-5 py-2.5 hover:bg-white/5 disabled:opacity-40 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function FilterPanel({ children }: { children: React.ReactNode }) {
  return (
    <PageCard className="p-5 mb-6">
      <div className="text-[11px] text-white/40 mb-4">Filters</div>
      <div className="flex flex-wrap gap-6 items-end">{children}</div>
    </PageCard>
  );
}

export function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 min-w-[140px]">
      <span className="text-[11px] text-white/40">{label}</span>
      {children}
    </div>
  );
}

export function DataTable({
  columns,
  rows,
  empty,
}: {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows: Record<string, React.ReactNode>[];
  empty?: string;
}) {
  return (
    <PageCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          <div
            className="grid px-5 py-3 text-[11px] text-white/35 border-b border-white/[0.06] gap-4"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {columns.map((col) => (
              <span key={col.key} className={col.align === "right" ? "text-right" : ""}>
                {col.label}
              </span>
            ))}
          </div>
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid px-5 py-4 border-b border-white/[0.04] last:border-0 items-center gap-4 text-sm text-white/80"
              style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
            >
              {columns.map((col) => (
                <div key={col.key} className={col.align === "right" ? "text-right" : ""}>
                  {row[col.key]}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {!rows.length && empty && (
        <div className="px-5 py-10 text-center text-white/35 text-sm">{empty}</div>
      )}
    </PageCard>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <PageCard className="p-10 text-center">
      <p className="text-sm text-white/70">{title}</p>
      {body && <p className="text-[13px] text-white/35 mt-2">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </PageCard>
  );
}

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex text-sm text-white/50 hover:text-white transition-colors"
    >
      {label}
    </Link>
  );
}

export const inputClass =
  "w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/25 focus:border-white/25 outline-none transition-colors";

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] text-white/40">{label}</span>
      {children}
    </label>
  );
}

export function FeedList({
  items,
  empty,
}: {
  items: { id: string; message: string; time: string }[];
  empty: string;
}) {
  return (
    <PageCard>
      {items.map((item) => (
        <div
          key={item.id}
          className="px-5 py-3.5 flex justify-between gap-4 border-b border-white/[0.04] last:border-0 text-[13px]"
        >
          <span className="text-white/75">{item.message}</span>
          <span className="text-white/25 text-[11px] shrink-0 tabular-nums">{item.time}</span>
        </div>
      ))}
      {!items.length && <div className="px-5 py-8 text-white/35 text-sm text-center">{empty}</div>}
    </PageCard>
  );
}

export function StatusDot({ ok, label }: { ok?: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[12px] text-white/50">
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-[#00DC82]" : "bg-amber-500/80"}`} />
      {label}
    </span>
  );
}
