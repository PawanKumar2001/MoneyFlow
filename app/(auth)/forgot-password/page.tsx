"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";

type FormData = {
  email: string;
};

type Step = "form" | "sent";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState("");

  const { register, handleSubmit, formState: { errors } } =
    useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const result = await requestPasswordReset(data.email);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSentEmail(data.email);
    setStep("sent");
    setLoading(false);
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
                  Forgot password?
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Enter your email and we'll send you a reset link
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="sent-header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h1 className="text-2xl font-bold text-white">
                  Check your email
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  We sent a reset link to{" "}
                  <span className="text-white font-medium">{sentEmail}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        <CardContent className="px-4 sm:px-8 pb-6 sm:pb-8 pt-4">
          <AnimatePresence mode="wait">
            {/* Step 1 — Email Form */}
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Email</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-0 focus:border-white/50"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email",
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                    >
                      <p className="text-sm text-red-400 text-center">
                        {error}
                      </p>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white hover:bg-white/90 text-black transition-all"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mt-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </motion.div>
            )}

            {/* Step 2 — Email Sent */}
            {step === "sent" && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 border border-white/20 mx-auto"
                >
                  <Mail className="h-8 w-8 text-white" />
                </motion.div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-400">
                    Click the link in the email to reset your password.
                    The link expires in{" "}
                    <span className="text-white font-medium">1 hour</span>.
                  </p>
                  <p className="text-xs text-slate-500">
                    Don't see it? Check your spam folder.
                  </p>
                </div>

                {/* Resend */}
                <div className="space-y-3">
                  <button
                    onClick={() => onSubmit({ email: sentEmail })}
                    disabled={loading}
                    className="text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Resend email"}
                  </button>
                </div>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}