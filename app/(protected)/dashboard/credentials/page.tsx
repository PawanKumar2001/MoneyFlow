"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateCredentials } from "@/actions/profile";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
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
    <div className="flex items-center justify-center px-4 py-6 min-h-[calc(100dvh-140px)]">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 flex items-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="mb-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <KeyRound className="h-5 w-5 text-white" strokeWidth={2.2} />
            </div>
            <h2 className="text-lg font-bold text-white">Change Credentials</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Update your password to keep your MoneyFlow account secure.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-300">
                Current Password
              </Label>
              <PasswordInput
                placeholder="••••••••"
                className="h-10 border-white/10 bg-white/5 pr-10 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
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
                className="h-10 border-white/10 bg-white/5 pr-10 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
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
                className="h-10 border-white/10 bg-white/5 pr-10 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
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

            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
              <p className="text-xs leading-relaxed text-slate-400">
                Use at least 8 characters and avoid reusing passwords from other
                websites.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-xs leading-relaxed text-red-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs leading-relaxed text-slate-300">
                  Password updated successfully.
                </p>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-xl border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white sm:flex-1"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-10 w-full rounded-xl bg-white text-black hover:bg-white/90 sm:flex-1"
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
