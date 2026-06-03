"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { getUserIncome, updateIncome } from "@/actions/income";
import { getCurrencySymbol } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Wallet, X } from "lucide-react";
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

type IncomeRecord = {
  id: string;
  type: string;
  sourceName: string;
  amount: number;
  month?: number | null;
  year?: number | null;
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
      (sum, income) => sum + (Number(income.amount) || 0),
      0
    );

  useEffect(() => {
    if (!open) return;

    let mounted = true;

    const fetchIncome = async () => {
      try {
        setFetching(true);
        setError(null);

        const data = await getUserIncome();
        if (!mounted) return;

        const incomes = Array.isArray(data?.incomes) ? data.incomes : [];
        const primary = incomes.find((income: IncomeRecord) => income.type === "PRIMARY");
        const secondary = incomes.filter((income: IncomeRecord) => income.type === "SECONDARY");

        reset({
          primaryIncome: {
            id: primary?.id,
            sourceName: primary?.sourceName ?? "",
            amount: primary?.amount ?? 0,
          },
          secondaryIncomes: secondary.map((income: IncomeRecord) => ({
            id: income.id,
            sourceName: income.sourceName,
            amount: income.amount,
          })),
        });
      } catch (err) {
        console.error("Failed to load income:", err);
        if (mounted) {
          setError("Could not load income details. Please try again.");
        }
      } finally {
        if (mounted) setFetching(false);
      }
    };

    fetchIncome();

    return () => {
      mounted = false;
    };
  }, [open, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await updateIncome(data);
      if (result?.error) {
        setError(result.error);
        return;
      }

      toast.success("Income updated!");
      onClose(true);
    } catch (err) {
      console.error("Failed to update income:", err);
      setError("Could not update income. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close edit income modal"
        className="fixed inset-0 cursor-default bg-black/80 backdrop-blur-sm"
        onClick={() => onClose(false)}
      />

      <div className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#080808]/98 shadow-2xl shadow-black/70 sm:max-w-lg sm:rounded-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
              <Wallet className="h-5 w-5" strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-semibold text-white">Edit Income</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Update your fixed monthly income sources.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onClose(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close edit income modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {fetching ? (
          <div className="space-y-3 p-5 sm:p-6">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3">
                <div>
                  <Label className="text-xs font-medium text-slate-300">Primary Income</Label>
                  <p className="mt-0.5 text-xs text-slate-500">Your main fixed monthly income.</p>
                </div>

                <Input
                  placeholder="Source name e.g. Salary"
                  className="h-10 border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/30"
                  {...register("primaryIncome.sourceName", { required: true })}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  className="h-10 border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/30"
                  {...register("primaryIncome.amount", {
                    valueAsNumber: true,
                    required: true,
                    min: 1,
                  })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label className="text-xs font-medium text-slate-300">Secondary Income</Label>
                    <p className="mt-0.5 text-xs text-slate-500">Optional additional income sources.</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-500">
                    {fields.length}/5
                  </span>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.025] p-3"
                    >
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Source name"
                            className="h-10 border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/30"
                            {...register(`secondaryIncomes.${index}.sourceName`)}
                          />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            className="h-10 border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/30"
                            {...register(`secondaryIncomes.${index}.amount`, {
                              valueAsNumber: true,
                            })}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                          aria-label="Remove secondary income"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {fields.length < 5 && (
                  <button
                    type="button"
                    onClick={() => append({ sourceName: "", amount: 0 })}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-sm text-slate-400 transition-colors hover:border-white/30 hover:bg-white/[0.04] hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add Income Source
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div>
                  <p className="text-xs text-slate-500">Total Monthly Income</p>
                  <p className="text-sm font-medium text-white">All fixed sources combined</p>
                </div>
                <span className="text-right text-base font-bold text-white">
                  {symbol}{totalIncome.toLocaleString()}
                </span>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-300">
                  {error}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-5 sm:p-6">
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
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full sm:flex-1"
                >
                  {loading ? "Saving..." : "Save Income"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
