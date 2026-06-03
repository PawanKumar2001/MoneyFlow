"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { addExpense, updateExpense } from "@/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, ReceiptText, X } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Grocery",
  "Food & Dining",
  "Transportation",
  "Utilities & Bills",
  "Healthcare",
  "Rent/Housing",
  "Entertainment",
  "Shopping",
  "Education",
  "Travel",
  "Others",
];

type ExpenseFormData = {
  name: string;
  category: string;
  amount: number;
  date: string;
};

type Expense = {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: Date;
};

type Props = {
  open: boolean;
  onClose: (changed?: boolean) => void;
  expense?: Expense | null;
};

export default function ExpenseFormDialog({ open, onClose, expense }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(expense?.category ?? "");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>();

  useEffect(() => {
    if (!open) return;

    setError(null);

    if (expense) {
      setValue("name", expense.name);
      setValue("amount", expense.amount);
      setValue("date", new Date(expense.date).toISOString().split("T")[0]);
      setCategory(expense.category);
      return;
    }

    reset();
    setValue("date", new Date().toISOString().split("T")[0]);
    setCategory("");
  }, [expense, open, reset, setValue]);

  const onSubmit = async (data: ExpenseFormData) => {
    if (!category) {
      setError("Please select a category.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = { ...data, category };
      const result = expense
        ? await updateExpense(expense.id, payload)
        : await addExpense(payload);

      if (result?.error) {
        setError(result.error);
        return;
      }

      toast.success(expense ? "Expense updated!" : "Expense added!");
      onClose(true);
      reset();
      setCategory("");
    } catch (err) {
      console.error("Failed to save expense:", err);
      setError("Something went wrong while saving this expense.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={() => onClose(false)}
      />

      <div className="relative z-10 w-full rounded-t-3xl border border-white/10 bg-[#080808]/98 shadow-2xl shadow-black/50 sm:max-w-md sm:rounded-2xl">
        <div className="pointer-events-none absolute inset-0 rounded-t-3xl bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_36%)] sm:rounded-2xl" />

        <div className="relative max-h-[92dvh] overflow-y-auto p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
                <ReceiptText className="h-5 w-5" strokeWidth={2.2} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-white sm:text-lg">
                  {expense ? "Edit Expense" : "Add Expense"}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {expense
                    ? "Update the details for this expense."
                    : "Record a new spending entry for this month."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close expense form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Expense Name</Label>
              <Input
                placeholder="e.g. Groceries, Netflix"
                className="h-10 border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-red-300">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Category</Label>
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  if (event.target.value) setError(null);
                }}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition-colors focus:border-white/40"
              >
                <option value="" className="bg-black">
                  Select Category
                </option>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item} className="bg-black">
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  className="h-10 border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                  {...register("amount", {
                    valueAsNumber: true,
                    required: "Amount is required",
                    min: {
                      value: 0.01,
                      message: "Amount must be greater than 0",
                    },
                    validate: (value) =>
                      /^\d+(\.\d{1,2})?$/.test(String(value)) ||
                      "Max 2 decimal places allowed",
                  })}
                />
                {errors.amount && (
                  <p className="text-xs text-red-300">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Date</Label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    type="date"
                    className="h-10 border-white/10 bg-white/[0.04] pl-9 text-sm text-white focus-visible:ring-0 focus:border-white/40"
                    {...register("date", { required: "Date is required" })}
                  />
                </div>
                {errors.date && (
                  <p className="text-xs text-red-300">{errors.date.message}</p>
                )}
              </div>
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
                {loading ? "Saving..." : expense ? "Update" : "Add Expense"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
