"use client";

import { useEffect, useState } from "react";
import { getSubscriptions, deleteSubscription } from "@/actions/subscriptions";
import { getUserIncome } from "@/actions/income";
import { getCurrencySymbol } from "@/lib/currency";
import {
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Plus,
  Repeat2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SubscriptionCard from "@/components/subscriptions/SubscriptionCard";
import SubscriptionFormDialog from "@/components/subscriptions/SubscriptionFormDialog";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { toast } from "sonner";

type Subscription = {
  id: string;
  name: string;
  amount: number;
  recurringDate: number;
  startMonth: number;
  startYear: number;
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currency, setCurrency] = useState("INR");

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptions();
      setSubscriptions(Array.isArray(data) ? (data as Subscription[]) : []);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
      toast.error("Could not load subscriptions.");
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const [, incomeResult] = await Promise.allSettled([
        fetchSubscriptions(),
        getUserIncome(),
      ]);

      if (!mounted) return;

      if (incomeResult.status === "fulfilled" && incomeResult.value?.currency) {
        setCurrency(incomeResult.value.currency);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const openCreateForm = () => {
    setEditingSub(null);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const idToDelete = deletingId;
    setDeleteLoading(true);
    setDeletingId(null);
    setSubscriptions((prev) =>
      prev.filter((subscription) => subscription.id !== idToDelete)
    );

    try {
      const result = await deleteSubscription(idToDelete);

      if (result?.error) {
        toast.error("Failed to remove. Please refresh.");
        fetchSubscriptions();
        return;
      }

      toast.success("Subscription removed!");
    } catch (error) {
      console.error("Failed to delete subscription:", error);
      toast.error("Failed to remove. Please refresh.");
      fetchSubscriptions();
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalMonthly = subscriptions.reduce(
    (sum, subscription) => sum + subscription.amount,
    0
  );
  const symbol = getCurrencySymbol(currency);

  return (
    <>
      <div className="space-y-5 px-4 pb-7 pt-6 md:px-6 lg:px-8">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Recurring payments
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Subscriptions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {subscriptions.length} active · {symbol}
              {totalMonthly.toLocaleString()} / month
            </p>
          </div>

          <Button
            onClick={openCreateForm}
            className="h-12 w-full gap-2 rounded-2xl px-5 text-sm font-semibold shadow-lg shadow-white/10 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Subscription
          </Button>
        </section>

        {/* Overview Card */}
        <section className="relative overflow-hidden rounded-[1.65rem] border border-white/10 bg-[#080808]/95 p-5 shadow-2xl shadow-black/30 md:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-amber-500/[0.08] blur-3xl" />
          <div className="pointer-events-none absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-emerald-500/[0.055] blur-3xl" />

          <div className="relative grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="flex items-start gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300 shadow-lg shadow-amber-500/10">
                <Repeat2 className="h-6 w-6" strokeWidth={2.3} />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-black bg-emerald-400 text-black">
                  <BadgeCheck className="h-3 w-3" strokeWidth={3} />
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Subscription overview
                </p>
                <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
                  <p className="text-3xl font-bold leading-none text-white md:text-4xl">
                    {symbol}
                    {totalMonthly.toLocaleString()}
                  </p>
                  <p className="pb-1 text-sm font-medium text-slate-500">
                    per month
                  </p>
                </div>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
                  Recurring payments are tracked separately and generated as
                  expenses every month, so your spending stays accurate.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <OverviewStat
                icon={CreditCard}
                label="Active"
                value={String(subscriptions.length)}
                tone="green"
              />
              <OverviewStat
                icon={CalendarClock}
                label="Cycle"
                value="Monthly"
                tone="amber"
              />
              <OverviewStat
                icon={Sparkles}
                label="Auto"
                value="Enabled"
                tone="blue"
              />
            </div>
          </div>
        </section>

        {/* List */}
        <section className="flex min-h-[320px] max-h-[calc(100dvh-340px)] flex-col overflow-hidden rounded-[1.65rem] border border-white/10 bg-[#080808]/95 shadow-2xl shadow-black/25 md:max-h-[620px]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300 sm:flex">
                <CalendarClock className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Subscription list
                </h3>
                <p className="text-xs text-slate-500">
                  Recurring payments tracked by MoneyFlow
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-slate-400 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              Monthly cycle
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
                />
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-6 py-12 text-center">
              <div className="flex max-w-sm flex-col items-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-400/20 bg-amber-400/10 text-amber-300 shadow-lg shadow-amber-500/10">
                  <Repeat2 className="h-8 w-8" strokeWidth={2.2} />
                </div>

                <h3 className="text-lg font-semibold text-white">
                  No subscriptions yet
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Add recurring payments like Netflix, internet, or memberships
                  and MoneyFlow will track them every month.
                </p>

                <Button onClick={openCreateForm} className="mt-6 h-11 gap-2 rounded-2xl">
                  <Plus className="h-4 w-4" />
                  Add Subscription
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 sm:p-4">
              {subscriptions.map((subscription, index) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  currency={currency}
                  onEdit={(selectedSubscription) => {
                    setEditingSub(selectedSubscription);
                    setShowForm(true);
                  }}
                  onDelete={(id) => setDeletingId(id)}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <SubscriptionFormDialog
        open={showForm}
        onClose={() => {
          setShowForm(false);
          fetchSubscriptions();
        }}
        subscription={editingSub}
      />

      <ConfirmModal
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Remove Subscription?"
        description="This subscription will be deactivated. Previously generated expenses will remain."
      />
    </>
  );
}

function OverviewStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof CreditCard;
  label: string;
  value: string;
  tone: "green" | "amber" | "blue";
}) {
  const toneClass = {
    green: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    blue: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  }[tone];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3.5">
      <div className="mb-3 flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl border ${toneClass}`}
        >
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>
      </div>
      <p className="text-base font-bold text-white">{value}</p>
    </div>
  );
}
