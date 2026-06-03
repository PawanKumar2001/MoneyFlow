"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { addSubscription, updateSubscription } from "@/actions/subscriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Repeat2, X } from "lucide-react";
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

export default function SubscriptionFormDialog({
  open,
  onClose,
  subscription,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const years = Array.from({ length: 5 }, (_, index) => currentYear - 2 + index);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      amount: undefined,
      recurringDate: 1,
      startMonth: now.getMonth() + 1,
      startYear: currentYear,
    },
  });

  useEffect(() => {
    setError(null);

    if (subscription) {
      setValue("name", subscription.name);
      setValue("amount", subscription.amount);
      setValue("recurringDate", subscription.recurringDate);
      setValue("startMonth", subscription.startMonth);
      setValue("startYear", subscription.startYear);
      return;
    }

    reset({
      name: "",
      amount: undefined,
      recurringDate: 1,
      startMonth: now.getMonth() + 1,
      startYear: currentYear,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription, open, reset, setValue]);

  const handleClose = () => {
    if (loading) return;
    setError(null);
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...data,
        amount: Number(data.amount),
        recurringDate: Number(data.recurringDate),
        startMonth: Number(data.startMonth),
        startYear: Number(data.startYear),
      };

      const result = subscription
        ? await updateSubscription(subscription.id, payload)
        : await addSubscription(payload);

      if (result?.error) {
        setError(result.error);
        return;
      }

      toast.success(subscription ? "Subscription updated!" : "Subscription added!");
      reset();
      onClose();
    } catch (err) {
      console.error("Failed to save subscription:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close subscription form"
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full rounded-t-3xl border border-white/10 bg-[#080808]/95 p-5 shadow-2xl shadow-black/60 sm:max-w-md sm:rounded-2xl sm:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-3xl bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)] sm:rounded-2xl" />

        <div className="relative mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
              <Repeat2 className="h-5 w-5" strokeWidth={2.2} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">
                {subscription ? "Edit subscription" : "Add subscription"}
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Track recurring payments automatically each month.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Subscription name</Label>
            <Input
              placeholder="e.g. Netflix, Spotify"
              className="h-10 border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/35"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-xs text-red-300">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Monthly amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="h-10 border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/35"
                {...register("amount", {
                  valueAsNumber: true,
                  required: "Amount is required",
                  min: { value: 0.01, message: "Amount must be greater than 0" },
                  validate: (value) =>
                    /^\d+(\.\d{1,2})?$/.test(String(value)) ||
                    "Max 2 decimal places allowed",
                })}
              />
              {errors.amount && (
                <p className="text-xs text-red-300">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Recurring date</Label>
              <Input
                type="number"
                placeholder="1–28"
                className="h-10 border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/35"
                {...register("recurringDate", {
                  valueAsNumber: true,
                  required: "Recurring date is required",
                  min: { value: 1, message: "Must be between 1 and 28" },
                  max: { value: 28, message: "Must be between 1 and 28" },
                })}
              />
              {errors.recurringDate && (
                <p className="text-xs text-red-300">
                  {errors.recurringDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Starting from</Label>
            <div className="grid grid-cols-[1fr_112px] gap-2">
              <select
                className="h-10 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition-colors focus:border-white/35"
                {...register("startMonth", { valueAsNumber: true, required: true })}
              >
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value} className="bg-black">
                    {month.label}
                  </option>
                ))}
              </select>

              <select
                className="h-10 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition-colors focus:border-white/35"
                {...register("startYear", { valueAsNumber: true, required: true })}
              >
                {years.map((year) => (
                  <option key={year} value={year} className="bg-black">
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-slate-400">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
            <p>
              MoneyFlow will create the subscription expense automatically for the
              selected month and future months.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-center text-xs text-red-300">{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full sm:flex-1"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading} className="h-10 w-full sm:flex-1">
              {loading ? "Saving..." : subscription ? "Update" : "Add Subscription"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
