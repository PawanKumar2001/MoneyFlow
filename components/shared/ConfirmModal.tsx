"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: (changed?: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  description?: string | React.ReactNode;
};

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  loading,
  title = "Are you sure?",
  description = "This action cannot be undone.",
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => onClose(false)}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl shadow-black/60 backdrop-blur-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              {description}
            </p>
          </div>

          <button
            onClick={() => onClose(false)}
            className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close confirmation modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            onClick={() => onClose(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            className="flex-1 rounded-xl bg-white text-black hover:bg-slate-200 disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
