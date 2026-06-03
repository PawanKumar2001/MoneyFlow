"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateCredentials } from "@/actions/profile";
import { ArrowLeft, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import PasswordInput from "@/components/shared/PasswordInput";

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function CredentialsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    <div className="flex items-center justify-center px-4 py-6 min-h-[calc(100dvh-112px)]">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 flex items-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080808]/95 p-5 shadow-2xl shadow-black/40 sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%)]" />

          <div className="relative mb-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
              <KeyRound className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <h2 className="text-lg font-bold text-white">Change Password</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Update your password to keep your MoneyFlow account secure.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-300">
                Current Password
              </Label>
              <PasswordInput
                placeholder="••••••••"
                className="h-10 border-white/10 bg-white/[0.04] pr-11 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
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
                className="h-10 border-white/10 bg-white/[0.04] pr-11 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: { value: 8, message: "Minimum 8 characters" },
                })}
              />
              {errors.newPassword && (
                <p className="text-xs text-red-400">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-300">
                Confirm New Password
              </Label>
              <PasswordInput
                placeholder="••••••••"
                className="h-10 border-white/10 bg-white/[0.04] pr-11 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (v) => v === newPassword || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40">
                <LockKeyhole className="h-4 w-4 text-white" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-white">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-300" />
                  Password safety
                </div>
                <p className="text-xs leading-relaxed text-slate-400">
                  Use at least 8 characters and avoid reusing passwords from other
                  websites.
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-xs leading-relaxed text-red-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs leading-relaxed text-slate-300">
                  Password updated successfully. You can continue using MoneyFlow safely.
                </p>
              </div>
            )}

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
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
