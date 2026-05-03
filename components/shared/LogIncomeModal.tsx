"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  logFreelanceIncome,
  getMonthlyFreelanceIncome,
  deleteFreelanceIncome,
} from "@/actions/income";
import { getCurrencySymbol } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";

type IncomeEntry = {
  id: string;
  sourceName: string;
  amount: number;
};

type FormData = {
  sourceName: string;
  amount: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  month: number;
  year: number;
  currency: string;
};

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

export default function LogIncomeModal({
  open,
  onClose,
  month,
  year,
  currency,
}: Props) {
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const symbol = getCurrencySymbol(currency);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>();

  const fetchEntries = async () => {
    setFetching(true);
    const data = await getMonthlyFreelanceIncome(month, year);
    setEntries(data.entries as IncomeEntry[]);
    setTotal(data.total);
    setFetching(false);
  };

  useEffect(() => {
    if (open) fetchEntries();
  }, [open, month, year]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const result = await logFreelanceIncome({
      sourceName: data.sourceName,
      amount: Number(data.amount),
      month,
      year,
    });
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Income logged!");
      reset();
      setShowForm(false);
      fetchEntries();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await deleteFreelanceIncome(id);
    toast.success("Income entry removed!");
    fetchEntries();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Income — {MONTHS[month - 1]} {year}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Log your earnings for this month
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Total */}
          <div className="p-4 rounded-xl bg-emerald-600/10 border border-emerald-500/20">
            <p className="text-xs text-slate-400 mb-1">
              Total Earned This Month
            </p>
            <p className="text-2xl font-bold text-emerald-400">
              {symbol}{total.toLocaleString()}
            </p>
          </div>

          {/* Entries List */}
          {fetching ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 && !showForm ? (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm">
                No income logged for this month yet
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <AnimatePresence>
                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {entry.sourceName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-emerald-400">
                        {symbol}{entry.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Add Entry Form */}
          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-3 p-4 rounded-xl border border-indigo-500/20 bg-indigo-600/10"
              >
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Source</Label>
                  <Input
                    placeholder="e.g. Client Project, Consultation"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500 h-9 text-sm"
                    {...register("sourceName", { required: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">
                    Amount ({symbol})
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500 h-9 text-sm"
                    {...register("amount", {
                      required: true,
                      min: { value: 1, message: "Must be greater than 0" },
                    })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-white/10 text-slate-300 hover:bg-white/5 h-9 text-sm"
                    onClick={() => { setShowForm(false); reset(); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-white hover:bg-white/90 text-black h-9 text-sm"
                  >
                    {loading ? "Saving..." : "Add"}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Add Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/20 text-slate-400 hover:text-white hover:border-white/40 text-sm transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Log Income Entry
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}