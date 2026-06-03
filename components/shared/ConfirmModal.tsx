"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: (changed?: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  description?: string | React.ReactNode;
  confirmLabel?: string;
};

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close confirmation modal"
        className="fixed inset-0 cursor-default bg-black/80 backdrop-blur-sm"
        onClick={() => onClose(false)}
      />

      <div className="relative z-10 w-full rounded-t-3xl border border-white/10 bg-[#080808]/98 p-5 shadow-2xl shadow-black/70 sm:max-w-sm sm:rounded-2xl sm:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
              <AlertTriangle className="h-5 w-5" strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-semibold text-white">{title}</h2>
              <div className="mt-1 text-sm leading-relaxed text-slate-400">
                {description}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onClose(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close confirmation modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full sm:flex-1"
            onClick={() => onClose(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            className="h-10 w-full sm:flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
