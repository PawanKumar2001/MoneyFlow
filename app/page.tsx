import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Download,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

const APK_DOWNLOAD_LINK =
  "https://drive.google.com/file/d/1mu-lVahkatef1toFzieCtqvVNsS2raMJ/view?usp=sharing";

const features = [
  {
    icon: ReceiptText,
    title: "Track Expenses",
    description: "Log and categorize your daily spending effortlessly",
    iconClass: "border-white/10 bg-white/[0.06] text-white",
  },
  {
    icon: RefreshCcw,
    title: "Manage Subscriptions",
    description: "Never forget a recurring payment again",
    iconClass: "border-white/10 bg-white/[0.06] text-white",
  },
  {
    icon: BarChart3,
    title: "Smart Insights",
    description: "Understand spending patterns with visual analytics",
    iconClass: "border-white/10 bg-white/[0.06] text-white",
  },
];

const mobileHighlights = [
  "Fast expense entry",
  "Income and subscription tracking",
  "Mobile-friendly summaries",
];

export default async function Home() {
  const session = await auth();

  if (session) {
    if (!session.user.isSetupDone) redirect("/setup");
    redirect("/dashboard");
  }

  return (
    <div className="relative z-10 flex min-h-[calc(100vh-69px)] flex-col">
      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:py-16">
        <div className="mx-auto w-full max-w-4xl">
          {/* Logo + Title */}
          <img
            src="/favicon.png"
            alt="MoneyFlow"
            className="mx-auto mb-4 h-16 w-16 rounded-3xl sm:h-20 sm:w-20"
          />

          <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl md:text-7xl">
            MoneyFlow
          </h1>

          <p className="mx-auto mb-6 max-w-md text-base text-slate-400 sm:text-xl">
            Know exactly where your money goes.
          </p>

          {/* CTA Buttons */}
          <div className="mb-10 flex flex-wrap justify-center gap-3 sm:mb-14">
            <Link
              href="/signup"
              className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90 sm:px-8 sm:py-3 sm:text-base"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 sm:px-8 sm:py-3 sm:text-base"
            >
              Sign In
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left backdrop-blur-sm transition-colors hover:bg-white/[0.07] sm:p-6"
                >
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${feature.iconClass}`}
                  >
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
          </div>

          {/* Android App Panel */}
          <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left backdrop-blur-sm sm:mt-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white text-black shadow-lg shadow-white/10">
                  <Smartphone className="h-5 w-5" strokeWidth={2.4} />
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
                    Android app
                  </p>
                  <h2 className="text-lg font-bold text-white sm:text-xl">
                    MoneyFlow on your phone
                  </h2>
                  <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-400 sm:text-sm">
                    Download the Android companion app for quick expense entry,
                    income tracking, subscriptions, and monthly summaries.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {mobileHighlights.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-slate-300"
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  <Download className="h-4 w-4" />
                  Download APK
                </a>

                <Link
                  href="/mobile-app"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  View app page
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-relaxed text-slate-400">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
              <p>
                Android may show an install warning because the APK is not from
                Play Store. Download only from this official MoneyFlow page.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer — always visible */}
      <footer className="shrink-0 border-t border-white/5 py-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} MoneyFlow</span>
          <Link href="/privacy" className="transition-colors hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-white">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
