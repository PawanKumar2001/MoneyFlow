"use client";

import { useEffect, useState } from "react";
import { getSubscriptions, deleteSubscription } from "@/actions/subscriptions";
import { getUserIncome } from "@/actions/income";
import { getCurrencySymbol } from "@/lib/currency";
import { PlusCircle, Repeat2 } from "lucide-react";
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

    // Optimistic update
    setSubscriptions((prev) => prev.filter((s) => s.id !== idToDelete));
    setDeletingId(null);

    try {
      const result = await deleteSubscription(idToDelete);

      if (result?.error) {
        toast.error("Failed to remove. Please refresh.");
        fetchSubscriptions();
      } else {
        toast.success("Subscription removed!");
      }
    } catch (error) {
      console.error("Failed to delete subscription:", error);
      toast.error("Failed to remove. Please refresh.");
      fetchSubscriptions();
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.amount, 0);
  const symbol = getCurrencySymbol(currency);

  return (
    <>
      <div className="px-6 md:px-12 lg:px-20 pt-6 pb-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Subscriptions</h2>
            <p className="text-xs text-slate-400">
              {subscriptions.length} active · {symbol}
              {totalMonthly.toLocaleString()} / month
            </p>
          </div>

          <Button
            onClick={openCreateForm}
            className="w-full sm:w-auto bg-white hover:bg-white/90 text-black gap-2 text-xs md:text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Add Subscription
          </Button>
        </div>

        {/* Total Card */}
        {subscriptions.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Repeat2 className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">
                  Total Monthly Subscriptions
                </p>
                <p className="text-2xl font-bold text-white">
                  {symbol}
                  {totalMonthly.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Auto-generated as expenses every month
                </p>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden flex flex-col min-h-[360px] md:h-[calc(100vh-388px)] md:min-h-[300px]">
          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center px-6 py-12 text-center">
              <div className="max-w-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Repeat2 className="h-7 w-7 text-white" strokeWidth={2.2} />
                </div>

                <h3 className="text-base font-semibold text-white mb-1">
                  No subscriptions yet
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  Add your recurring subscriptions and we&apos;ll automatically track
                  them every month.
                </p>

                <Button
                  onClick={openCreateForm}
                  className="bg-white hover:bg-white/90 text-black gap-2 text-xs md:text-sm"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Subscription
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {subscriptions.map((sub, i) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  currency={currency}
                  onEdit={(s) => {
                    setEditingSub(s);
                    setShowForm(true);
                  }}
                  onDelete={(id) => setDeletingId(id)}
                  index={i}
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
