"use client";

import { motion } from "framer-motion";
import {
  CalendarClock,
  CalendarDays,
  PencilLine,
  Repeat2,
  Trash2,
} from "lucide-react";
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: index * 0.035 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#101010]/95 p-4 transition-all duration-200 hover:border-white/15 hover:bg-[#151515] sm:p-5"
    >
      <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-amber-500/10 blur-3xl transition-opacity duration-300 group-hover:opacity-90" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/25 to-transparent" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300 shadow-lg shadow-amber-500/10">
            <Repeat2 className="h-5 w-5" strokeWidth={2.35} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="min-w-0 truncate text-base font-semibold text-white">
                {subscription.name}
              </p>

              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-300">
                <CalendarClock className="h-3 w-3" strokeWidth={2.3} />
                Monthly
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-slate-400">
                <CalendarDays className="h-3.5 w-3.5 text-amber-300" strokeWidth={2.2} />
                Every {subscription.recurringDate}
                {getOrdinal(subscription.recurringDate)}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-slate-400">
                Since {MONTHS[subscription.startMonth - 1]} {subscription.startYear}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-white/10 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <div className="text-left sm:min-w-[118px] sm:text-right">
            <p className="text-lg font-bold tracking-tight text-white">
              {symbol}
              {formatAmount(subscription.amount)}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
              per month
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/35 p-1">
            <button
              type="button"
              onClick={() => onEdit(subscription)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label={`Edit ${subscription.name}`}
            >
              <PencilLine className="h-3.5 w-3.5" strokeWidth={2.2} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(subscription.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
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
