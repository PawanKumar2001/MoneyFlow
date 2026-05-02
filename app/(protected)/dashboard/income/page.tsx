"use client";

import { useEffect, useState, useMemo } from "react";
import { useMonthStore } from "@/store/monthStore";
import {
  getMonthlyFreelanceIncome,
  deleteFreelanceIncome,
  getUserIncome,
} from "@/actions/income";
import { getCurrencySymbol } from "@/lib/currency";
import { Search, PlusCircle, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import IncomeCard from "@/components/income/IncomeCard";
import IncomeFormDialog from "@/components/income/IncomeFormDialog";
import ConfirmModal from "@/components/shared/ConfirmModal";
import EmptyState from "@/components/shared/EmptyState";

type IncomeEntry = {
  id: string;
  sourceName: string;
  amount: number;
  month: number | null;
  year: number | null;
};

export default function IncomePage() {
  const { month, year } = useMonthStore();
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("INR");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    const [data, userData] = await Promise.all([
      getMonthlyFreelanceIncome(month, year),
      getUserIncome(),
    ]);
    setEntries(data.entries as IncomeEntry[]);
    setCurrency(userData.currency);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, [month, year]);

  const filtered = useMemo(() => {
    let result = [...entries];

    if (search) {
      result = result.filter((e) =>
        e.sourceName.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sortBy) {
      case "highest":
        result.sort((a, b) => b.amount - a.amount);
        break;
      case "lowest":
        result.sort((a, b) => a.amount - b.amount);
        break;
      default:
        break;
    }

    return result;
  }, [entries, search, sortBy]);

  const totalEarned = entries.reduce((sum, e) => sum + e.amount, 0);
  const symbol = getCurrencySymbol(currency);

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    await deleteFreelanceIncome(deletingId);
    toast.success("Income entry deleted!");
    setDeletingId(null);
    setDeleteLoading(false);
    fetchEntries();
  };

  return (
    <>
      <div className="px-6 md:px-12 lg:px-20 pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Income</h2>
            <p className="text-xs text-slate-400">
              {entries.length} entr{entries.length !== 1 ? "ies" : "y"} this month
            </p>
          </div>
          <Button
            onClick={() => { setEditingEntry(null); setShowForm(true); }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Income
          </Button>
        </div>

        {/* Total Card */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-600/10 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Earned This Month</p>
                <p className="text-xl font-bold text-emerald-400">
                  {symbol}{totalEarned.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search Income Entries"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500 w-full h-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sm:w-36 px-3 py-2 h-10 rounded-lg bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="newest" className="bg-slate-900">Newest</option>
            <option value="highest" className="bg-slate-900">Highest</option>
            <option value="lowest" className="bg-slate-900">Lowest</option>
          </select>
        </div>

        {/* Income List */}
        <div
          className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col mb-3"
          style={{ height: "calc(100vh - 390px)", minHeight: "300px" }}
        >
          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon="💰"
                title="No income added yet"
                description={
                  search
                    ? "Try adjusting your search"
                    : "Add your earnings for this month to start tracking"
                }
                actionLabel={!search ? "Add Income" : undefined}
                onAction={() => { setEditingEntry(null); setShowForm(true); }}
              />
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {filtered.map((entry, i) => (
                <IncomeCard
                  key={entry.id}
                  entry={entry}
                  currency={currency}
                  onEdit={(e) => { setEditingEntry(e); setShowForm(true); }}
                  onDelete={(id) => setDeletingId(id)}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <IncomeFormDialog
        open={showForm}
        onClose={() => { setShowForm(false); fetchEntries(); }}
        month={month}
        year={year}
        currency={currency}
        entry={editingEntry}
      />
      <ConfirmModal
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Income Entry?"
        description="This income entry will be permanently deleted."
      />
    </>
  );
}