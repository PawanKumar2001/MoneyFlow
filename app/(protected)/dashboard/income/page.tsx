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
import {
  ArrowUpRight,
  BadgeDollarSign,
  Plus,
  Search,
  TrendingUp,
  WalletCards,
} from "lucide-react";
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
        monthlyExpenses.reduce(
          (sum, expense) => sum + Number(expense.amount || 0),
          0
        )
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

  useEffect(() => {
    if (!search.trim()) {
      setSummaryScrolled(false);
    }
  }, [search]);

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

      <div className="space-y-5 px-4 pb-7 pt-6 md:px-6 lg:px-8">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Dashboard
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Income
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {entries.length} entr{entries.length !== 1 ? "ies" : "y"} this month · {symbol}
              {totalEarned.toLocaleString()} earned
            </p>
          </div>

          <Button
            onClick={openAddIncome}
            size="lg"
            className="h-11 w-full gap-2 rounded-2xl px-5 shadow-lg shadow-emerald-500/10 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Income
          </Button>
        </section>

        {/* Search + Sort */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080808]/95 p-2.5 shadow-2xl shadow-black/30">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_36%)]" />

          <div className="relative flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-300">
                <Search className="h-3.5 w-3.5" strokeWidth={2.3} />
              </div>
              <Input
                placeholder="Search income entries"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-full rounded-2xl border-white/10 bg-black/45 pl-12 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500/30 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="flex gap-2.5">
              <div className="relative flex-1 sm:flex-none">
                <div className="pointer-events-none absolute left-3 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/10 text-blue-300 sm:flex">
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.3} />
                </div>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-12 w-full cursor-pointer rounded-2xl border border-white/10 bg-black/45 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-500/30 sm:w-44 sm:pl-12"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-black">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {isSearching && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSearch("")}
                  className="h-12 shrink-0 rounded-2xl px-4"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Income List */}
        <section className="flex min-h-[320px] max-h-[calc(100dvh-360px)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#080808]/95 shadow-2xl shadow-black/30 md:max-h-[620px]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-500/10">
                <BadgeDollarSign className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Income history</h3>
                <p className="text-xs text-slate-500">
                  {filtered.length} visible entr{filtered.length !== 1 ? "ies" : "y"}
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 sm:flex">
              <TrendingUp className="h-3.5 w-3.5" />
              Freelancer mode
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-[76px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.035]"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-5 py-12 text-center">
              <div className="flex max-w-sm flex-col items-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-500/10">
                  <WalletCards className="h-8 w-8" strokeWidth={2.2} />
                </div>

                <h3 className="text-lg font-semibold text-white">
                  {isSearching ? "No matching income found" : "No income added yet"}
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
                  {isSearching
                    ? "Try a different search term or clear your search."
                    : "Add your earnings for this month to start tracking your income."}
                </p>

                {!isSearching && (
                  <Button onClick={openAddIncome} className="mt-6 rounded-2xl">
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
              className="flex-1 space-y-3 overflow-y-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 sm:p-4"
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
        </section>
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
