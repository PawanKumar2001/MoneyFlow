"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2, TrendingUp } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currency";

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

export default function IncomeCard({
  entry,
  currency,
  onEdit,
  onDelete,
  index,
}: Props) {
  const symbol = getCurrencySymbol(currency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/20 border border-emerald-500/20">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        </div>

        {/* Info */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {entry.sourceName}
          </p>
        </div>
      </div>

      {/* Amount + Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-bold text-emerald-400">
          {symbol}{entry.amount.toLocaleString()}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}