"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { getUserIncome, updateIncome } from "@/actions/income";
import { getCurrencySymbol } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { toast } from "sonner";

type IncomeEntry = {
  id?: string;
  sourceName: string;
  amount: number;
};

type FormData = {
  primaryIncome: IncomeEntry;
  secondaryIncomes: IncomeEntry[];
};

type Props = {
  open: boolean;
  onClose: (changed?: boolean) => void;
  currency: string;
};

export default function EditIncomeModal({ open, onClose, currency }: Props) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const symbol = getCurrencySymbol(currency);

  const { register, handleSubmit, reset, control, watch } = useForm<FormData>({
    defaultValues: {
      primaryIncome: { sourceName: "", amount: 0 },
      secondaryIncomes: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "secondaryIncomes",
  });

  const watchedData = watch();
  const totalIncome =
    (Number(watchedData.primaryIncome?.amount) || 0) +
    watchedData.secondaryIncomes.reduce(
      (sum, inc) => sum + (Number(inc.amount) || 0),
      0
    );

  useEffect(() => {
    if (!open) return;
    const fetch = async () => {
      setFetching(true);
      const data = await getUserIncome();
      const primary = data.incomes.find((i) => i.type === "PRIMARY");
      const secondary = data.incomes.filter((i) => i.type === "SECONDARY");
      reset({
        primaryIncome: {
          id: primary?.id,
          sourceName: primary?.sourceName ?? "",
          amount: primary?.amount ?? 0,
        },
        secondaryIncomes: secondary.map((i) => ({
          id: i.id,
          sourceName: i.sourceName,
          amount: i.amount,
        })),
      });
      setFetching(false);
    };
    fetch();
  }, [open]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    const result = await updateIncome(data);
    if (result?.error) {
      setError(result.error);
    } else {
      toast.success("Income updated!");
      onClose(true);
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onClose(false)} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Edit Income</h2>
          <button
            onClick={() => onClose(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {fetching ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Primary Income */}
            <div className="space-y-3">
              <Label className="text-slate-300 text-sm font-medium">
                Primary Income
              </Label>
              <Input
                placeholder="Source name e.g. Salary"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500"
                {...register("primaryIncome.sourceName", { required: true })}
              />
              <Input
                type="number"
                placeholder="Amount"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500"
                {...register("primaryIncome.amount", { required: true, min: 1 })}
              />
            </div>

            {/* Secondary Incomes */}
            <div className="space-y-3">
              <Label className="text-slate-300 text-sm font-medium">
                Secondary Income
              </Label>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Source name"
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500"
                        {...register(`secondaryIncomes.${index}.sourceName`)}
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500"
                        {...register(`secondaryIncomes.${index}.amount`)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {fields.length < 5 && (
                <button
                  type="button"
                  onClick={() => append({ sourceName: "", amount: 0 })}
                  className="w-full py-2 rounded-lg border border-dashed border-white/20 text-slate-400 hover:text-white hover:border-white/40 text-sm transition-colors"
                >
                  + Add Income Source
                </button>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
              <span className="text-white text-sm font-medium">Total Monthly Income</span>
              <span className="text-indigo-300 font-bold">
                {symbol}{totalIncome.toLocaleString()}
              </span>
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
                onClick={() => onClose(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {loading ? "Saving..." : "Save Income"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}