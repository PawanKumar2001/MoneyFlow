"use client";

import { motion } from "framer-motion";
import { PencilLine, Trash2, TrendingUp } from "lucide-react";
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
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function IncomeCard({
  entry,
  currency,
  onEdit,
  onDelete,
  index,
}: Props) {
  const symbol = getCurrencySymbol(currency);
  const period = entry.month && entry.year
    ? `${MONTHS[entry.month - 1]} ${entry.year}`
    : "This month";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="group rounded-xl border border-white/10 bg-[#101010]/95 p-3 transition-all duration-200 hover:border-white/15 hover:bg-[#141414] sm:p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
            <TrendingUp className="h-4 w-4" strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {entry.sourceName}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Logged for {period}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="text-left sm:text-right">
            <p className="text-sm font-semibold text-white">
              {symbol}{formatAmount(entry.amount)}
            </p>
            <p className="text-xs text-slate-500">income</p>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Edit income"
            >
              <PencilLine className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
              aria-label="Delete income"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
