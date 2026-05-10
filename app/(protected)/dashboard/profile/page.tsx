"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, resetUserSetup } from "@/actions/profile";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { db } from "@/lib/db";

type FormData = {
  username: string;
  emailSummary: boolean;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<FormData>({
      defaultValues: { emailSummary: true },
    });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const result = await updateProfile(data);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Profile updated!");
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setResetLoading(true);
    const result = await resetUserSetup();
    if (result?.error) {
      toast.error(result.error);
      setResetLoading(false);
      return;
    }
    toast.success("Setup reset! Signing you out...");
    await signOut({ callbackUrl: "/setup" });
  };

  return (
    <div className="flex items-center justify-center px-4 py-8 min-h-[80vh]">
      <div className="w-full max-w-lg mt-4 md:mt-0 md:my-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Profile Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 space-y-6">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white mb-4">
              <span className="text-xl">👤</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
            <p className="text-sm text-slate-400 mt-1">
              Update your account information
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Username</Label>
              <Input
                placeholder="Your username"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/50 h-11"
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && (
                <p className="text-xs text-red-400">{errors.username.message}</p>
              )}
            </div>

            {/* Email Summary Toggle */}
           <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">
                            Monthly Summary Email
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Get a summary email on the 1st of every month
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            {...register("emailSummary")}
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-white/10 peer-checked:bg-white/90 rounded-full transition-all duration-300 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:peer-checked:bg-black after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 peer-checked:after:translate-x-5" />
                        </label>
                      </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-white/10 text-slate-300 hover:bg-white/5 h-11"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-white hover:bg-white/90 text-black h-11"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-400">Reset Setup</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This will permanently delete all your income, expenses, and
                subscriptions. You'll be signed out and redirected to the setup
                screen to start completely fresh.
              </p>
            </div>
          </div>

          {!showResetConfirm ? (
            <Button
              type="button"
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 w-full"
              onClick={() => setShowResetConfirm(true)}
            >
              Reset My Setup
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-300 font-medium text-center">
                  ⚠️ Are you absolutely sure?
                </p>
                <p className="text-xs text-slate-400 text-center mt-1">
                  This cannot be undone. ALL data will be permanently deleted.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={resetLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white"
                  onClick={handleReset}
                  disabled={resetLoading}
                >
                  {resetLoading ? "Resetting..." : "Yes, Reset Everything"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}