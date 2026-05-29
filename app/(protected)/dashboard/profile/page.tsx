"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, resetUserSetup } from "@/actions/profile";
import { ArrowLeft, AlertTriangle, MailCheck, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

type FormData = {
  username: string;
  emailSummary: boolean;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { emailSummary: true },
  });

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
              <UserCircle className="h-5 w-5 text-white" strokeWidth={2.2} />
            </div>
            <h2 className="text-lg font-bold text-white">Profile Settings</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Update your account information and preferences.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-300">Username</Label>
              <Input
                placeholder="Your username"
                className="h-10 border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && (
                <p className="text-xs text-red-400">{errors.username.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                <MailCheck className="h-4 w-4 text-white" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">Monthly Summary Email</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                  Get a summary email on the 1st of every month.
                </p>
              </div>
              <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  {...register("emailSummary")}
                  defaultChecked
                />
                <div className="relative h-6 w-11 rounded-full bg-white/10 transition-all duration-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-slate-400 after:transition-all after:duration-300 peer-checked:bg-white/90 peer-checked:after:translate-x-5 peer-checked:after:bg-black" />
              </label>
            </div>

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
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30">
              <AlertTriangle className="h-4 w-4 text-red-400" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Reset Setup</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                This will permanently delete all your income, expenses, and
                subscriptions. You'll be signed out and redirected to setup.
              </p>
            </div>
          </div>

          {!showResetConfirm ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4 h-10 w-full rounded-xl border-white/10 bg-white/[0.03] text-red-300 hover:bg-red-500/10 hover:text-red-200"
              onClick={() => setShowResetConfirm(true)}
            >
              Reset My Setup
            </Button>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-center text-sm font-medium text-red-200">
                  Are you absolutely sure?
                </p>
                <p className="mt-1 text-center text-xs leading-relaxed text-slate-400">
                  This cannot be undone. All data will be permanently deleted.
                </p>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full rounded-xl border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white sm:flex-1"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={resetLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="h-10 w-full rounded-xl bg-white text-black hover:bg-white/90 sm:flex-1"
                  onClick={handleReset}
                  disabled={resetLoading}
                >
                  {resetLoading ? "Resetting..." : "Reset Everything"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
