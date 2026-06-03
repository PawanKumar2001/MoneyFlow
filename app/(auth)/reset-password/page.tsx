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
} from "lucide-react";

type FormData = {
  password: string;
  confirmPassword: string;
};

type Step = "loading" | "form" | "success" | "invalid";

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex min-h-[calc(100dvh-140px)] w-full items-center justify-center px-4 py-8"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/95 shadow-2xl shadow-black/40">
        <div className="relative px-5 pt-6 text-center sm:px-7 sm:pt-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_35%)]" />

          <div className="relative">
            <img
              src="/favicon.png"
              alt="MoneyFlow"
              className="mx-auto mb-3 h-11 w-11 rounded-2xl border border-white/10"
            />

            <AnimatePresence mode="wait">
              {step === "loading" && (
                <HeaderContent
                  key="loading-header"
                  icon={<LoaderCircle className="h-5 w-5 animate-spin" />}
                  title="Verifying link"
                  description="Checking whether your password reset link is still valid."
                />
              )}

              {step === "form" && (
                <HeaderContent
                  key="form-header"
                  icon={<KeyRound className="h-5 w-5" />}
                  title="Reset password"
                  description="Enter a new password for your MoneyFlow account."
                />
              )}

              {step === "success" && (
                <HeaderContent
                  key="success-header"
                  icon={<Check className="h-5 w-5" />}
                  title="Password reset"
                  description="Your password was updated. Redirecting you to login."
                />
              )}

              {step === "invalid" && (
                <HeaderContent
                  key="invalid-header"
                  icon={<CircleAlert className="h-5 w-5" />}
                  title="Invalid link"
                  description="This reset link is invalid, expired, or already used."
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="px-5 pb-6 pt-5 sm:px-7 sm:pb-7">
          <AnimatePresence mode="wait">
            {step === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-3 py-8"
              >
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-white" />
                <p className="text-sm text-slate-400">Please wait...</p>
              </motion.div>
            )}

            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">New Password</Label>
                    <PasswordInput
                      placeholder="••••••••"
                      className="h-10 border-white/10 bg-white/[0.04] pr-10 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/30"
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
                      className="h-10 border-white/10 bg-white/[0.04] pr-10 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/30"
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

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-xs leading-relaxed text-slate-400">
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
                className="space-y-5 py-3 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white text-black shadow-lg shadow-white/10">
                  <Check className="h-7 w-7" strokeWidth={2.4} />
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm leading-relaxed text-slate-400">
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
                className="space-y-5 py-3 text-center"
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
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="mx-auto max-w-sm"
    >
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
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
      <p className="text-center text-sm text-red-300">{message}</p>
    </motion.div>
  );
}
