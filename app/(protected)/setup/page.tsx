"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { completeSetup } from "@/actions/setup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CURRENCIES } from "@/lib/currency";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  CircleDollarSign,
  Mail,
  Plus,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";

type FormData = {
  currency: string;
  emailSummary: boolean;
  primaryIncome: { sourceName: string; amount: number };
  secondaryIncomes: { sourceName: string; amount: number }[];
};

type IncomeType = "SALARIED" | "FREELANCER";

export default function SetupPage() {
  const [incomeType, setIncomeType] = useState<IncomeType | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const steps = incomeType === "SALARIED"
    ? ["Currency", "Primary Income", "Secondary Income", "Review"]
    : ["Currency", "Review"];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      currency: "INR",
      emailSummary: true,
      primaryIncome: { sourceName: "", amount: 0 },
      secondaryIncomes: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "secondaryIncomes",
  });

  const watchedData = watch();
  const selectedCurrency =
    CURRENCIES.find((c) => c.code === watchedData.currency) ?? CURRENCIES[0];

  const secondaryIncomes = watchedData.secondaryIncomes ?? [];
  const totalIncome =
    (Number(watchedData.primaryIncome?.amount) || 0) +
    secondaryIncomes.reduce(
      (sum, inc) => sum + (Number(inc.amount) || 0),
      0
    );

  const nextStep = async () => {
    setError(null);

    if (incomeType === "SALARIED" && step === 1) {
      const isValid = await trigger([
        "primaryIncome.sourceName",
        "primaryIncome.amount",
      ]);

      if (!isValid) return;
    }

    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const changeIncomeType = () => {
    setIncomeType(null);
    setStep(0);
    setError(null);
    setCompleted(false);
  };

  const onSubmit = async (data: FormData) => {
    if (!incomeType) return;

    try {
      setLoading(true);
      setError(null);

      const result = await completeSetup({
        incomeType,
        currency: data.currency,
        emailSummary: data.emailSummary,
        primaryIncome: incomeType === "SALARIED" ? data.primaryIncome : undefined,
        secondaryIncomes:
          incomeType === "SALARIED" ? data.secondaryIncomes : undefined,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      setCompleted(true);
    } catch {
      setError("Something went wrong while completing setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!incomeType) {
    return (
      <div className="relative z-10 flex min-h-[calc(100dvh-69px)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <IconBadge className="mx-auto mb-4">
              <Wallet className="h-6 w-6" strokeWidth={2.2} />
            </IconBadge>
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              How do you earn?
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400 md:text-base">
              Choose the income style that best matches how you manage money.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <IncomeTypeCard
              icon={<Briefcase className="h-6 w-6" strokeWidth={2.2} />}
              title="Salaried"
              description="I receive a fixed income every month from an employer or business."
              items={[
                "Fixed monthly income",
                "Expense tracking against salary",
                "Savings percentage insights",
              ]}
              delay={0.1}
              onClick={() => setIncomeType("SALARIED")}
            />

            <IncomeTypeCard
              icon={<CircleDollarSign className="h-6 w-6" strokeWidth={2.2} />}
              title="Freelancer / Business"
              description="My income varies each month from clients, projects, or business work."
              items={[
                "Variable monthly income",
                "Log earnings every month",
                "Income and expense trends",
              ]}
              delay={0.2}
              onClick={() => setIncomeType("FREELANCER")}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex min-h-[calc(100dvh-69px)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md sm:max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <IconBadge className="mx-auto mb-4">
            {incomeType === "SALARIED" ? (
              <Briefcase className="h-6 w-6" strokeWidth={2.2} />
            ) : (
              <CircleDollarSign className="h-6 w-6" strokeWidth={2.2} />
            )}
          </IconBadge>
          <h1 className="text-xl font-bold text-white md:text-2xl">
            {incomeType === "SALARIED" ? "Salaried Setup" : "Freelancer Setup"}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Configure MoneyFlow for your income style
          </p>
        </motion.div>

        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={changeIncomeType}
            className="flex items-center gap-2 text-xs text-slate-400 transition-colors hover:text-white sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Change income type
          </button>
          <span className="shrink-0 rounded-full border border-white/10 bg-[#080808]/90 px-2.5 py-1 text-xs text-slate-400">
            Step {step + 1} of {steps.length}
          </span>
        </div>

        <StepIndicator steps={steps} currentStep={step} />

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/95 shadow-2xl shadow-black/30">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%)]" />
          <div className="relative p-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              {completed ? (
                <CompletionScreen />
              ) : (
                <>
                  <AnimatePresence mode="wait">
                    {step === 0 && (
                      <motion.div
                        key="currency"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-5"
                      >
                        <SectionHeader
                          title="Select your currency"
                          description="This will be used across the app."
                        />

                        <select
                          className="h-10 w-full rounded-lg border border-white/10 bg-black/60 px-3 text-sm text-white outline-none transition-colors focus:border-white/40"
                          value={watchedData.currency}
                          onChange={(e) => setValue("currency", e.target.value)}
                        >
                          {CURRENCIES.map((currency) => (
                            <option
                              key={currency.code}
                              value={currency.code}
                              className="bg-black"
                            >
                              {currency.symbol} — {currency.name} ({currency.code})
                            </option>
                          ))}
                        </select>

                        {incomeType === "FREELANCER" && (
                          <InfoBox
                            icon={<CircleDollarSign className="h-4 w-4" />}
                            title="Freelancer Mode"
                            description="You'll log your income each month from the dashboard. No fixed salary is needed."
                          />
                        )}
                      </motion.div>
                    )}

                    {step === 1 && incomeType === "SALARIED" && (
                      <motion.div
                        key="primary"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-5"
                      >
                        <SectionHeader
                          title="Primary income"
                          description="Add your main source of monthly income."
                        />

                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-slate-300">
                              Income Source
                            </Label>
                            <Input
                              placeholder="e.g. Salary"
                              className="h-10 border-white/10 bg-[#0b0b0b] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                              {...register("primaryIncome.sourceName", {
                                required: "Source name is required",
                              })}
                            />
                            {errors.primaryIncome?.sourceName && (
                              <p className="text-xs text-red-400">
                                {errors.primaryIncome.sourceName.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs text-slate-300">
                              Amount ({selectedCurrency?.symbol})
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="h-10 border-white/10 bg-[#0b0b0b] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                              {...register("primaryIncome.amount", {
                                valueAsNumber: true,
                                required: "Amount is required",
                                min: {
                                  value: 0.01,
                                  message: "Must be greater than 0",
                                },
                              })}
                            />
                            {errors.primaryIncome?.amount && (
                              <p className="text-xs text-red-400">
                                {errors.primaryIncome.amount.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && incomeType === "SALARIED" && (
                      <motion.div
                        key="secondary"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-5"
                      >
                        <SectionHeader
                          title="Secondary income"
                          description="Optional — add up to 5 additional sources."
                        />

                        <div className="max-h-64 space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                          <AnimatePresence>
                            {fields.map((field, index) => (
                              <motion.div
                                key={field.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="rounded-xl border border-white/10 bg-[#0b0b0b]/95 p-3"
                              >
                                <div className="flex gap-2">
                                  <div className="flex-1 space-y-2">
                                    <Input
                                      placeholder="Source name"
                                      className="h-10 border-white/10 bg-[#0b0b0b] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                                      {...register(
                                        `secondaryIncomes.${index}.sourceName`
                                      )}
                                    />
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      className="h-10 border-white/10 bg-[#0b0b0b] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                                      {...register(
                                        `secondaryIncomes.${index}.amount`,
                                        { valueAsNumber: true }
                                      )}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                                    onClick={() => remove(index)}
                                    aria-label="Remove income source"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>

                        {fields.length < 5 && (
                          <button
                            type="button"
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 text-sm text-slate-400 transition-colors hover:border-white/40 hover:text-white"
                            onClick={() => append({ sourceName: "", amount: 0 })}
                          >
                            <Plus className="h-4 w-4" />
                            Add Income Source
                          </button>
                        )}

                        {fields.length === 0 && (
                          <div className="rounded-xl border border-white/10 bg-[#0b0b0b]/95 px-4 py-5 text-center">
                            <p className="text-sm text-slate-500">
                              No secondary income added
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {step === steps.length - 1 && (
                      <motion.div
                        key="review"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-5"
                      >
                        <SectionHeader
                          title="Review & confirm"
                          description="Make sure everything looks right."
                        />

                        <div className="space-y-3">
                          <ReviewRow
                            label="Income Type"
                            value={
                              incomeType === "SALARIED"
                                ? "Salaried"
                                : "Freelancer / Business"
                            }
                          />
                          <ReviewRow
                            label="Currency"
                            value={`${selectedCurrency?.symbol} ${selectedCurrency?.code}`}
                          />

                          {incomeType === "SALARIED" && (
                            <>
                              <ReviewRow
                                label={
                                  watchedData.primaryIncome?.sourceName ||
                                  "Primary Income"
                                }
                                value={`${selectedCurrency?.symbol}${Number(
                                  watchedData.primaryIncome?.amount || 0
                                ).toLocaleString()}`}
                              />

                              {secondaryIncomes.map((income, index) =>
                                income.sourceName ? (
                                  <ReviewRow
                                    key={`${income.sourceName}-${index}`}
                                    label={income.sourceName}
                                    value={`${selectedCurrency?.symbol}${Number(
                                      income.amount || 0
                                    ).toLocaleString()}`}
                                  />
                                ) : null
                              )}

                              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.06] p-3">
                                <span className="text-sm font-medium text-white">
                                  Total Monthly Income
                                </span>
                                <span className="text-base font-bold text-white">
                                  {selectedCurrency?.symbol}
                                  {totalIncome.toLocaleString()}
                                </span>
                              </div>
                            </>
                          )}

                          {incomeType === "FREELANCER" && (
                            <InfoBox
                              icon={<Sparkles className="h-4 w-4" />}
                              title="Ready to go"
                              description="You'll log your monthly income from the dashboard. MoneyFlow will adapt based on what you earn."
                            />
                          )}

                          <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0b0b0b]/95 p-3 sm:flex-row sm:items-center">
                            <div className="flex flex-1 items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white">
                                <Mail className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  Monthly Summary Email
                                </p>
                                <p className="mt-0.5 text-xs text-slate-400">
                                  Get a summary email on the 1st of every month
                                </p>
                              </div>
                            </div>

                            <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                              <input
                                type="checkbox"
                                className="peer sr-only"
                                {...register("emailSummary")}
                              />
                              <div className="relative h-6 w-11 rounded-full bg-white/10 transition-all duration-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-slate-400 after:transition-all after:duration-300 after:content-[''] peer-checked:bg-white peer-checked:after:translate-x-5 peer-checked:after:bg-black" />
                            </label>
                          </div>
                        </div>

                        {error && (
                          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                            <p className="text-center text-xs text-red-300">
                              {error}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-7 flex gap-3">
                    {step > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 flex-1"
                        onClick={prevStep}
                      >
                        Back
                      </Button>
                    )}

                    {step < steps.length - 1 ? (
                      <Button
                        type="button"
                        className="h-10 flex-1 gap-2"
                        onClick={nextStep}
                      >
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={loading}
                        className="h-10 flex-1"
                      >
                        {loading ? "Setting up..." : "Confirm Setup"}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBadge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white shadow-lg shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}

function IncomeTypeCard({
  icon,
  title,
  description,
  items,
  delay,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  items: string[];
  delay: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className="group rounded-2xl border border-white/10 bg-[#080808]/95 p-5 text-left shadow-xl shadow-black/20 transition-all duration-300 hover:border-white/25 hover:bg-[#0d0d0d] sm:p-6"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white shadow-lg shadow-black/20">
        {icon}
      </div>
      <h2 className="text-base font-semibold text-white sm:text-lg">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-white">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </motion.button>
  );
}

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="mb-6 flex items-center justify-center gap-1.5 sm:gap-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-1.5 sm:gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 sm:h-8 sm:w-8 ${
              index <= currentStep
                ? "bg-white text-black shadow-lg shadow-white/10"
                : "bg-white/[0.06] text-slate-500"
            }`}
          >
            {index < currentStep ? <Check className="h-3.5 w-3.5" /> : index + 1}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-px w-6 transition-all duration-300 sm:w-8 ${
                index < currentStep ? "bg-white" : "bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-white sm:text-lg">{title}</h2>
      <p className="mt-1 text-xs text-slate-400 sm:text-sm">{description}</p>
    </div>
  );
}

function InfoBox({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-[#0b0b0b]/95 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b0b0b]/95 p-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-right text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function CompletionScreen() {
  return (
    <motion.div
      key="complete"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-3 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black shadow-lg shadow-white/10"
      >
        <Check className="h-7 w-7" strokeWidth={2.4} />
      </motion.div>
      <h2 className="text-lg font-bold text-white">You're all set!</h2>
      <p className="mx-auto mt-1 max-w-xs text-sm text-slate-400">
        MoneyFlow is ready to help you track your finances.
      </p>
      <Button
        type="button"
        onClick={() => {
          window.location.href = "/dashboard";
        }}
        className="mt-6 h-10 w-full gap-2"
      >
        Go to Dashboard
        <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
