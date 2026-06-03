"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { registerUser } from "@/actions/auth";
import { sendOTP, verifyOTP } from "@/actions/otp";
import { signIn } from "next-auth/react";
import { AlertCircle, ArrowLeft, MailCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OTPInput from "@/components/shared/OTPInput";
import PasswordInput from "@/components/shared/PasswordInput";

type SignupFormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Step = "form" | "otp";

export default function SignupPage() {
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [formData, setFormData] = useState<SignupFormData | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>();

  const password = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    try {
      setLoading(true);
      setError(null);

      await sendOTP(data.email, "SIGNUP");
      setFormData(data);
      setStep("otp");
    } catch (error) {
      console.error("Failed to send signup OTP:", error);
      setError("Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (code: string) => {
    if (!formData) return;

    try {
      setOtpLoading(true);
      setError(null);

      const verification = await verifyOTP(formData.email, code, "SIGNUP");

      if (!verification.success) {
        setError(verification.error ?? "Invalid code.");
        return;
      }

      const result = await registerUser(formData);

      if (result?.error) {
        setError(result.error);
      }
    } catch (error) {
      console.error("Failed to complete signup:", error);
      setError("Something went wrong while creating your account.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (!formData) return;

    try {
      setResendLoading(true);
      setError(null);
      await sendOTP(formData.email, "SIGNUP");
    } catch (error) {
      console.error("Failed to resend signup OTP:", error);
      setError("Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="relative z-10 flex min-h-[calc(100dvh-140px)] items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/95 shadow-2xl shadow-black/50">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_34%)]" />

          <div className="relative px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white shadow-lg shadow-black/30">
                {step === "form" ? (
                  <UserPlus className="h-6 w-6" strokeWidth={2.2} />
                ) : (
                  <MailCheck className="h-6 w-6" strokeWidth={2.2} />
                )}
              </div>

              <AnimatePresence mode="wait">
                {step === "form" ? (
                  <motion.div
                    key="form-header"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    <h1 className="text-xl font-semibold text-white sm:text-2xl">
                      Create account
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                      Start tracking with MoneyFlow
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="otp-header"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    <h1 className="text-xl font-semibold text-white sm:text-2xl">
                      Verify your email
                    </h1>
                    <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-slate-400">
                      We sent a 6-digit code to{" "}
                      <span className="font-medium text-white">
                        {formData?.email}
                      </span>
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
                  transition={{ duration: 0.22 }}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    className="mb-5 w-full"
                    onClick={() => signIn("google", { callbackUrl: "/setup" })}
                  >
                    <GoogleIcon />
                    Continue with Google
                  </Button>

                  <div className="relative mb-5">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#080808] px-2 text-slate-500">or</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-300">Username</Label>
                      <Input
                        placeholder="johndoe"
                        className="h-10 border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                        {...register("username", {
                          required: "Username is required",
                        })}
                      />
                      {errors.username && (
                        <p className="text-xs text-red-400">
                          {errors.username.message}
                        </p>
                      )}
                    </div>

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
                      <Label className="text-xs text-slate-300">Password</Label>
                      <PasswordInput
                        placeholder="••••••••"
                        className="h-10 border-white/10 bg-white/[0.04] pr-10 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/40"
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message: "Minimum 8 characters required",
                          },
                        })}
                      />
                      {errors.password && (
                        <p className="text-xs text-red-400">
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
                        <p className="text-xs text-red-400">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    {error && <ErrorMessage message={error} />}

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Sending code..." : "Continue"}
                    </Button>
                  </form>

                  <p className="mt-6 text-center text-sm text-slate-400">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-medium text-white transition hover:text-white/80"
                    >
                      Sign in
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
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  <OTPInput onComplete={handleOTPComplete} disabled={otpLoading} />

                  {error && <ErrorMessage message={error} />}

                  {otpLoading && (
                    <p className="text-center text-sm text-slate-400">
                      Creating your account...
                    </p>
                  )}

                  <div className="flex flex-col items-center gap-3">
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
                      className="inline-flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-300"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to signup
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
      <p className="text-xs leading-relaxed text-red-200">{message}</p>
    </motion.div>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
