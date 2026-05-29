"use client";

import { motion } from "framer-motion";
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
};

export default function IncomeSummaryBar({
  totalIncome,
  totalExpenses,
  currency,
  incomeType,
  onEditIncome,
  loading = false,
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

  if (loading) {
    return <IncomeSummaryBarSkeleton />;
  }

  return (
    <section className="sticky top-[68px] z-40 w-full px-4 py-3 md:px-12 lg:px-20">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.10),transparent_34%)]" />

        <div className="relative flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Wallet className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  MoneyFlow
                </p>
                <h2 className="truncate text-sm font-semibold text-white sm:text-base">
                  {isFreelancer ? "Monthly earnings overview" : "Monthly income overview"}
                </h2>
              </div>
            </div>

            {!isFreelancer && (
              <button
                type="button"
                onClick={onEditIncome}
                className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-slate-200"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-black text-white transition group-hover:bg-slate-900">
                  <PencilLine className="h-3.5 w-3.5" strokeWidth={2.3} />
                </span>
                <span className="hidden sm:inline">Edit Income</span>
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

            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${spentPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                className="h-full rounded-full bg-white"
              />
            </div>

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
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  muted = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/40">
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
    <section className="sticky top-[68px] z-40 w-full px-4 py-3 md:px-12 lg:px-20">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-4">
        <div className="flex animate-pulse flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/10" />
              <div className="space-y-2">
                <div className="h-3 w-20 rounded-full bg-white/10" />
                <div className="h-4 w-44 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="hidden h-9 w-28 rounded-xl bg-white/10 sm:block" />
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
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
