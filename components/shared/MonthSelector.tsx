"use client";

import { useMonthStore } from "@/store/monthStore";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

export default function MonthSelector() {
  const { month, year, goToPrevMonth, goToNextMonth } = useMonthStore();

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={goToPrevMonth}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white shrink-0"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <motion.span
        key={`${month}-${year}`}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs sm:text-sm font-medium text-white w-[88px] sm:w-[120px] text-center"
      >
        {MONTHS[month - 1].slice(0, 3)} {year}
      </motion.span>

      <button
        onClick={goToNextMonth}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white shrink-0"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}