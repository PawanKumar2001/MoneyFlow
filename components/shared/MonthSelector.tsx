"use client";

import { useMonthStore } from "@/store/monthStore";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function MonthSelector() {
  const { month, year, goToPrevMonth, goToNextMonth } = useMonthStore();
  const label = `${MONTHS[month - 1].slice(0, 3)} ${year}`;

  return (
    <div className="inline-flex h-9 items-center gap-1 rounded-full border border-white/10 bg-[#080808]/95 p-1 shadow-lg shadow-black/20">
      <button
        type="button"
        onClick={goToPrevMonth}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/15"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
      </button>

      <motion.div
        key={`${month}-${year}`}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex min-w-[92px] items-center justify-center gap-1.5 px-1 text-center sm:min-w-[118px]"
      >
        <CalendarDays className="hidden h-3.5 w-3.5 text-slate-500 sm:block" />
        <span className="text-xs font-semibold text-white sm:text-sm">{label}</span>
      </motion.div>

      <button
        type="button"
        onClick={goToNextMonth}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/15"
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
      </button>
    </div>
  );
}
