"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { addSubscription, updateSubscription } from "@/actions/subscriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { toast } from "sonner";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

type FormData = {
  name: string;
  amount: number;
  recurringDate: number;
  startMonth: number;
  startYear: number;
};

type Subscription = {
  id: string;
  name: string;
  amount: number;
  recurringDate: number;
  startMonth: number;
  startYear: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  subscription?: Subscription | null;
};

export default function SubscriptionFormDialog({ open, onClose, subscription }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<FormData>({
      defaultValues: {
        startMonth: now.getMonth() + 1,
        startYear: now.getFullYear(),
      },
    });

  useEffect(() => {
    if (subscription) {
      setValue("name", subscription.name);
      setValue("amount", subscription.amount);
      setValue("recurringDate", subscription.recurringDate);
      setValue("startMonth", subscription.startMonth);
      setValue("startYear", subscription.startYear);
    } else {
      reset({
        startMonth: now.getMonth() + 1,
        startYear: now.getFullYear(),
      });
    }
  }, [subscription, open]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    const result = subscription
      ? await updateSubscription(subscription.id, data)
      : await addSubscription(data);
    if (result?.error) {
      setError(result.error);
    } else {
      toast.success(subscription ? "Subscription updated!" : "Subscription added!");
      onClose();
      reset();
    }
    setLoading(false);
  };

  if (!open) return null;

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            {subscription ? "Edit Subscription" : "Add Subscription"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Subscription Name</Label>
            <Input
              placeholder="e.g. Netflix, Spotify"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Monthly Amount</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500"
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

          {/* Recurring Date */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Recurring Date (1–28)</Label>
            <Input
              type="number"
              placeholder="e.g. 1, 15, 28"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500"
              {...register("recurringDate", {
                required: "Recurring date is required",
                min: { value: 1, message: "Must be between 1 and 28" },
                max: { value: 28, message: "Must be between 1 and 28" },
              })}
            />
            {errors.recurringDate && (
              <p className="text-xs text-red-400">{errors.recurringDate.message}</p>
            )}
          </div>

          {/* Start Month + Year */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Starting From</Label>
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                {...register("startMonth", { required: true })}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value} className="bg-slate-900">
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                className="w-28 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                {...register("startYear", { required: true })}
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-slate-900">{y}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

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
              {loading ? "Saving..." : subscription ? "Update" : "Add Subscription"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}