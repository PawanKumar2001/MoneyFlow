"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

import { verifyCredentials, completeLogin } from "@/actions/auth";
import { sendOTP, verifyOTP } from "@/actions/otp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OTPInput from "@/components/shared/OTPInput";
import PasswordInput from "@/components/shared/PasswordInput";

type LoginFormData = {
  email: string;
  password: string;
};

type Step = "form" | "otp";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await verifyCredentials(data);

      if (result?.error) {
        setError(result.error);
        return;
      }

      await sendOTP(data.email, "LOGIN");
      setEmail(data.email);
      setStep("otp");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Something went wrong while signing in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (code: string) => {
    try {
      setOtpLoading(true);
      setError(null);

      const verification = await verifyOTP(email, code, "LOGIN");

      if (!verification.success) {
        setError(verification.error ?? "Invalid verification code.");
        return;
      }

      await completeLogin(email);
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError("Could not verify the code. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      setError(null);
      await sendOTP(email, "LOGIN");
    } catch (err) {
      console.error("Failed to resend OTP:", err);
      setError("Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/95 shadow-2xl shadow-black/50">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.08),transparent_32%)]" />

        <div className="relative px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6">
          <div className="mb-5 text-center">
            <AnimatePresence mode="wait">
              {step === "form" ? (
                <motion.div
                  key="form-icon"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_28px_rgba(52,211,153,0.14)] sm:h-12 sm:w-12"
                >
                  <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.3} />
                </motion.div>
              ) : (
                <motion.div
                  key="otp-icon"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300 shadow-[0_0_28px_rgba(251,191,36,0.14)] sm:h-12 sm:w-12"
                >
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.3} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {step === "form" ? (
                <motion.div
                  key="form-header"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  <h1 className="text-xl font-bold text-white sm:text-2xl">
                    Welcome back
                  </h1>
                  <p className="mt-1 text-sm text-slate-400">
                    Sign in to continue tracking your money.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-header"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  <h1 className="text-xl font-bold text-white sm:text-2xl">
                    Check your email
                  </h1>
                  <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-slate-400">
                    We sent a 6-digit code to{" "}
                    <span className="font-medium text-white">{email}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.25 }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  className="mb-4 h-10 w-full rounded-xl"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#080808] px-2 text-slate-500">or</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Email</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="h-10 border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                      {...register("email", {
                        required: "Email is required",
                      })}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-xs text-slate-300">Password</Label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-slate-500 transition-colors hover:text-white"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <PasswordInput
                      placeholder="••••••••"
                      className="h-10 border-white/10 bg-white/[0.04] pr-10 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                      {...register("password", {
                        required: "Password is required",
                      })}
                    />

                    {errors.password && (
                      <p className="text-xs text-red-400">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {error && <ErrorMessage message={error} />}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-10 w-full rounded-xl"
                  >
                    {loading ? "Sending code..." : "Sign In"}
                  </Button>
                </form>

                <p className="mt-5 text-center text-sm text-slate-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-white transition-colors hover:text-slate-300"
                  >
                    Sign up
                  </Link>
                </p>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <OTPInput onComplete={handleOTPComplete} disabled={otpLoading} />

                {error && <ErrorMessage message={error} />}

                {otpLoading && (
                  <p className="text-center text-sm text-slate-400">
                    Verifying...
                  </p>
                )}

                <div className="flex flex-col items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="text-sm text-slate-400 transition-colors hover:text-white disabled:opacity-50"
                  >
                    {resendLoading ? "Sending..." : "Resend code"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("form");
                      setError(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2"
    >
      <p className="text-center text-xs leading-relaxed text-red-300">{message}</p>
    </motion.div>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
