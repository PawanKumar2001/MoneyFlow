"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  CircleDollarSign,
  PencilLine,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { getCurrencySymbol, formatAmount } from "@/lib/currency";

type IncomeEntry = {
  id: string;
  sourceName: string;
  amount: number;
  month: number | null;
  year: number | null;
};

type Props = {
  entry: IncomeEntry;
  currency: string;
  onEdit: (entry: IncomeEntry) => void;
  onDelete: (id: string) => void;
  index: number;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function IncomeCard({
  entry,
  currency,
  onEdit,
  onDelete,
  index,
}: Props) {
  const symbol = getCurrencySymbol(currency);
  const period =
    entry.month && entry.year
      ? `${MONTHS[entry.month - 1]} ${entry.year}`
      : "This month";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.035 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#101010]/95 p-4 transition-all duration-200 hover:border-emerald-400/20 hover:bg-[#141414] sm:p-5"
    >
      <div className="pointer-events-none absolute -left-16 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-emerald-500/[0.055] blur-2xl transition-opacity group-hover:opacity-100" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-500/5">
            <TrendingUp className="h-5 w-5" strokeWidth={2.3} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="min-w-0 truncate text-base font-semibold text-white">
                {entry.sourceName}
              </p>

              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                <CircleDollarSign className="h-3.5 w-3.5" strokeWidth={2.3} />
                Income
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-slate-400">
                <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                Logged for {period}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-white/10 sm:border-l sm:pl-5">
          <div className="text-left sm:min-w-[120px] sm:text-right">
            <p className="text-lg font-bold tracking-tight text-white sm:text-xl">
              {symbol}
              {formatAmount(entry.amount)}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              earned
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/35 p-1">
            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Edit income"
            >
              <PencilLine className="h-3.5 w-3.5" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
              aria-label="Delete income"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
