"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, AtSign, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setUsername } from "@/actions/auth";

type FormData = {
  username: string;
};

export default function SetupUsernamePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await setUsername(data.username.trim());

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push("/setup");
    } catch (err) {
      console.error("Failed to set username:", err);
      setError("Something went wrong while setting your username. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative z-10 flex min-h-[calc(100dvh-73px)] items-center justify-center px-4 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080808]/95 p-5 shadow-2xl shadow-black/50 sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.13),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.10),transparent_38%)]" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/35 to-transparent" />

          <div className="relative space-y-5">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.08, type: "spring", stiffness: 220 }}
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_34px_rgba(52,211,153,0.16)]"
              >
                <UserRound className="h-6 w-6" strokeWidth={2.3} />
              </motion.div>

              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Account setup
              </p>

              <h1 className="text-xl font-bold text-white sm:text-2xl">
                Choose your username
              </h1>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
                This will personalize your dashboard and complete the account setup step.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-300">
                  Username
                </Label>

                <div className="relative">
                  <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-300/80" />
                  <Input
                    placeholder="e.g. johndoe"
                    autoComplete="username"
                    className="h-11 rounded-xl border-white/10 bg-black/45 pl-9 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300/40 focus-visible:ring-0"
                    {...register("username", {
                      required: "Username is required",
                      minLength: { value: 3, message: "At least 3 characters" },
                      maxLength: { value: 20, message: "Max 20 characters" },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message: "Only letters, numbers and underscores",
                      },
                    })}
                  />
                </div>

                {errors.username ? (
                  <p className="text-xs text-red-300">
                    {errors.username.message}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Use 3–20 characters. Letters, numbers, and underscores only.
                  </p>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                  <p className="text-xs leading-relaxed text-red-300">{error}</p>
                </motion.div>
              )}

              <Button type="submit" disabled={loading} className="h-11 w-full gap-2 rounded-xl">
                {loading ? "Saving..." : "Continue"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
