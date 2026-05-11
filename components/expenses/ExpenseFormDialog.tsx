"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { addExpense, updateExpense } from "@/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
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

  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<ExpenseFormData>();

  useEffect(() => {
    if (expense) {
      setValue("name", expense.name);
      setValue("amount", expense.amount);
      setValue("date", new Date(expense.date).toISOString().split("T")[0]);
      setCategory(expense.category);
    } else {
      reset();
      setValue("date", new Date().toISOString().split("T")[0]);
      setCategory("");
    }
  }, [expense, open]);

  const onSubmit = async (data: ExpenseFormData) => {
    if (!category) { setError("Please select a category"); return; }
    setLoading(true);
    setError(null);
    const result = expense
      ? await updateExpense(expense.id, { ...data, category })
      : await addExpense({ ...data, category });
    if (result?.error) {
      setError(result.error);
    } else {
      toast.success(expense ? "Expense updated!" : "Expense added!");
      onClose(true);
      reset();
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onClose(false)} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            {expense ? "Edit Expense" : "Add Expense"}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300">Expense Name</Label>
            <Input
              placeholder="e.g. Groceries, Netflix"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/50"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300">Category</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/80 border border-white/10 text-white text-sm focus:outline-none focus:border-white/50 h-10"
            >
              <option value="" className="bg-black">Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-black">{cat}</option>
              ))}
            </select>
            {!category && error && (
              <p className="text-xs text-red-400">Please select a category</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300">Amount</Label>
            <Input
              type="number"
              placeholder="0.00"
              step="0.01"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/50"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
                validate: (v) =>
                  /^\d+(\.\d{1,2})?$/.test(String(v)) ||
                  "Max 2 decimal places allowed",
              })}
            />
            {errors.amount && (
              <p className="text-xs text-red-400">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300">Date</Label>
            <Input
              type="date"
              className="bg-white/5 border-white/10 text-white focus-visible:ring-0 focus:border-white/50"
              {...register("date", { required: "Date is required" })}
            />
            {errors.date && (
              <p className="text-xs text-red-400">{errors.date.message}</p>
            )}
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
              className="flex-1 bg-white hover:bg-white/90 text-black"
            >
              {loading ? "Saving..." : expense ? "Update" : "Add Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}