"use client";

import { motion } from "framer-motion";
import type { ElementType } from "react";
import {
  BadgeDollarSign,
  PencilLine,
  PiggyBank,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";
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

  if (loading) {
    return <IncomeSummaryBarSkeleton />;
  }

  return (
    <section
      className={`sticky top-[68px] z-40 w-full px-4 transition-all duration-300 md:px-8 lg:px-12 ${
        collapsed ? "py-2 md:py-3" : "py-2.5 md:py-3"
      }`}
    >
      <motion.div
        layout
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/95 shadow-2xl shadow-black/30"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.055),transparent_34%)]" />

        {/* Mobile collapsed state — shown while scrolling/searching */}
        {collapsed ? (
          <div className="relative p-3 md:hidden">
            <div className="flex items-center justify-between gap-3">
              <CompactAmount
                label={isFreelancer ? "Earned" : "Income"}
                value={`${symbol}${formatAmount(totalIncome)}`}
              />

              <CompactAmount
                label="Remaining"
                value={`${symbol}${formatAmount(remaining)}`}
                align="right"
                danger={remaining < 0}
              />

              {!isFreelancer && (
                <button
                  type="button"
                  onClick={onEditIncome}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-300 transition hover:bg-white hover:text-black"
                  aria-label="Edit income"
                >
                  <PencilLine className="h-4 w-4" strokeWidth={2.3} />
                </button>
              )}
            </div>

            <ProgressBar spentPercent={spentPercent} className="mt-2 h-1.5" />
          </div>
        ) : (
          /* Mobile default state — compact by default */
          <div className="relative p-3 md:hidden">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  MoneyFlow
                </p>
                <h2 className="truncate text-sm font-semibold text-white">
                  {title}
                </h2>
              </div>

              {!isFreelancer && (
                <button
                  type="button"
                  onClick={onEditIncome}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-300 transition hover:bg-white hover:text-black"
                  aria-label="Edit income"
                >
                  <PencilLine className="h-4 w-4" strokeWidth={2.3} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <MobileStat
                label={isFreelancer ? "Earned" : "Income"}
                value={`${symbol}${formatAmount(totalIncome)}`}
              />
              <MobileStat
                label="Expenses"
                value={`${symbol}${formatAmount(totalExpenses)}`}
              />
              <MobileStat
                label="Remaining"
                value={`${symbol}${formatAmount(remaining)}`}
                danger={remaining < 0}
              />
              <MobileStat label="Savings" value={`${savingsPercent.toFixed(1)}%`} />
            </div>

            <div className="mt-3 space-y-1.5">
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

        {/* Desktop/tablet full state */}
        <div className="relative hidden p-4 md:block">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Wallet className="h-5 w-5 text-white" strokeWidth={2.2} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    MoneyFlow
                  </p>
                  <h2 className="truncate text-base font-semibold text-white">
                    {title}
                  </h2>
                </div>
              </div>

              {!isFreelancer && (
                <button
                  type="button"
                  onClick={onEditIncome}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white hover:text-black"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-lg border border-white/10 bg-black text-white transition group-hover:border-black/10 group-hover:bg-black group-hover:text-white">
                    <PencilLine className="h-3.5 w-3.5" strokeWidth={2.3} />
                  </span>
                  Edit Income
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <StatCard
                icon={BadgeDollarSign}
                label={isFreelancer ? "Earnings" : "Income"}
                value={`${symbol}${formatAmount(totalIncome)}`}
              />
              <StatCard
                icon={ReceiptText}
                label="Expenses"
                value={`${symbol}${formatAmount(totalExpenses)}`}
              />
              <StatCard
                icon={Wallet}
                label="Remaining"
                value={`${symbol}${formatAmount(remaining)}`}
                muted={remaining < 0}
              />
              <StatCard
                icon={PiggyBank}
                label="Savings"
                value={`${savingsPercent.toFixed(1)}%`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">Spent this month</span>
                <span className="font-medium text-slate-300">
                  {spentPercent.toFixed(0)}%
                </span>
              </div>

              <ProgressBar spentPercent={spentPercent} className="h-2" />

              <div className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <p>
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
        className="h-full rounded-full bg-white"
      />
    </div>
  );
}

function CompactAmount({
  label,
  value,
  align = "left",
  danger = false,
}: {
  label: string;
  value: string;
  align?: "left" | "right";
  danger?: boolean;
}) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p
        className={`truncate text-sm font-bold ${
          danger ? "text-red-400" : "text-white"
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
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p
        className={`truncate text-[15px] font-bold leading-tight ${
          danger ? "text-red-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  muted = false,
}: {
  icon: ElementType;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3 shadow-sm shadow-black/20">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/60">
          <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.2} />
        </div>
        <p className="truncate text-[11px] font-medium text-slate-500">{label}</p>
      </div>
      <p
        className={`truncate text-sm font-bold sm:text-base ${
          muted ? "text-slate-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function IncomeSummaryBarSkeleton() {
  return (
    <section className="sticky top-[68px] z-40 w-full px-4 py-2.5 md:px-8 md:py-3 lg:px-12">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/95 p-3 shadow-2xl shadow-black/30 md:p-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Mobile compact skeleton */}
        <div className="animate-pulse md:hidden">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="h-2.5 w-20 rounded-full bg-white/10" />
              <div className="h-4 w-44 rounded-full bg-white/10" />
            </div>
            <div className="h-8 w-8 rounded-xl bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-1.5">
                <div className="h-2.5 w-16 rounded-full bg-white/10" />
                <div className="h-4 w-24 rounded-full bg-white/10" />
              </div>
            ))}
          </div>

          <div className="mt-3 h-1.5 w-full rounded-full bg-white/10" />
        </div>

        {/* Desktop full skeleton */}
        <div className="hidden animate-pulse flex-col gap-4 md:flex">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/10" />
              <div className="space-y-2">
                <div className="h-3 w-20 rounded-full bg-white/10" />
                <div className="h-4 w-48 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="h-9 w-28 rounded-xl bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-white/[0.025] p-3"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-white/10" />
                  <div className="h-3 w-16 rounded-full bg-white/10" />
                </div>
                <div className="h-5 w-24 rounded-full bg-white/10" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-24 rounded-full bg-white/10" />
              <div className="h-3 w-8 rounded-full bg-white/10" />
            </div>
            <div className="h-2 w-full rounded-full bg-white/10" />
            <div className="h-3 w-3/4 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
