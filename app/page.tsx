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
  Sparkles,
  WalletCards,
} from "lucide-react";

const apkDownloadUrl =
  "https://drive.google.com/uc?export=download&id=1mu-lVahkatef1toFzieCtqvVNsS2raMJ";

const features = [
  {
    icon: ReceiptText,
    title: "Track Expenses",
    description: "Log and categorize your daily spending effortlessly",
    iconClass: "border-emerald-500/20 bg-emerald-500/15 text-emerald-400",
  },
  {
    icon: RefreshCcw,
    title: "Manage Subscriptions",
    description: "Never forget a recurring payment again",
    iconClass: "border-sky-500/20 bg-sky-500/15 text-sky-400",
  },
  {
    icon: BarChart3,
    title: "Smart Insights",
    description: "Understand spending patterns with visual analytics",
    iconClass: "border-violet-500/20 bg-violet-500/15 text-violet-400",
  },
];

const mobileFeatures = [
  {
    icon: WalletCards,
    title: "Quick entry",
    description: "Add expenses faster from your phone.",
  },
  {
    icon: RefreshCcw,
    title: "Subscriptions",
    description: "View recurring payments on the go.",
  },
  {
    icon: BarChart3,
    title: "Monthly summary",
    description: "Check earnings, spending, and savings.",
  },
];

const screenshotCards = [
  {
    title: "Expenses",
    subtitle: "Track daily spending",
    bars: ["w-2/3", "w-1/2", "w-5/6"],
  },
  {
    title: "Summary",
    subtitle: "Visual insights",
    bars: ["w-3/4", "w-2/5", "w-4/6"],
  },
  {
    title: "Income",
    subtitle: "Log monthly earnings",
    bars: ["w-1/2", "w-5/6", "w-3/5"],
  },
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
        <div className="mx-auto w-full max-w-5xl">
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
          <section className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] text-left backdrop-blur-sm sm:mt-5">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              {/* Details */}
              <div className="p-5 sm:p-7">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white text-black">
                    <Smartphone className="h-5 w-5" strokeWidth={2.4} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                      Android app
                    </p>
                    <h2 className="text-lg font-semibold text-white sm:text-xl">
                      MoneyFlow on your phone
                    </h2>
                  </div>
                </div>

                <p className="max-w-xl text-sm leading-relaxed text-slate-400">
                  Use MoneyFlow as a lightweight Android companion for faster
                  expense entry, monthly income tracking, subscriptions, and
                  mobile-friendly financial summaries.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {mobileFeatures.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-white/10 bg-black/30 p-3"
                      >
                        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white">
                          <Icon className="h-4 w-4" strokeWidth={2.2} />
                        </div>
                        <p className="text-sm font-medium text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={apkDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 sm:w-auto"
                  >
                    <Download className="h-4 w-4" />
                    Download APK
                  </a>

                  <Link
                    href="/mobile-app"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 sm:w-auto"
                  >
                    View app page
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-white/10 bg-black/30 p-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                  <p className="text-xs leading-relaxed text-slate-500">
                    Android may show an install warning because the APK is not
                    from Play Store. Download only from this official MoneyFlow
                    page.
                  </p>
                </div>
              </div>

              {/* Screenshot Preview Cards */}
              <div className="border-t border-white/10 bg-black/20 p-5 sm:p-7 lg:border-l lg:border-t-0">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      App preview
                    </p>
                    <p className="text-xs text-slate-500">
                      Screenshot cards can be replaced with real app screenshots.
                    </p>
                  </div>
                  <Sparkles className="h-4 w-4 text-slate-400" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {screenshotCards.map((card, index) => (
                    <div
                      key={card.title}
                      className={`rounded-[1.4rem] border border-white/10 bg-black/60 p-2 shadow-2xl shadow-black/30 ${
                        index === 1 ? "translate-y-3" : ""
                      }`}
                    >
                      <div className="aspect-[9/18.5] rounded-[1rem] border border-white/10 bg-gradient-to-b from-white/[0.09] to-white/[0.02] p-2">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="h-1.5 w-8 rounded-full bg-white/30" />
                          <div className="h-3 w-3 rounded-full border border-white/15" />
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.05] p-2">
                          <p className="text-[9px] font-semibold text-white">
                            {card.title}
                          </p>
                          <p className="mt-0.5 text-[7px] text-slate-500">
                            {card.subtitle}
                          </p>
                        </div>

                        <div className="mt-2 space-y-1.5">
                          {card.bars.map((bar, i) => (
                            <div
                              key={i}
                              className="rounded-lg border border-white/10 bg-white/[0.04] p-1.5"
                            >
                              <div className={`h-1.5 rounded-full bg-white/40 ${bar}`} />
                              <div className="mt-1 h-1 w-1/3 rounded-full bg-white/10" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
