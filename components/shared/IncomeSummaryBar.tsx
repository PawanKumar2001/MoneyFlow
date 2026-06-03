"use client";

import { motion } from "framer-motion";
import { getCurrencySymbol, formatAmount } from "@/lib/currency";

type Props = {
  totalIncome: number;
  totalExpenses: number;
  currency: string;
  incomeType: string;
  onEditIncome?: () => void;
  loading?: boolean;
  collapsed?: boolean;
};

type Accent = "income" | "expense" | "remaining" | "savings" | "neutral";

const accentStyles: Record<
  Accent,
  {
    text: string;
    glow: string;
    progress?: string;
  }
> = {
  income: {
    text: "text-emerald-300",
    glow: "bg-emerald-400/10",
    progress: "from-emerald-300 via-lime-200 to-white",
  },
  expense: {
    text: "text-rose-300",
    glow: "bg-rose-400/10",
  },
  remaining: {
    text: "text-sky-300",
    glow: "bg-sky-400/10",
  },
  savings: {
    text: "text-amber-200",
    glow: "bg-amber-300/10",
  },
  neutral: {
    text: "text-slate-400",
    glow: "bg-white/10",
  },
};

export default function IncomeSummaryBar({
  totalIncome,
  totalExpenses,
  currency,
  incomeType,
  onEditIncome,
  loading = false,
  collapsed = false,
}: Props) {
  const symbol = getCurrencySymbol(currency);
  const remaining = totalIncome - totalExpenses;
  const spentPercent =
    totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0;
  const savingsPercent =
    totalIncome > 0
      ? Math.max(((totalIncome - totalExpenses) / totalIncome) * 100, 0)
      : 0;

  const isFreelancer = incomeType === "FREELANCER";
  const title = isFreelancer
    ? "Monthly earnings overview"
    : "Monthly income overview";

  if (loading) return <IncomeSummaryBarSkeleton />;

  return (
    <section
      className={`sticky top-[68px] z-40 w-full px-4 transition-all duration-300 md:px-6 lg:px-8 ${
        collapsed ? "py-2 md:py-4" : "py-2.5 md:py-5"
      }`}
    >
      <motion.div
        layout
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.65rem] border border-white/10 bg-[#050505]/95 shadow-[0_28px_90px_rgba(0,0,0,0.45)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-emerald-400/[0.055] blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-28 h-56 w-56 rounded-full bg-amber-300/[0.045] blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.075),transparent_30%)]" />

        {collapsed ? (
          <div className="relative p-3 md:hidden">
            <div className="flex items-center justify-between gap-3">
              <CompactAmount
                label={isFreelancer ? "Earned" : "Income"}
                value={`${symbol}${formatAmount(totalIncome)}`}
                accent="income"
              />

              <CompactAmount
                label="Remaining"
                value={`${symbol}${formatAmount(remaining)}`}
                align="right"
                accent={remaining < 0 ? "expense" : "remaining"}
                danger={remaining < 0}
              />

              {!isFreelancer && <EditButton compact onClick={onEditIncome} />}
            </div>

            <ProgressBar spentPercent={spentPercent} className="mt-2 h-1.5" />
          </div>
        ) : (
          <div className="relative p-3.5 md:hidden">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
                  MoneyFlow
                </p>
                <h2 className="truncate text-[15px] font-semibold text-white">
                  {title}
                </h2>
              </div>

              {!isFreelancer && <EditButton compact onClick={onEditIncome} />}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <MobileStat
                label={isFreelancer ? "Earned" : "Income"}
                value={`${symbol}${formatAmount(totalIncome)}`}
                accent="income"
              />
              <MobileStat
                label="Expenses"
                value={`${symbol}${formatAmount(totalExpenses)}`}
                accent="expense"
              />
              <MobileStat
                label="Remaining"
                value={`${symbol}${formatAmount(remaining)}`}
                accent={remaining < 0 ? "expense" : "remaining"}
                danger={remaining < 0}
              />
              <MobileStat
                label="Savings"
                value={`${savingsPercent.toFixed(1)}%`}
                accent="savings"
              />
            </div>

            <div className="mt-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Spent this month</span>
                <span className="font-medium text-slate-300">
                  {spentPercent.toFixed(0)}%
                </span>
              </div>
              <ProgressBar spentPercent={spentPercent} className="h-1.5" />
            </div>
          </div>
        )}

        <div className="relative hidden md:block">
          <div className="grid grid-cols-[1.05fr_2fr] items-stretch lg:grid-cols-[0.95fr_2.15fr]">
            <div className="flex flex-col justify-between border-r border-white/10 p-6 lg:p-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/80">
                  MoneyFlow
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white lg:text-[1.7rem]">
                  {title}
                </h2>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                  {isFreelancer
                    ? "Track what you earned, spent, and saved this month."
                    : "Compare your monthly income against your spending."}
                </p>
              </div>

              {!isFreelancer && (
                <div className="mt-6">
                  <EditButton onClick={onEditIncome} />
                </div>
              )}
            </div>

            <div className="p-5 lg:p-6">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                  label={isFreelancer ? "Earnings" : "Income"}
                  value={`${symbol}${formatAmount(totalIncome)}`}
                  accent="income"
                />
                <StatCard
                  label="Expenses"
                  value={`${symbol}${formatAmount(totalExpenses)}`}
                  accent="expense"
                />
                <StatCard
                  label="Remaining"
                  value={`${symbol}${formatAmount(remaining)}`}
                  accent={remaining < 0 ? "expense" : "remaining"}
                  muted={remaining < 0}
                />
                <StatCard
                  label="Savings"
                  value={`${savingsPercent.toFixed(1)}%`}
                  accent="savings"
                />
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
                <div className="mb-2.5 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-slate-400">Spent this month</span>
                  <span className="font-semibold text-white">
                    {spentPercent.toFixed(0)}%
                  </span>
                </div>

                <ProgressBar spentPercent={spentPercent} className="h-2.5" />

                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  {isFreelancer
                    ? totalIncome === 0
                      ? "No income added this month yet. Log income to keep this overview accurate."
                      : `${symbol}${formatAmount(totalExpenses)} spent from ${symbol}${formatAmount(totalIncome)} earned.`
                    : `${symbol}${formatAmount(totalExpenses)} spent from this month's income.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function EditButton({
  compact = false,
  onClick,
}: {
  compact?: boolean;
  onClick?: () => void;
}) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex h-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-3 text-[11px] font-semibold text-slate-300 transition hover:bg-white hover:text-black"
        aria-label="Edit income"
      >
        Edit
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 shrink-0 items-center rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-slate-300 transition hover:bg-white hover:text-black"
    >
      Edit Income
    </button>
  );
}

function ProgressBar({
  spentPercent,
  className = "h-2",
}: {
  spentPercent: number;
  className?: string;
}) {
  return (
    <div className={`w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
      <motion.div
        initial={false}
        animate={{ width: `${spentPercent}%` }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-lime-200 to-white shadow-[0_0_18px_rgba(190,242,100,0.28)]"
      />
    </div>
  );
}

function CompactAmount({
  label,
  value,
  align = "left",
  accent = "neutral",
  danger = false,
}: {
  label: string;
  value: string;
  align?: "left" | "right";
  accent?: Accent;
  danger?: boolean;
}) {
  const styles = accentStyles[accent];

  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <p className={`text-[10px] font-medium uppercase tracking-[0.16em] ${styles.text}`}>
        {label}
      </p>
      <p
        className={`truncate text-sm font-bold ${
          danger ? "text-rose-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MobileStat({
  label,
  value,
  accent = "neutral",
  danger = false,
}: {
  label: string;
  value: string;
  accent?: Accent;
  danger?: boolean;
}) {
  const styles = accentStyles[accent];

  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-black/30 p-2.5">
      <p className={`text-[11px] font-medium ${styles.text}`}>{label}</p>
      <p
        className={`mt-0.5 truncate text-[15px] font-bold leading-tight ${
          danger ? "text-rose-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = "neutral",
  muted = false,
}: {
  label: string;
  value: string;
  accent?: Accent;
  muted?: boolean;
}) {
  const styles = accentStyles[accent];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-sm shadow-black/20 transition-colors hover:bg-white/[0.055]">
      <div className={`pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full ${styles.glow} blur-2xl`} />
      <div className="relative">
        <p className={`text-xs font-semibold ${styles.text}`}>{label}</p>
        <p
          className={`mt-2 truncate text-xl font-bold tracking-tight lg:text-2xl ${
            muted ? "text-slate-300" : "text-white"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function IncomeSummaryBarSkeleton() {
  return (
    <section className="sticky top-[68px] z-40 w-full px-4 py-2.5 md:px-6 md:py-5 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.65rem] border border-white/10 bg-[#050505]/95 p-3 shadow-[0_28px_90px_rgba(0,0,0,0.45)] md:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <div className="animate-pulse md:hidden">
          <div className="mb-3 space-y-2">
            <div className="h-2.5 w-20 rounded-full bg-white/10" />
            <div className="h-4 w-44 rounded-full bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="rounded-xl border border-white/10 bg-black/30 p-2.5">
                <div className="h-2.5 w-16 rounded-full bg-white/10" />
                <div className="mt-2 h-4 w-24 rounded-full bg-white/10" />
              </div>
            ))}
          </div>

          <div className="mt-3 h-1.5 w-full rounded-full bg-white/10" />
        </div>

        <div className="hidden animate-pulse gap-5 md:grid md:grid-cols-[1.05fr_2fr] lg:grid-cols-[0.95fr_2.15fr]">
          <div className="space-y-4 border-r border-white/10 pr-6">
            <div className="h-3 w-24 rounded-full bg-white/10" />
            <div className="h-7 w-64 max-w-full rounded-full bg-white/10" />
            <div className="h-4 w-72 max-w-full rounded-full bg-white/10" />
            <div className="h-10 w-32 rounded-xl bg-white/10" />
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                >
                  <div className="h-3 w-16 rounded-full bg-white/10" />
                  <div className="mt-3 h-6 w-24 rounded-full bg-white/10" />
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
              <div className="mb-3 flex justify-between">
                <div className="h-3 w-24 rounded-full bg-white/10" />
                <div className="h-3 w-8 rounded-full bg-white/10" />
              </div>
              <div className="h-2.5 w-full rounded-full bg-white/10" />
              <div className="mt-3 h-3 w-3/4 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
