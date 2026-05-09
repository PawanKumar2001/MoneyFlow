"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { validateResetToken, resetPassword } from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";

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

  const { register, handleSubmit, watch, formState: { errors } } =
    useForm<FormData>();
  const password = watch("password");

  useEffect(() => {
    if (!token) {
      setTokenError("Invalid reset link.");
      setStep("invalid");
      return;
    }

    const validate = async () => {
      const result = await validateResetToken(token);
      if (!result.valid) {
        setTokenError(result.error ?? "Invalid reset link.");
        setStep("invalid");
      } else {
        setStep("form");
      }
    };

    validate();
  }, [token]);

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    setLoading(true);
    setError(null);

    const result = await resetPassword(token, data.password);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setStep("success");
    setLoading(false);

    // Redirect to login after 3 seconds
    setTimeout(() => router.push("/login"), 3000);
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
            {step === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-bold text-white">Verifying link...</h1>
              </motion.div>
            )}
            {step === "form" && (
              <motion.div key="form-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-bold text-white">Reset password</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Enter your new password below
                </p>
              </motion.div>
            )}
            {step === "success" && (
              <motion.div key="success-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-bold text-white">Password reset!</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Redirecting you to login...
                </p>
              </motion.div>
            )}
            {step === "invalid" && (
              <motion.div key="invalid-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-bold text-white">Invalid link</h1>
                <p className="text-sm text-slate-400 mt-1">
                  This reset link is invalid or expired
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        <CardContent className="px-4 sm:px-8 pb-6 sm:pb-8 pt-4">
          <AnimatePresence mode="wait">

            {/* Loading */}
            {step === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center py-8"
              >
                <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              </motion.div>
            )}

            {/* Form */}
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/50"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Minimum 8 characters",
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
                    <Label className="text-slate-300">Confirm Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/50"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (v) =>
                          v === password || "Passwords do not match",
                      })}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-400">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                    >
                      <p className="text-sm text-red-400 text-center">{error}</p>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white hover:bg-white/90 text-black transition-all"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Success */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 border border-white/20 mx-auto"
                >
                  <CheckCircle className="h-8 w-8 text-white" />
                </motion.div>
                <p className="text-sm text-slate-400">
                  Your password has been successfully reset. You'll be redirected to login in a moment.
                </p>
                <Link
                  href="/login"
                  className="text-sm text-white hover:text-white/80 transition-colors"
                >
                  Go to login →
                </Link>
              </motion.div>
            )}

            {/* Invalid */}
            {step === "invalid" && (
              <motion.div
                key="invalid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-4 py-4"
              >
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{tokenError}</p>
                </div>
                <Link
                  href="/forgot-password"
                  className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Request a new reset link
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}