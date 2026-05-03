"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { completeSetup } from "@/actions/setup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CURRENCIES } from "@/lib/currency";
import { ArrowLeft } from "lucide-react";

type FormData = {
  currency: string;
  primaryIncome: { sourceName: string; amount: number };
  secondaryIncomes: { sourceName: string; amount: number }[];
};

type IncomeType = "SALARIED" | "FREELANCER";

export default function SetupPage() {
  const [incomeType, setIncomeType] = useState<IncomeType | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const now = new Date();

  const STEPS = incomeType === "SALARIED"
    ? ["Currency", "Primary Income", "Secondary Income", "Review"]
    : ["Currency", "Review"];

  const { register, handleSubmit, watch, setValue, control } =
    useForm<FormData>({
      defaultValues: {
        currency: "INR",
        primaryIncome: { sourceName: "", amount: 0 },
        secondaryIncomes: [],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "secondaryIncomes",
  });

  const watchedData = watch();
  const selectedCurrency = CURRENCIES.find(
    (c) => c.code === watchedData.currency
  );
  const totalIncome =
    (Number(watchedData.primaryIncome?.amount) || 0) +
    watchedData.secondaryIncomes.reduce(
      (sum, inc) => sum + (Number(inc.amount) || 0),
      0
    );

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    const result = await completeSetup({
      incomeType: incomeType!,
      currency: data.currency,
      primaryIncome: incomeType === "SALARIED" ? data.primaryIncome : undefined,
      secondaryIncomes: incomeType === "SALARIED" ? data.secondaryIncomes : undefined,
    });
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  // Income Type Selection Screen
  if (!incomeType) {
    return (
      <div className="relative z-10 flex min-h-[calc(100vh-69px)] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-white/20">
              <span className="text-2xl">💸</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              How do you earn?
            </h1>
            <p className="text-slate-400 mt-2">
              This helps us tailor your dashboard
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Salaried */}
            <motion.button
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setIncomeType("SALARIED")}
              className="group relative p-4 sm:p-6 md:p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all duration-300 text-left"
            >
              <div className="text-4xl mb-4">💼</div>
              <h2 className="text-xl font-bold text-white mb-2">
                Salaried
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                I receive a fixed salary every month from an employer or
                business.
              </p>
              <ul className="mt-4 space-y-1.5">
                {[
                  "Fixed monthly income",
                  "Track expenses vs salary",
                  "Savings percentage",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-xs text-slate-400"
                  >
                    <span className="text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-white text-xs">→</span>
                </div>
              </div>
            </motion.button>

            {/* Freelancer */}
            <motion.button
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setIncomeType("FREELANCER")}
              className="group relative p-4 sm:p-6 md:p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-emerald-600/20 hover:border-emerald-500/50 transition-all duration-300 text-left"
            >
              <div className="text-4xl mb-4">💰</div>
              <h2 className="text-xl font-bold text-white mb-2">
                Freelancer / Business
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                My income varies each month from clients, projects, or my
                own business.
              </p>
              <ul className="mt-4 space-y-1.5">
                {[
                  "Variable monthly income",
                  "Log earnings per month",
                  "Track income trends",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-xs text-slate-400"
                  >
                    <span className="text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-xs">→</span>
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Step-based Setup Form
  return (
    <div className="relative z-10 flex min-h-[calc(100vh-69px)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-white/20">
            <span className="text-2xl">
              {incomeType === "SALARIED" ? "💼" : "💰"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {incomeType === "SALARIED" ? "Salaried Setup" : "Freelancer Setup"}
          </h1>
        </motion.div>

        {/* Back to income type selection */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => { setIncomeType(null); setStep(0); }}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <span className="text-xs text-slate-500">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8"></div>
        
        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${i < step
                  ? "bg-emerald-500 text-white"
                  : i === step
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-white/10 text-slate-500"
                  }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-8 transition-all duration-500 ${i < step ? "bg-emerald-500" : "bg-white/10"
                    }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <div className="p-4 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">

                {/* Step 0 — Currency */}
                {step === 0 && (
                  <motion.div
                    key="currency"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-1">
                        Select your currency
                      </h2>
                      <p className="text-sm text-slate-400">
                        This will be used across the app
                      </p>
                      <p className="text-xs text-red-400 leading-relaxed">
                        The currency can only be set once or changed by resetting your setup.
                      </p>
                    </div>
                    <div className="relative w-full">
                      <select
                        className="w-full appearance-none px-3 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                        defaultValue="INR"
                        onChange={(e) => setValue("currency", e.target.value)}
                      >
                        {CURRENCIES.map((c) => (
                          <option
                            key={c.code}
                            value={c.code}
                            className="bg-slate-900"
                          >
                            {c.symbol} — {c.name} ({c.code})
                          </option>
                        ))}
                      </select>

                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      </div>
                    </div>

                    {/* Freelancer info box */}
                    {incomeType === "FREELANCER" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10"
                      >
                        <p className="text-sm text-emerald-300 font-medium mb-1">
                          💰 Freelancer Mode
                        </p>
                        <p className="text-xs text-slate-400">
                          You'll log your income each month from the dashboard.
                          No fixed salary needed — just track what you earn!
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 1 — Primary Income (Salaried only) */}
                {step === 1 && incomeType === "SALARIED" && (
                  <motion.div
                    key="primary"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-1">
                        Primary Income
                      </h2>
                      <p className="text-sm text-slate-400">
                        Your main source of monthly income
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-slate-300">Income Source</Label>
                        <Input
                          placeholder="e.g. Salary, Pension"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500"
                          {...register("primaryIncome.sourceName", {
                            required: "Source name is required",
                          })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-300">
                          Amount ({selectedCurrency?.symbol})
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500"
                          {...register("primaryIncome.amount", {
                            required: "Amount is required",
                            min: { value: 0.01, message: "Must be greater than 0" },
                            validate: (v) =>
                              /^\d+(\.\d{1,2})?$/.test(String(v)) ||
                              "Max 2 decimal places allowed",
                          })}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2 — Secondary Incomes (Salaried only) */}
                {step === 2 && incomeType === "SALARIED" && (
                  <motion.div
                    key="secondary"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-1">
                        Secondary Income
                      </h2>
                      <p className="text-sm text-slate-400">
                        Optional — up to 5 additional sources
                      </p>
                    </div>
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                      <AnimatePresence>
                        {fields.map((field, index) => (
                          <motion.div
                            key={field.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex gap-2 items-start"
                          >
                            <div className="flex-1 space-y-2">
                              <Input
                                placeholder="Source name"
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500"
                                {...register(`secondaryIncomes.${index}.sourceName`)}
                              />
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Amount"
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500"
                                {...register(`secondaryIncomes.${index}.amount`)}
                              />
                            </div>
                            <button
                              type="button"
                              className="p-1.5 mt-1 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                              onClick={() => remove(index)}
                            >
                              ✕
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    {fields.length < 5 && (
                      <button
                        type="button"
                        className="w-full py-2 rounded-lg border border-dashed border-white/20 text-slate-400 hover:text-white hover:border-white/40 text-sm transition-colors"
                        onClick={() => append({ sourceName: "", amount: 0 })}
                      >
                        + Add Income Source
                      </button>
                    )}
                    {fields.length === 0 && (
                      <p className="text-center text-slate-500 text-sm py-4">
                        No secondary income added
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Review Step */}
                {step === STEPS.length - 1 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-1">
                        Review & Confirm
                      </h2>
                      <p className="text-sm text-slate-400">
                        Everything look good?
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Income Type */}
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-slate-400 text-sm">
                          Income Type
                        </span>
                        <span className="text-white font-medium">
                          {incomeType === "SALARIED"
                            ? "💼 Salaried"
                            : "💰 Freelancer"}
                        </span>
                      </div>

                      {/* Currency */}
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-slate-400 text-sm">Currency</span>
                        <span className="text-white font-medium">
                          {selectedCurrency?.symbol} {selectedCurrency?.code}
                        </span>
                      </div>

                      {/* Salaried Income Details */}
                      {incomeType === "SALARIED" && (
                        <>
                          <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-slate-400 text-sm">
                              {watchedData.primaryIncome?.sourceName ||
                                "Primary Income"}
                            </span>
                            <span className="text-emerald-400 font-medium">
                              {selectedCurrency?.symbol}
                              {Number(
                                watchedData.primaryIncome?.amount || 0
                              ).toLocaleString()}
                            </span>
                          </div>

                          {watchedData.secondaryIncomes?.map((inc, i) =>
                            inc.sourceName ? (
                              <div
                                key={i}
                                className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10"
                              >
                                <span className="text-slate-400 text-sm">
                                  {inc.sourceName}
                                </span>
                                <span className="text-emerald-400 font-medium">
                                  {selectedCurrency?.symbol}
                                  {Number(inc.amount || 0).toLocaleString()}
                                </span>
                              </div>
                            ) : null
                          )}

                          <div className="flex justify-between items-center p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
                            <span className="text-white font-semibold">
                              Total Monthly Income
                            </span>
                            <span className="text-indigo-300 font-bold text-lg">
                              {selectedCurrency?.symbol}
                              {totalIncome.toLocaleString()}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Freelancer info */}
                      {incomeType === "FREELANCER" && (
                        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                          <p className="text-sm text-emerald-300 font-medium mb-1">
                            Ready to go!
                          </p>
                          <p className="text-xs text-slate-400">
                            You'll log your monthly income from the dashboard
                            each month. Your dashboard will adapt based on what
                            you earn.
                          </p>
                        </div>
                      )}
                    </div>

                    {error && (
                      <p className="text-sm text-red-400 text-center">
                        {error}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
                    onClick={prevStep}
                  >
                    Back
                  </Button>
                )}
                {step < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    className="flex-1 bg-white hover:bg-white/90 text-black"
                    onClick={nextStep}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-white hover:bg-white/90 text-black shadow-lg shadow-emerald-500/20"
                  >
                    {loading ? "Setting up..." : "Launch MoneyFlow 🚀"}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}