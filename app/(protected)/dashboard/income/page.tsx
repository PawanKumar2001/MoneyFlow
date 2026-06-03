"use client";

import { useEffect, useMemo, useState } from "react";
import { useMonthStore } from "@/store/monthStore";
import {
  deleteFreelanceIncome,
  getMonthlyFreelanceIncome,
  getUserIncome,
} from "@/actions/income";
import { getExpenses } from "@/actions/expenses";
import { getCurrencySymbol } from "@/lib/currency";
import { PlusCircle, Search, WalletCards } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import IncomeCard from "@/components/income/IncomeCard";
import IncomeFormDialog from "@/components/income/IncomeFormDialog";
import ConfirmModal from "@/components/shared/ConfirmModal";
import IncomeSummaryBar from "@/components/shared/IncomeSummaryBar";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Highest", value: "highest" },
  { label: "Lowest", value: "lowest" },
];

type IncomeEntry = {
  id: string;
  sourceName: string;
  amount: number;
  month: number | null;
  year: number | null;
};

type ExpenseLite = {
  amount: number;
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
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [summaryScrolled, setSummaryScrolled] = useState(false);

  const fetchEntries = async () => {
    try {
      setLoading(true);

      const [incomeData, userData, expenseData] = await Promise.all([
        getMonthlyFreelanceIncome(month, year),
        getUserIncome(),
        getExpenses(month, year),
      ]);

      const incomeEntries = (incomeData.entries ?? []) as IncomeEntry[];
      const monthlyExpenses = (expenseData ?? []) as ExpenseLite[];

      setEntries(incomeEntries);
      setCurrency(userData?.currency ?? "INR");
      setTotalExpenses(
        monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
      );
    } catch (error) {
      console.error("Failed to load income entries:", error);
      toast.error("Failed to load income data. Please refresh.");
      setEntries([]);
      setTotalExpenses(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSummaryScrolled(false);
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const isSearching = search.trim().length > 0;
  const shouldCollapseSummary = summaryScrolled || isSearching;

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

  const openAddIncome = () => {
    setEditingEntry(null);
    setShowForm(true);
  };

  return (
    <>
      <IncomeSummaryBar
        loading={loading}
        collapsed={shouldCollapseSummary}
        totalIncome={totalEarned}
        totalExpenses={totalExpenses}
        currency={currency}
        incomeType="FREELANCER"
      />

      <div className="space-y-4 px-4 pb-6 pt-5 md:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Income</h2>
            <p className="text-xs text-slate-500">
              {entries.length} entr{entries.length !== 1 ? "ies" : "y"} this month · {symbol}
              {totalEarned.toLocaleString()} earned
            </p>
          </div>

          <Button onClick={openAddIncome} className="w-full gap-2 sm:w-auto">
            <PlusCircle className="h-4 w-4" />
            Add Income
          </Button>
        </div>

        {/* Search + Sort */}
        <div className="rounded-2xl border border-white/10 bg-[#080808]/95 p-2 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search income entries"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 w-full border-white/10 bg-black/40 pl-9 text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-white/30"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30 sm:w-36"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-black">
                    {option.label}
                  </option>
                ))}
              </select>

              {isSearching && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSearch("")}
                  className="shrink-0"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Income List */}
        <div className="flex min-h-[300px] max-h-[calc(100dvh-360px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/95 shadow-2xl shadow-black/25 md:max-h-[560px]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Income history</h3>
              <p className="text-xs text-slate-500">
                {filtered.length} visible entr{filtered.length !== 1 ? "ies" : "y"}
              </p>
            </div>

            <div className="hidden rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-slate-400 sm:block">
              Freelancer mode
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl bg-white/[0.04]"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-5 py-12 text-center">
              <div className="flex max-w-sm flex-col items-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <WalletCards className="h-7 w-7 text-white" strokeWidth={2.2} />
                </div>

                <h3 className="text-base font-semibold text-white">
                  {isSearching ? "No matching income found" : "No income added yet"}
                </h3>

                <p className="mt-1 max-w-xs text-sm leading-relaxed text-slate-400">
                  {isSearching
                    ? "Try a different search term or clear your search."
                    : "Add your earnings for this month to start tracking your income."}
                </p>

                {!isSearching && (
                  <Button onClick={openAddIncome} className="mt-5">
                    Add Income
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div
              onScroll={(event) => {
                if (window.innerWidth >= 768) return;
                setSummaryScrolled(event.currentTarget.scrollTop > 8);
              }}
              className="flex-1 space-y-2 overflow-y-auto p-3 sm:p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
            >
              {filtered.map((entry, index) => (
                <IncomeCard
                  key={entry.id}
                  entry={entry}
                  currency={currency}
                  onEdit={(incomeEntry) => {
                    setEditingEntry(incomeEntry);
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
