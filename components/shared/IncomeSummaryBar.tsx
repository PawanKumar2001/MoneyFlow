"use client";

import { motion } from "framer-motion";
import { Pencil, PlusCircle } from "lucide-react";
import { getCurrencySymbol, formatAmount } from "@/lib/currency";


type Props = {
  totalIncome: number;
  totalExpenses: number;
  currency: string;
  incomeType: string;
  onEditIncome?: () => void;
};

export default function IncomeSummaryBar({
  totalIncome,
  totalExpenses,
  currency,
  incomeType,
  onEditIncome,
}: Props) {
  const symbol = getCurrencySymbol(currency);
  const remaining = totalIncome - totalExpenses;
  const spentPercent = totalIncome > 0
    ? Math.min((totalExpenses / totalIncome) * 100, 100)
    : 0;
  const savingsPercent = totalIncome > 0
    ? Math.max(((totalIncome - totalExpenses) / totalIncome) * 100, 0)
    : 0;

  const isFreelancer = incomeType === "FREELANCER";

  return (
    <div className="sticky top-[68px] z-40 w-full px-6 md:px-12 lg:px-20 py-3">
      <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-x-6 gap-y-2">
            <Stat
              label={isFreelancer ? "This Month's Earnings" : "Monthly Income"}
              value={`${symbol}${formatAmount(totalIncome)}`}
              color="text-white"
            />
            <Stat
              label="Total Expenses"
              value={`${symbol}${formatAmount(totalExpenses)}`}
              color="text-red-400"
            />
            <Stat
              label="Remaining"
              value={`${symbol}${formatAmount(remaining)}`}
              color={remaining >= 0 ? "text-emerald-400" : "text-red-400"}
            />
            <Stat
              label="Savings"
              value={`${savingsPercent.toFixed(1)}%`}
              color="text-indigo-400"
            />
          </div>

          {/* Action Button — salaried only */}
          {!isFreelancer && (
            <button
              onClick={onEditIncome}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Income
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${spentPercent}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className={`h-full rounded-full ${
              spentPercent > 90
                ? "bg-red-500"
                : spentPercent > 70
                ? "bg-amber-500"
                : "bg-indigo-500"
            }`}
          />
        </div>

        <p className="text-xs text-slate-500 mt-1.5">
          {isFreelancer
            ? totalIncome === 0
              ? "No income added this month yet — tap Add Income to add"
              : `${symbol}${formatAmount(totalExpenses)} spent from ${symbol}${formatAmount(totalIncome)} earned`
            : `${symbol}${totalExpenses.toLocaleString()} spent from ${new Date().toLocaleString("default", { month: "long" })} income`}
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-base font-bold ${color}`}>{value}</p>
    </div>
  );
}