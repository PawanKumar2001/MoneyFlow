"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateCredentials } from "@/actions/profile";
import PasswordInput from "@/components/shared/PasswordInput";

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function CredentialsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const newPassword = watch("newPassword");

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const result = await updateCredentials(data);

      if (result?.error) {
        setError(result.error);
        return;
      }

      toast.success("Password updated!");
      setSuccess(true);
      reset();
    } catch {
      setError("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080808]/95 p-5 shadow-2xl shadow-black/30 sm:p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_34%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />

            <div className="relative">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-lg shadow-emerald-500/10">
                  <KeyRound className="h-5 w-5" strokeWidth={2.3} />
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Security
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Change Password
                  </h2>
                  <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-400">
                    Update your password to keep your MoneyFlow account secure.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-300">
                    Current Password
                  </Label>
                  <PasswordInput
                    placeholder="••••••••"
                    className="h-11 rounded-xl border-white/10 bg-black/45 pr-11 text-sm text-white placeholder:text-slate-600 focus:border-emerald-300/40 focus-visible:ring-0"
                    {...register("currentPassword", {
                      required: "Current password is required",
                    })}
                  />
                  {errors.currentPassword && (
                    <p className="text-xs text-red-400">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-300">
                    New Password
                  </Label>
                  <PasswordInput
                    placeholder="••••••••"
                    className="h-11 rounded-xl border-white/10 bg-black/45 pr-11 text-sm text-white placeholder:text-slate-600 focus:border-emerald-300/40 focus-visible:ring-0"
                    {...register("newPassword", {
                      required: "New password is required",
                      minLength: { value: 8, message: "Minimum 8 characters" },
                    })}
                  />
                  {errors.newPassword && (
                    <p className="text-xs text-red-400">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-300">
                    Confirm New Password
                  </Label>
                  <PasswordInput
                    placeholder="••••••••"
                    className="h-11 rounded-xl border-white/10 bg-black/45 pr-11 text-sm text-white placeholder:text-slate-600 focus:border-emerald-300/40 focus-visible:ring-0"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === newPassword || "Passwords do not match",
                    })}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-400">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                    <p className="text-xs leading-relaxed text-red-200">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <p className="text-xs leading-relaxed text-emerald-100">
                      Password updated successfully.
                    </p>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full sm:flex-1"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full gap-2 sm:flex-1"
                  >
                    <LockKeyhole className="h-4 w-4" />
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080808]/95 p-5 shadow-2xl shadow-black/30 sm:p-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_34%)]" />
              <div className="relative">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10 text-blue-300">
                    <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Password Safety
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Use a strong password that you do not use on other websites.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <SecurityPoint title="Minimum length" value="8+ characters" />
                  <SecurityPoint title="Recommended" value="Mix letters, numbers & symbols" />
                  <SecurityPoint title="Avoid" value="Old or reused passwords" />
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SecurityPoint({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
        {title}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
