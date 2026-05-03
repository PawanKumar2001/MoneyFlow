"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCredentials } from "@/actions/profile";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const newPassword = watch("newPassword");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const result = await updateCredentials(data);
    if (result?.error) {
      setError(result.error);
    } else {
      toast.success("Password updated!");
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center px-4 py-8 min-h-[80vh]">
      <div className="w-full max-w-lg">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 space-y-6">
          {/* Header */}
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg shadow-white/20 mb-4">
              <span className="text-xl">🔐</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Change Credentials</h2>
            <p className="text-sm text-slate-400 mt-1">Update your account password</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Current Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500 h-11"
                {...register("currentPassword", { required: "Current password is required" })}
              />
              {errors.currentPassword && (
                <p className="text-xs text-red-400">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">New Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500 h-11"
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
              <Label className="text-slate-300 text-sm">Confirm New Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-indigo-500 h-11"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (v) => v === newPassword || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-400">✓ Password updated successfully!</p>
              </div>
            )}

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
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}