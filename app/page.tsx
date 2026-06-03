import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Download,
  ReceiptText,
  Repeat2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
} from "lucide-react";

const APK_DOWNLOAD_LINK =
  "https://drive.google.com/file/d/1mu-lVahkatef1toFzieCtqvVNsS2raMJ/view?usp=sharing";

const features = [
  {
    icon: ReceiptText,
    title: "Track Expenses",
    description: "Log daily spending, organize categories, and see where your money goes.",
    iconClass:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.12)]",
  },
  {
    icon: Repeat2,
    title: "Manage Subscriptions",
    description: "Track recurring payments and keep monthly commitments visible.",
    iconClass:
      "border-amber-400/20 bg-amber-400/10 text-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.12)]",
  },
  {
    icon: BarChart3,
    title: "Monthly Summary",
    description: "Review income, expenses, remaining balance, and spending patterns.",
    iconClass:
      "border-sky-400/20 bg-sky-400/10 text-sky-300 shadow-[0_0_30px_rgba(56,189,248,0.12)]",
  },
];

const mobileHighlights = [
  "Fast expense entry",
  "Income tracking",
  "Subscriptions",
  "Monthly summaries",
];

export default async function Home() {
  const session = await auth();

  if (session) {
    if (!session.user.isSetupDone) redirect("/setup");
    redirect("/dashboard");
  }

  return (
    <main className="relative z-10 flex min-h-[calc(100dvh-73px)] items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <div className="mx-auto w-full max-w-6xl">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#070707]/95 p-5 text-center shadow-2xl shadow-black/40 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(52,211,153,0.12),transparent_30%),radial-gradient(circle_at_80%_25%,rgba(251,191,36,0.10),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />

          <div className="relative mx-auto max-w-4xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_38px_rgba(52,211,153,0.16)] sm:h-20 sm:w-20">
              <img
                src="/favicon.png"
                alt="MoneyFlow"
                className="h-12 w-12 rounded-2xl sm:h-16 sm:w-16"
              />
            </div>

            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
              Personal finance tracker
            </div>

            <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
              MoneyFlow
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
              Know exactly where your money goes. Track expenses, manage income,
              and stay aware of monthly subscriptions in one clean dashboard.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-black transition hover:bg-slate-200 sm:min-w-40"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-7 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white sm:min-w-40"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/95 p-5 text-left shadow-xl shadow-black/25 transition-all hover:border-white/15 hover:bg-[#0d0d0d]"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_34%)]" />
                <div className="relative">
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border ${feature.iconClass}`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.3} />
                  </div>

                  <h3 className="mb-1 text-base font-semibold text-white">
                    {feature.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Android App Panel */}
        <section className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/95 p-5 text-left shadow-2xl shadow-black/30 sm:p-6">
          <div className="pointer-events-none absolute inset-0" />
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300 shadow-[0_0_30px_rgba(56,189,248,0.12)]">
                <Smartphone className="h-5 w-5" strokeWidth={2.4} />
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Android app
                </p>
                <h2 className="text-xl font-bold text-white">
                  Use MoneyFlow on your phone
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                  Download the Android companion app for faster expense entry,
                  income tracking, subscription management, and mobile-friendly
                  summaries.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {mobileHighlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-[11px] font-medium text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[360px]">
              <a
                href={APK_DOWNLOAD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-slate-200"
              >
                <Download className="h-4 w-4" />
                Download APK
              </a>

              <Link
                href="/mobile-app"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
              >
                View app page
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs leading-relaxed text-slate-300">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p>
              Android may show an install warning because the APK is not from
              Play Store. Download only from this official MoneyFlow page.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
