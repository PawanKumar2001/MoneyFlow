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
} from "lucide-react";

const APK_DOWNLOAD_LINK =
  "https://drive.google.com/file/d/1mu-lVahkatef1toFzieCtqvVNsS2raMJ/view?usp=sharing";

const features = [
  {
    icon: ReceiptText,
    title: "Track Expenses",
    description: "Log daily spending, organize categories, and see where your money goes.",
  },
  {
    icon: Repeat2,
    title: "Manage Subscriptions",
    description: "Track recurring payments and keep monthly commitments visible.",
  },
  {
    icon: BarChart3,
    title: "Monthly Summary",
    description: "Review income, expenses, remaining balance, and spending patterns.",
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
    <div className="relative z-10 flex min-h-[calc(100dvh-112px)] flex-col">
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-5xl">
          {/* Hero */}
          <section className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-[#080808]/95 shadow-2xl shadow-black/30 sm:h-20 sm:w-20">
              <img
                src="/favicon.png"
                alt="MoneyFlow"
                className="h-12 w-12 rounded-2xl sm:h-16 sm:w-16"
              />
            </div>

            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
              Personal finance tracker
            </p>

            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-7xl">
              MoneyFlow
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
              Know exactly where your money goes. Track expenses, manage income,
              and stay aware of monthly subscriptions in one clean dashboard.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-slate-200 sm:min-w-36"
              >
                Get Started
              </Link>

              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white sm:min-w-36"
              >
                Sign In
              </Link>
            </div>
          </section>

          {/* Features */}
          <section className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-[#080808]/90 p-4 text-left shadow-xl shadow-black/20 transition-colors hover:border-white/15 hover:bg-[#0d0d0d] sm:p-5"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
                    <Icon className="h-5 w-5" strokeWidth={2.3} />
                  </div>

                  <h3 className="mb-1 text-sm font-semibold text-white sm:text-base">
                    {feature.title}
                  </h3>

                  <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </section>

          {/* Android App Panel */}
          <section className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/95 p-4 text-left shadow-2xl shadow-black/30 sm:mt-5 sm:p-5 md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white sm:h-12 sm:w-12">
                  <Smartphone className="h-5 w-5" strokeWidth={2.4} />
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Android app
                  </p>
                  <h2 className="text-lg font-bold text-white sm:text-xl">
                    Use MoneyFlow on your phone
                  </h2>
                  <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-400 sm:text-sm">
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
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-slate-200"
                >
                  <Download className="h-4 w-4" />
                  Download APK
                </a>

                <Link
                  href="/mobile-app"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
                >
                  View app page
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-slate-400">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
              <p>
                Android may show an install warning because the APK is not from
                Play Store. Download only from this official MoneyFlow page.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
