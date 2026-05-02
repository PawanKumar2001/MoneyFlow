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
    <div className="flex items-center gap-2">
      <button
        onClick={goToPrevMonth}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <motion.span
        key={`${month}-${year}`}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-medium text-white min-w-[120px] text-center"
      >
        {MONTHS[month - 1]} {year}
      </motion.span>

      <button
        onClick={goToNextMonth}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}