"use client";

import { useEffect, useState } from "react";
import { getSubscriptions, deleteSubscription } from "@/actions/subscriptions";
import { getUserIncome } from "@/actions/income";
import { getCurrencySymbol } from "@/lib/currency";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubscriptionCard from "@/components/subscriptions/SubscriptionCard";
import SubscriptionFormDialog from "@/components/subscriptions/SubscriptionFormDialog";
import ConfirmModal from "@/components/shared/ConfirmModal";
import EmptyState from "@/components/shared/EmptyState";
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
    setLoading(true);
    const data = await getSubscriptions();
    setSubscriptions(data as Subscription[]);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const [, incomeData] = await Promise.all([
        fetchSubscriptions(),
        getUserIncome(),
      ]);
      setCurrency(incomeData.currency);
    };
    init();
  }, []);

const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);

    // Optimistic update
    setSubscriptions((prev) => prev.filter((s) => s.id !== deletingId));
    setDeletingId(null);

    const result = await deleteSubscription(deletingId);
    if (result?.error) {
      toast.error("Failed to remove. Please refresh.");
      fetchSubscriptions();
    } else {
      toast.success("Subscription removed!");
    }
    setDeleteLoading(false);
  };
  
  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.amount, 0);
  const symbol = getCurrencySymbol(currency);

  return (
    <>
      <div className="px-6 md:px-12 lg:px-20 pt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Subscriptions</h2>
            <p className="text-xs text-slate-400">
              {subscriptions.length} active · {symbol}{totalMonthly.toLocaleString()} / month
            </p>
          </div>
          <Button
            onClick={() => { setEditingSub(null); setShowForm(true); }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Subscription
          </Button>
        </div>

        {/* Total Card */}
        {subscriptions.length > 0 && (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-600/10 p-4">
            <p className="text-xs text-slate-400 mb-1">Total Monthly Subscriptions</p>
            <p className="text-2xl font-bold text-indigo-300">
              {symbol}{totalMonthly.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Auto-generated as expenses every month
            </p>
          </div>
        )}

        {/* List */}
        <div
          className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col mb-2"
          style={{ height: "calc(100vh - 388px)", minHeight: "300px" }}
        >
          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon="🔄"
                title="No subscriptions yet"
                description="Add your recurring subscriptions and we'll automatically track them every month."
                actionLabel="Add Subscription"
                onAction={() => { setEditingSub(null); setShowForm(true); }}
              />
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {subscriptions.map((sub, i) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  currency={currency}
                  onEdit={(s) => { setEditingSub(s); setShowForm(true); }}
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
        onClose={() => { setShowForm(false); fetchSubscriptions(); }}
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