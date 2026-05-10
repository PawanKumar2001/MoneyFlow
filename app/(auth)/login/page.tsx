"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { verifyCredentials, completeLogin } from "@/actions/auth";
import { sendOTP, verifyOTP } from "@/actions/otp";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

  const { register, handleSubmit, formState: { errors } } =
    useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    // Step 1 — verify credentials only, no sign in yet
    const result = await verifyCredentials(data);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Step 2 — send OTP
    try {
      await sendOTP(data.email, "LOGIN");
      setEmail(data.email);
      setStep("otp");
    } catch {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (code: string) => {
    setOtpLoading(true);
    setError(null);

    // Verify OTP
    const verification = await verifyOTP(email, code, "LOGIN");
    if (!verification.success) {
      setError(verification.error ?? "Invalid code.");
      setOtpLoading(false);
      return;
    }

    // Complete login after OTP verified
    await completeLogin(email);
    setOtpLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError(null);
    try {
      await sendOTP(email, "LOGIN");
    } catch {
      setError("Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2 pt-8">
          <img
            src="/favicon.png"
            alt="MoneyFlow"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl mx-auto mb-2"
          />
          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div
                key="form-header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h1 className="text-2xl font-bold text-white">
                  Welcome back
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Sign in to MoneyFlow
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="otp-header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h1 className="text-2xl font-bold text-white">
                  Check your email
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  We sent a 6-digit code to{" "}
                  <span className="text-white font-medium">{email}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        <CardContent className="px-4 sm:px-8 pb-6 sm:pb-8 pt-4">
          <AnimatePresence mode="wait">

            {/* Step 1 — Login Form */}
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Google Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 mb-6"
                  onClick={() =>
                    signIn("google", { callbackUrl: "/dashboard" })
                  }
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-slate-500">
                      or
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Email</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/50"
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
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Password</Label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <PasswordInput
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/50 pr-10"
                      {...register("password", { required: "Password is required" })}
                    />
                    {errors.password && (
                      <p className="text-xs text-red-400">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-400 text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white hover:bg-white/90 text-black transition-all"
                  >
                    {loading ? "Sending code..." : "Sign In"}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-white hover:text-white/80 font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </motion.div>
            )}

            {/* Step 2 — OTP */}
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <OTPInput
                  onComplete={handleOTPComplete}
                  disabled={otpLoading}
                />

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-400 text-center"
                  >
                    {error}
                  </motion.p>
                )}

                {otpLoading && (
                  <p className="text-sm text-slate-400 text-center">
                    Verifying...
                  </p>
                )}

                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {resendLoading ? "Sending..." : "Resend code"}
                  </button>
                  <button
                    onClick={() => {
                      setStep("form");
                      setError(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    ← Back to login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
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