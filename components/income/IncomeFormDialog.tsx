"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { logFreelanceIncome, updateFreelanceIncome } from "@/actions/income";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
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

export default function IncomeFormDialog({
  open,
  onClose,
  month,
  year,
  currency,
  entry,
}: Props) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<FormData>();

  useEffect(() => {
    if (entry) {
      setValue("sourceName", entry.sourceName);
      setValue("amount", entry.amount);
    } else {
      reset();
    }
  }, [entry, open]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const result = entry
      ? await updateFreelanceIncome(entry.id, data)
      : await logFreelanceIncome({
          sourceName: data.sourceName,
          amount: Number(data.amount),
          month,
          year,
        });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(entry ? "Income updated!" : "Income logged!");
      onClose();
      reset();
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            {entry ? "Edit Income" : "Log Income"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300">Source Name</Label>
            <Input
              placeholder="e.g. Client Project, Consultation"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/50"
              {...register("sourceName", { required: "Source name is required" })}
            />
            {errors.sourceName && (
              <p className="text-xs text-red-400">{errors.sourceName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300">Amount ({currency})</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/50"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Must be greater than 0" },
                validate: (v) =>
                  /^\d+(\.\d{1,2})?$/.test(String(v)) ||
                  "Max 2 decimal places allowed",
              })}
            />
            {errors.amount && (
              <p className="text-xs text-red-400">{errors.amount.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-white hover:bg-white/90 text-black"
            >
              {loading ? "Saving..." : entry ? "Update" : "Log Income"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}