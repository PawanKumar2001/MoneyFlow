"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { resetPassword, validateResetToken } from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/shared/PasswordInput";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

type FormData = {
  password: string;
  confirmPassword: string;
};

type Step = "loading" | "form" | "success" | "invalid";

type HeaderTone = "blue" | "green" | "red" | "amber";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [step, setStep] = useState<Step>("loading");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const password = watch("password");

  useEffect(() => {
    let mounted = true;

    if (!token) {
      setTokenError("Invalid reset link.");
      setStep("invalid");
      return;
    }

    const validate = async () => {
      try {
        const result = await validateResetToken(token);

        if (!mounted) return;

        if (!result.valid) {
          setTokenError(result.error ?? "Invalid reset link.");
          setStep("invalid");
          return;
        }

        setStep("form");
      } catch (error) {
        console.error("Failed to validate reset token:", error);

        if (!mounted) return;

        setTokenError("Could not verify this reset link. Please request a new one.");
        setStep("invalid");
      }
    };

    validate();

    return () => {
      mounted = false;
    };
  }, [token]);

  const onSubmit = async (data: FormData) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const result = await resetPassword(token, data.password);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setStep("success");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      console.error("Failed to reset password:", error);
      setError("Something went wrong while resetting your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/95 shadow-2xl shadow-black/50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_32%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
          <div className="mb-5 text-center">
            <AnimatePresence mode="wait">
              {step === "loading" && (
                <HeaderContent
                  key="loading-header"
                  tone="blue"
                  icon={<LoaderCircle className="h-6 w-6 animate-spin" />}
                  title="Verifying link"
                  description="Checking whether your password reset link is still valid."
                />
              )}

              {step === "form" && (
                <HeaderContent
                  key="form-header"
                  tone="green"
                  icon={<KeyRound className="h-6 w-6" />}
                  title="Reset password"
                  description="Enter a new password for your MoneyFlow account."
                />
              )}

              {step === "success" && (
                <HeaderContent
                  key="success-header"
                  tone="green"
                  icon={<Check className="h-6 w-6" />}
                  title="Password reset"
                  description="Your password was updated. Redirecting you to login."
                />
              )}

              {step === "invalid" && (
                <HeaderContent
                  key="invalid-header"
                  tone="red"
                  icon={<CircleAlert className="h-6 w-6" />}
                  title="Invalid link"
                  description="This reset link is invalid, expired, or already used."
                />
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {step === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-3 py-5"
              >
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400/15 border-t-sky-300" />
                <p className="text-sm text-slate-400">Please wait...</p>
              </motion.div>
            )}

            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.22 }}
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">New Password</Label>
                    <PasswordInput
                      placeholder="••••••••"
                      className="h-10 border-white/10 bg-white/[0.04] pr-10 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Minimum 8 characters",
                        },
                      })}
                    />
                    {errors.password && (
                      <p className="text-xs text-red-300">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">
                      Confirm Password
                    </Label>
                    <PasswordInput
                      placeholder="••••••••"
                      className="h-10 border-white/10 bg-white/[0.04] pr-10 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-300">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 rounded-xl border border-sky-400/15 bg-sky-400/10 p-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                    <p className="text-xs leading-relaxed text-slate-300">
                      Use at least 8 characters. After resetting, you can sign in
                      with your new password immediately.
                    </p>
                  </div>

                  {error && <ErrorBox message={error} />}

                  <Button type="submit" disabled={loading} className="h-10 w-full">
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 py-2 text-center"
              >
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <p className="text-sm leading-relaxed text-slate-300">
                    Your password has been successfully reset. You will be
                    redirected to login in a moment.
                  </p>
                </div>

                <Button asChild variant="secondary" className="h-10 w-full">
                  <Link href="/login">Go to login</Link>
                </Button>
              </motion.div>
            )}

            {step === "invalid" && (
              <motion.div
                key="invalid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 py-2 text-center"
              >
                <ErrorBox message={tokenError} />

                <Button asChild variant="secondary" className="h-10 w-full">
                  <Link href="/forgot-password" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Request a new reset link
                  </Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function HeaderContent({
  icon,
  title,
  description,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: HeaderTone;
}) {
  const toneClass = {
    blue:
      "border-sky-400/20 bg-sky-400/10 text-sky-300 shadow-[0_0_28px_rgba(56,189,248,0.12)]",
    green:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_28px_rgba(52,211,153,0.12)]",
    amber:
      "border-amber-400/20 bg-amber-400/10 text-amber-300 shadow-[0_0_28px_rgba(251,191,36,0.12)]",
    red:
      "border-red-400/20 bg-red-400/10 text-red-300 shadow-[0_0_28px_rgba(248,113,113,0.12)]",
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="mx-auto max-w-sm"
    >
      <div
        className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border ${toneClass}`}
      >
        {icon}
      </div>
      <h1 className="text-xl font-semibold text-white sm:text-2xl">{title}</h1>
      <p className="mt-1 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </motion.div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-red-500/20 bg-red-500/10 p-3"
    >
      <p className="text-center text-xs leading-relaxed text-red-300">{message}</p>
    </motion.div>
  );
}
