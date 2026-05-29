"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  AlertTriangle,
  MailCheck,
  RotateCcw,
  UserCircle,
} from "lucide-react";

import { updateProfile, resetUserSetup } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    setLoading(true);

    try {
      const result = await updateProfile(data);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated!");
      }
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setResetLoading(true);

    try {
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
    <div className="px-6 md:px-12 lg:px-20 pt-6 pb-8">
      <div className="mx-auto w-full max-w-xl space-y-5">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Profile Card */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <UserCircle className="h-5 w-5 text-white" strokeWidth={2.2} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Profile Settings
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                Update your account preferences and MoneyFlow settings.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-300">
                Username
              </Label>
              <Input
                placeholder="Your username"
                className="h-10 rounded-xl border-white/10 bg-black/30 text-sm text-white placeholder:text-slate-600 focus:border-white/30 focus-visible:ring-0"
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && (
                <p className="text-xs text-red-400">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email Summary Toggle */}
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <MailCheck className="h-4 w-4 text-white" strokeWidth={2.2} />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Monthly Summary Email
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                    Get a summary email on the 1st of every month.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex cursor-pointer items-center self-start sm:self-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  {...register("emailSummary")}
                  defaultChecked
                />
                <div className="relative h-6 w-11 rounded-full bg-white/10 transition-all duration-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-slate-400 after:transition-all after:duration-300 after:content-[''] peer-checked:bg-white peer-checked:after:translate-x-5 peer-checked:after:bg-black" />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-white/10 bg-transparent text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-10 rounded-xl bg-white text-sm font-semibold text-black hover:bg-white/90"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <AlertTriangle className="h-5 w-5 text-white" strokeWidth={2.2} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Reset Setup</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Delete your income, expenses, and subscriptions. You will be
                signed out and sent back to setup.
              </p>
            </div>
          </div>

          {!showResetConfirm ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full rounded-xl border-white/10 bg-transparent text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              onClick={() => setShowResetConfirm(true)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset My Setup
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-center">
                <p className="text-sm font-medium text-white">
                  Are you absolutely sure?
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  This cannot be undone. All MoneyFlow data will be permanently
                  deleted.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-white/10 bg-transparent text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={resetLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="h-10 rounded-xl bg-white text-sm font-semibold text-black hover:bg-white/90"
                  onClick={handleReset}
                  disabled={resetLoading}
                >
                  {resetLoading ? "Resetting..." : "Reset Everything"}
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
