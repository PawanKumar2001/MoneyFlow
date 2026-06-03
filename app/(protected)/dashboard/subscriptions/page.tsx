"use client";

import { useEffect, useState } from "react";
import { getSubscriptions, deleteSubscription } from "@/actions/subscriptions";
import { getUserIncome } from "@/actions/income";
import { getCurrencySymbol } from "@/lib/currency";
import { CalendarClock, PlusCircle, Repeat2 } from "lucide-react";
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
    setSubscriptions((prev) => prev.filter((subscription) => subscription.id !== idToDelete));

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

  const totalMonthly = subscriptions.reduce((sum, subscription) => sum + subscription.amount, 0);
  const symbol = getCurrencySymbol(currency);

  return (
    <>
      <div className="space-y-4 px-4 pt-6 pb-6 md:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Subscriptions</h2>
            <p className="text-xs text-slate-500">
              {subscriptions.length} active · {symbol}
              {totalMonthly.toLocaleString()} / month
            </p>
          </div>

          <Button
            onClick={openCreateForm}
            className="w-full gap-2 sm:w-auto"
          >
            <PlusCircle className="h-4 w-4" />
            Add Subscription
          </Button>
        </div>

        {/* Overview Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/95 p-4 shadow-2xl shadow-black/25">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%)]" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <Repeat2 className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Subscription overview
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {symbol}
                  {totalMonthly.toLocaleString()}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Auto-generated as expenses every month.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:w-56">
              <OverviewStat label="Active" value={String(subscriptions.length)} />
              <OverviewStat label="Cycle" value="Monthly" />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex min-h-[280px] max-h-[calc(100dvh-330px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/95 shadow-2xl shadow-black/20 md:max-h-[560px]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Subscription list</h3>
              <p className="text-xs text-slate-500">
                Recurring payments tracked by MoneyFlow
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-400 sm:flex">
              <CalendarClock className="h-3.5 w-3.5" />
              Monthly cycle
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl border border-white/10 bg-white/[0.04]"
                />
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-6 py-12 text-center">
              <div className="flex max-w-sm flex-col items-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Repeat2 className="h-7 w-7 text-white" strokeWidth={2.2} />
                </div>

                <h3 className="text-base font-semibold text-white">
                  No subscriptions yet
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  Add recurring payments like Netflix, internet, or memberships and MoneyFlow will track them every month.
                </p>

                <Button onClick={openCreateForm} className="mt-5 gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Subscription
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto p-3 sm:p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
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
        </div>
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

function OverviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
