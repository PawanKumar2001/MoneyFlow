"use client";

import { useEffect, useState } from "react";
import type { ElementType } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ArrowLeft,
  AlertTriangle,
  BadgeDollarSign,
  BriefcaseBusiness,
  CircleDollarSign,
  MailCheck,
  RefreshCcw,
  ShieldCheck,
  UserCircle,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, resetUserSetup } from "@/actions/profile";
import { getUserIncome } from "@/actions/income";
import { getCurrencySymbol } from "@/lib/currency";

type FormData = {
  username: string;
  emailSummary: boolean;
};

type AccountMeta = {
  incomeType: string;
  currency: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [accountMeta, setAccountMeta] = useState<AccountMeta>({
    incomeType: "SALARIED",
    currency: "INR",
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { emailSummary: true },
  });

  useEffect(() => {
    let mounted = true;

    const fetchAccountMeta = async () => {
      try {
        setMetaLoading(true);
        const data = await getUserIncome();

        if (!mounted) return;

        setAccountMeta({
          incomeType: data?.incomeType ?? "SALARIED",
          currency: data?.currency ?? "INR",
        });
      } catch (error) {
        console.error("Failed to load account metadata:", error);
      } finally {
        if (mounted) setMetaLoading(false);
      }
    };

    fetchAccountMeta();

    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const result = await updateProfile(data);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetLoading(true);
      const result = await resetUserSetup();

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Setup reset! Signing you out...");
      await signOut({ callbackUrl: "/setup" });
    } catch {
      toast.error("Failed to reset setup. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const isFreelancer = accountMeta.incomeType === "FREELANCER";
  const currencySymbol = getCurrencySymbol(accountMeta.currency);

  return (
    <div className="flex min-h-[calc(100dvh-112px)] items-center justify-center px-4 py-8 md:px-6">
      <div className="w-full max-w-5xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#080808]/90 px-3.5 py-2 text-xs font-semibold text-slate-400 shadow-xl shadow-black/20 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-5 rounded-[1.75rem] border border-white/10 bg-[#070707]/95 p-5 shadow-2xl shadow-black/30 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <ColorIcon icon={UserCircle} color="emerald" size="lg" />
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Account
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Profile Settings
                </h1>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-400">
                  Manage your MoneyFlow identity, account setup, and email preferences.
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Account active
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#080808]/95 p-5 shadow-2xl shadow-black/30 sm:p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(234,179,8,0.07),transparent_34%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative">
              <div className="mb-6 flex items-start gap-3">
                <ColorIcon icon={UserCircle} color="emerald" />
                <div>
                  <h2 className="text-lg font-bold text-white md:text-xl">
                    Basic details
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    Update your username and monthly summary preference.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Username
                  </Label>
                  <Input
                    placeholder="Your username"
                    className="h-12 rounded-2xl border-white/10 bg-black/45 px-4 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400/40 focus-visible:ring-0"
                    {...register("username", { required: "Username is required" })}
                  />
                  {errors.username && (
                    <p className="text-xs text-red-400">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <div className="flex items-center gap-3">
                    <ColorIcon icon={MailCheck} color="amber" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">
                        Monthly Summary Email
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        Receive your financial summary on the 1st of every month.
                      </p>
                    </div>
                    <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        {...register("emailSummary")}
                        defaultChecked
                      />
                      <div className="relative h-7 w-12 rounded-full border border-white/10 bg-white/10 transition-all duration-300 after:absolute after:left-[3px] after:top-[3px] after:h-5 after:w-5 after:rounded-full after:bg-slate-400 after:transition-all after:duration-300 after:content-[''] peer-checked:border-emerald-500/30 peer-checked:bg-emerald-500/20 peer-checked:after:translate-x-5 peer-checked:after:bg-emerald-300" />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full rounded-2xl sm:flex-1"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-2xl sm:flex-1"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#080808]/95 p-5 shadow-2xl shadow-black/30 sm:p-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.07),transparent_36%)]" />

              <div className="relative">
                <div className="mb-5 flex items-start gap-3">
                  <ColorIcon icon={WalletCards} color="sky" />
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Account Overview
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                      Your current MoneyFlow setup.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <OverviewCard
                    loading={metaLoading}
                    icon={isFreelancer ? CircleDollarSign : BriefcaseBusiness}
                    iconColor={isFreelancer ? "sky" : "emerald"}
                    label="Account Type"
                    value={isFreelancer ? "Freelancer / Business" : "Salaried"}
                  />
                  <OverviewCard
                    loading={metaLoading}
                    icon={BadgeDollarSign}
                    iconColor="amber"
                    label="Currency"
                    value={`${currencySymbol} ${accountMeta.currency}`}
                  />
                </div>
              </div>
            </section>

            <DangerSection
              title="Reset Setup"
              description="Delete your income, expenses, and subscriptions, then restart setup from scratch. Your account will remain active."
              buttonLabel="Reset My Setup"
              confirmTitle="Reset everything?"
              confirmDescription="This cannot be undone. All finance data will be permanently deleted, but your account will stay active."
              loading={resetLoading}
              showConfirm={showResetConfirm}
              onShowConfirm={() => setShowResetConfirm(true)}
              onCancel={() => setShowResetConfirm(false)}
              onConfirm={handleReset}
              confirmLabel="Reset Everything"
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

function ColorIcon({
  icon: Icon,
  color,
  size = "md",
}: {
  icon: ElementType;
  color: "emerald" | "amber" | "sky" | "red";
  size?: "md" | "lg";
}) {
  const styles = {
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 shadow-emerald-500/10",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-300 shadow-amber-500/10",
    sky: "border-sky-500/20 bg-sky-500/10 text-sky-300 shadow-sky-500/10",
    red: "border-red-500/20 bg-red-500/10 text-red-300 shadow-red-500/10",
  };

  const sizeClass = size === "lg" ? "h-13 w-13 rounded-2xl" : "h-10 w-10 rounded-xl";
  const iconSize = size === "lg" ? "h-6 w-6" : "h-4.5 w-4.5";

  return (
    <div
      className={`flex shrink-0 items-center justify-center border shadow-lg ${sizeClass} ${styles[color]}`}
    >
      <Icon className={iconSize} strokeWidth={2.2} />
    </div>
  );
}

function OverviewCard({
  icon: Icon,
  iconColor,
  label,
  value,
  loading,
}: {
  icon: ElementType;
  iconColor: "emerald" | "amber" | "sky";
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-white/15 hover:bg-black/45">
      <ColorIcon icon={Icon} color={iconColor} />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
        {loading ? (
          <div className="mt-2 h-4 w-32 animate-pulse rounded-full bg-white/10" />
        ) : (
          <p className="mt-1 truncate text-base font-bold text-white">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function DangerSection({
  title,
  description,
  buttonLabel,
  confirmTitle,
  confirmDescription,
  confirmLabel,
  loading,
  showConfirm,
  onShowConfirm,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel: string;
  loading: boolean;
  showConfirm: boolean;
  onShowConfirm: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#080808]/95 p-5 shadow-2xl shadow-black/30 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.10),transparent_34%)]" />

      <div className="relative">
        <div className="flex items-start gap-3">
          <ColorIcon icon={AlertTriangle} color="red" />
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              {description}
            </p>
          </div>
        </div>

        {!showConfirm ? (
          <Button
            type="button"
            variant="outline"
            className="mt-5 h-11 w-full rounded-2xl border-red-500/20 text-red-300 hover:bg-red-500/10 hover:text-red-200"
            onClick={onShowConfirm}
          >
            <RefreshCcw className="h-4 w-4" />
            {buttonLabel}
          </Button>
        ) : (
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-center text-sm font-semibold text-red-200">
                {confirmTitle}
              </p>
              <p className="mt-1 text-center text-xs leading-relaxed text-slate-400">
                {confirmDescription}
              </p>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-2xl sm:flex-1"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-11 w-full rounded-2xl sm:flex-1"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? "Working..." : confirmLabel}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
