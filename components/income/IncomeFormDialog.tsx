"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { logFreelanceIncome, updateFreelanceIncome } from "@/actions/income";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrencySymbol } from "@/lib/currency";
import { TrendingUp, X } from "lucide-react";
import { toast } from "sonner";

type FormData = {
  sourceName: string;
  amount: number;
};

type IncomeEntry = {
  id: string;
  sourceName: string;
  amount: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  month: number;
  year: number;
  currency: string;
  entry?: IncomeEntry | null;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function IncomeFormDialog({
  open,
  onClose,
  month,
  year,
  currency,
  entry,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const symbol = getCurrencySymbol(currency);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    setError(null);

    if (entry) {
      setValue("sourceName", entry.sourceName);
      setValue("amount", entry.amount);
    } else {
      reset();
    }
  }, [entry, open, reset, setValue]);

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        sourceName: data.sourceName.trim(),
        amount: Number(data.amount),
      };

      const result = entry
        ? await updateFreelanceIncome(entry.id, payload)
        : await logFreelanceIncome({
            ...payload,
            month,
            year,
          });

      if (result?.error) {
        setError(result.error);
        return;
      }

      toast.success(entry ? "Income updated!" : "Income logged!");
      onClose();
      reset();
    } catch (err) {
      console.error("Failed to save income:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full rounded-t-3xl border border-white/10 bg-[#080808]/95 p-5 shadow-2xl shadow-black/50 sm:max-w-md sm:rounded-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
              <TrendingUp className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white sm:text-lg">
                {entry ? "Edit Income" : "Log Income"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {MONTHS[month - 1]} {year} · {currency}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close income form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Source Name</Label>
            <Input
              placeholder="e.g. Client Project, Consultation"
              className="h-10 border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
              {...register("sourceName", {
                required: "Source name is required",
                validate: (value) =>
                  value.trim().length > 0 || "Source name is required",
              })}
            />
            {errors.sourceName && (
              <p className="text-xs text-red-400">{errors.sourceName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Amount ({symbol})</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="h-10 border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
              {...register("amount", {
                valueAsNumber: true,
                required: "Amount is required",
                min: { value: 0.01, message: "Must be greater than 0" },
                validate: (value) =>
                  /^\d+(\.\d{1,2})?$/.test(String(value)) ||
                  "Max 2 decimal places allowed",
              })}
            />
            {errors.amount && (
              <p className="text-xs text-red-400">{errors.amount.message}</p>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs leading-relaxed text-slate-400">
              This entry will be counted as income for {MONTHS[month - 1]} {year} and reflected in your monthly summary.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-center text-xs text-red-300">{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full sm:flex-1"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full sm:flex-1"
            >
              {loading ? "Saving..." : entry ? "Update Income" : "Log Income"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
