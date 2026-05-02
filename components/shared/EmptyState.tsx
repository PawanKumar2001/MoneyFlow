"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type Props = {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="text-6xl mb-4"
      >
        {icon}
      </motion.div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-xs mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}