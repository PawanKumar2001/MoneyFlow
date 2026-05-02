"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2, RefreshCw } from "lucide-react";
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
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/20">
          <RefreshCw className="h-4 w-4 text-indigo-400" />
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-medium text-white">{subscription.name}</p>
          <p className="text-xs text-slate-500">
            Every month on the{" "}
            <span className="text-indigo-400 font-medium">
              {subscription.recurringDate}
              {getOrdinal(subscription.recurringDate)}
            </span>
            {" · "}Since{" "}
            {MONTHS[subscription.startMonth - 1]} {subscription.startYear}
          </p>
        </div>
      </div>

      {/* Amount + Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="text-sm font-bold text-emerald-400">
            {symbol}{formatAmount(subscription.amount)}
          </p>
          <p className="text-xs text-slate-500">/ month</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(subscription)}
            className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(subscription.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
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