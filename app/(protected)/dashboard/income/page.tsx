"use client";

import { useEffect, useMemo, useState } from "react";
import { useMonthStore } from "@/store/monthStore";
import {
  deleteFreelanceIncome,
  getMonthlyFreelanceIncome,
  getUserIncome,
} from "@/actions/income";
import { getCurrencySymbol } from "@/lib/currency";
import {
  PlusCircle,
  Search,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import IncomeCard from "@/components/income/IncomeCard";
import IncomeFormDialog from "@/components/income/IncomeFormDialog";
import ConfirmModal from "@/components/shared/ConfirmModal";

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
    try {
      setLoading(true);

      const [data, userData] = await Promise.all([
        getMonthlyFreelanceIncome(month, year),
        getUserIncome(),
      ]);

      setEntries((data.entries ?? []) as IncomeEntry[]);
      setCurrency(userData?.currency ?? "INR");
    } catch (error) {
      console.error("Failed to load income entries:", error);
      toast.error("Failed to load income data. Please refresh.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [month, year]);

  const filtered = useMemo(() => {
    let result = [...entries];

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter((entry) =>
        entry.sourceName.toLowerCase().includes(query)
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

  const totalEarned = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const symbol = getCurrencySymbol(currency);

  const handleDelete = async () => {
    if (!deletingId) return;

    const idToDelete = deletingId;
    setDeleteLoading(true);
    setEntries((prev) => prev.filter((entry) => entry.id !== idToDelete));
    setDeletingId(null);

    try {
      const result = await deleteFreelanceIncome(idToDelete);

      if (result?.error) {
        toast.error("Failed to delete. Please refresh.");
        fetchEntries();
        return;
      }

      toast.success("Income entry deleted!");
    } catch (error) {
      console.error("Failed to delete income entry:", error);
      toast.error("Failed to delete. Please refresh.");
      fetchEntries();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="px-4 md:px-12 lg:px-20 pt-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Income</h2>
            <p className="text-xs text-slate-400">
              {entries.length} entr{entries.length !== 1 ? "ies" : "y"} this month
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingEntry(null);
              setShowForm(true);
            }}
            className="w-full sm:w-auto bg-white hover:bg-white/90 text-black gap-2 text-sm"
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
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/20 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <TrendingUp className="h-5 w-5 text-white" strokeWidth={2.2} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">Total Earned This Month</p>
                  <p className="text-xl font-bold text-white">
                    {symbol}{totalEarned.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="hidden rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-slate-400 sm:block">
                Freelance income
              </div>
            </div>
          </motion.div>
        )}

        {/* Search + Sort */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search income entries"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/30"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30 sm:w-36"
          >
            <option value="newest" className="bg-black">Newest</option>
            <option value="highest" className="bg-black">Highest</option>
            <option value="lowest" className="bg-black">Lowest</option>
          </select>
        </div>

        {/* Income List */}
        <div className="flex min-h-[300px] h-[calc(100vh-390px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 mb-3">
          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-4 py-12">
              <div className="flex max-w-sm flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <WalletCards className="h-6 w-6 text-white" strokeWidth={2.2} />
                </div>

                <h3 className="text-sm font-semibold text-white">
                  {search ? "No matching income found" : "No income added yet"}
                </h3>

                <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-400">
                  {search
                    ? "Try a different search term or clear your search."
                    : "Add your earnings for this month to start tracking your income."}
                </p>

                {!search && (
                  <Button
                    onClick={() => {
                      setEditingEntry(null);
                      setShowForm(true);
                    }}
                    className="mt-4 bg-white text-black hover:bg-white/90 text-sm"
                  >
                    Add Income
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {filtered.map((entry, i) => (
                <IncomeCard
                  key={entry.id}
                  entry={entry}
                  currency={currency}
                  onEdit={(incomeEntry) => {
                    setEditingEntry(incomeEntry);
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

      <IncomeFormDialog
        open={showForm}
        onClose={() => {
          setShowForm(false);
          fetchEntries();
        }}
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
