"use client";

import { useEffect, useState } from "react";
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
    <div className="flex min-h-[calc(100dvh-112px)] items-center justify-center px-4 py-6">
      <div className="w-full max-w-3xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#080808]/80 px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <section className="rounded-2xl border border-white/10 bg-[#080808]/95 p-5 shadow-2xl shadow-black/30 sm:p-6">
            <div className="pointer-events-none absolute inset-0 hidden rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%)] lg:block" />

            <div className="relative">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white">
                  <UserCircle className="h-5 w-5" strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Profile Settings</h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    Update your account information and preferences.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-300">
                    Username
                  </Label>
                  <Input
                    placeholder="Your username"
                    className="h-10 border-white/10 bg-black/40 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                    {...register("username", { required: "Username is required" })}
                  />
                  {errors.username && (
                    <p className="text-xs text-red-400">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white">
                    <MailCheck className="h-4 w-4" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">
                      Monthly Summary Email
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                      Get a summary email on the 1st of every month.
                    </p>
                  </div>
                  <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      {...register("emailSummary")}
                      defaultChecked
                    />
                    <div className="relative h-6 w-11 rounded-full bg-white/10 transition-all duration-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-slate-400 after:transition-all after:duration-300 after:content-[''] peer-checked:bg-white peer-checked:after:translate-x-5 peer-checked:after:bg-black" />
                  </label>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full sm:flex-1"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-10 w-full sm:flex-1"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-white/10 bg-[#080808]/95 p-5 shadow-2xl shadow-black/30 sm:p-6">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white">
                  <WalletCards className="h-5 w-5" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Account Overview
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    Your current MoneyFlow setup.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <OverviewCard
                  loading={metaLoading}
                  icon={isFreelancer ? CircleDollarSign : BriefcaseBusiness}
                  label="Account Type"
                  value={isFreelancer ? "Freelancer / Business" : "Salaried"}
                />
                <OverviewCard
                  loading={metaLoading}
                  icon={BadgeDollarSign}
                  label="Currency"
                  value={`${currencySymbol} ${accountMeta.currency}`}
                />
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

function OverviewCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white">
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
        {loading ? (
          <div className="mt-1 h-4 w-28 animate-pulse rounded-full bg-white/10" />
        ) : (
          <p className="mt-0.5 truncate text-sm font-semibold text-white">
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
    <section className="rounded-2xl border border-white/10 bg-[#080808]/95 p-5 shadow-2xl shadow-black/30 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-red-300">
          <AlertTriangle className="h-4 w-4" strokeWidth={2.2} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {!showConfirm ? (
        <Button
          type="button"
          variant="outline"
          className="mt-4 h-10 w-full text-red-300 hover:bg-red-500/10 hover:text-red-200"
          onClick={onShowConfirm}
        >
          {buttonLabel}
        </Button>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-center text-sm font-medium text-red-200">
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
              className="h-10 w-full sm:flex-1"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-10 w-full sm:flex-1"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Working..." : confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
