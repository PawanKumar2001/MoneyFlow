"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from "lucide-react";

type FormData = {
  email: string;
};

type Step = "form" | "sent";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await requestPasswordReset(data.email);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setSentEmail(data.email);
      setStep("sent");
    } catch (err) {
      console.error("Failed to request password reset:", err);
      setError("Something went wrong while sending the reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!sentEmail) return;
    await onSubmit({ email: sentEmail });
  };

  return (
    <div className="relative z-10 flex min-h-[calc(100dvh-69px)] items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/95 shadow-2xl shadow-black/40">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_36%)]" />

          <div className="relative px-5 pb-6 pt-6 sm:px-7 sm:pb-7 sm:pt-7">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white shadow-lg shadow-black/20">
                {step === "form" ? (
                  <ShieldCheck className="h-6 w-6" strokeWidth={2.2} />
                ) : (
                  <CheckCircle2 className="h-6 w-6" strokeWidth={2.2} />
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
                      Forgot password?
                    </h1>
                    <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-slate-400">
                      Enter your email and we&apos;ll send you a secure reset link.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="sent-header"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    <h1 className="text-xl font-semibold text-white sm:text-2xl">
                      Check your email
                    </h1>
                    <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-400">
                      We sent a reset link to{" "}
                      <span className="font-medium text-white">{sentEmail}</span>
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
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-300">
                        Email
                      </Label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="h-10 border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-white/40"
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
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 p-3"
                      >
                        <p className="text-center text-xs leading-relaxed text-red-300">
                          {error}
                        </p>
                      </motion.div>
                    )}

                    <Button type="submit" disabled={loading} className="h-10 w-full">
                      {loading ? "Sending..." : "Send reset link"}
                    </Button>
                  </form>

                  <Link
                    href="/login"
                    className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                </motion.div>
              )}

              {step === "sent" && (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-5 text-center"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
                    <Mail className="h-7 w-7" strokeWidth={2.2} />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left">
                    <p className="text-sm leading-relaxed text-slate-300">
                      Click the link in the email to reset your password. The
                      link expires in <span className="font-medium text-white">1 hour</span>.
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      Don&apos;t see it? Check your spam folder or resend the email.
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 p-3"
                    >
                      <p className="text-center text-xs leading-relaxed text-red-300">
                        {error}
                      </p>
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={loading}
                      onClick={handleResend}
                      className="h-10 w-full"
                    >
                      {loading ? "Sending..." : "Resend email"}
                    </Button>

                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to login
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
