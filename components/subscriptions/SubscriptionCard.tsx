"use client";

import { motion } from "framer-motion";
import { CalendarDays, PencilLine, Repeat2, Trash2 } from "lucide-react";
import { getCurrencySymbol, formatAmount } from "@/lib/currency";

type Subscription = {
  id: string;
  name: string;
  amount: number;
  recurringDate: number;
  startMonth: number;
  startYear: number;
};

type Props = {
  subscription: Subscription;
  currency: string;
  onEdit: (subscription: Subscription) => void;
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

export default function SubscriptionCard({
  subscription,
  currency,
  onEdit,
  onDelete,
  index,
}: Props) {
  const symbol = getCurrencySymbol(currency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="group rounded-2xl border border-white/10 bg-[#0c0c0c] p-3 transition-all duration-200 hover:border-white/15 hover:bg-[#111111] sm:p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
            <Repeat2 className="h-4.5 w-4.5" strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-white">
                {subscription.name}
              </p>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Monthly
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Every {subscription.recurringDate}
                {getOrdinal(subscription.recurringDate)}
              </span>
              <span className="hidden text-slate-700 sm:inline">•</span>
              <span>
                Since {MONTHS[subscription.startMonth - 1]} {subscription.startYear}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3 sm:border-t-0 sm:pt-0">
          <div className="sm:text-right">
            <p className="text-sm font-bold text-white">
              {symbol}
              {formatAmount(subscription.amount)}
            </p>
            <p className="text-[11px] text-slate-500">per month</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(subscription)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-white"
              aria-label={`Edit ${subscription.name}`}
            >
              <PencilLine className="h-3.5 w-3.5" strokeWidth={2.2} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(subscription.id)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300"
              aria-label={`Delete ${subscription.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
