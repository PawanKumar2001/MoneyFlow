import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Download,
  FileDown,
  LockKeyhole,
  ReceiptText,
  Repeat2,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from "lucide-react";

const APK_DOWNLOAD_URL =
  "https://drive.google.com/file/d/1mu-lVahkatef1toFzieCtqvVNsS2raMJ/view?usp=sharing";

const screenshots = [
  {
    title: "Expenses",
    description: "Track daily spending with category filters and quick actions.",
    image: "/mobile-screenshots/expenses.jpg",
  },
  {
    title: "Income",
    description: "Log earnings and review monthly income from your phone.",
    image: "/mobile-screenshots/income.jpg",
  },
  {
    title: "Subscriptions",
    description: "Keep recurring payments organized by renewal date.",
    image: "/mobile-screenshots/subscriptions.jpg",
  },
  {
    title: "Summary",
    description: "View category breakdowns, savings, and monthly insights.",
    image: "/mobile-screenshots/summary.jpg",
  },
];

const features = [
  {
    icon: ReceiptText,
    title: "Fast expense tracking",
    description: "Add, search, and review expenses without opening the web dashboard.",
  },
  {
    icon: WalletCards,
    title: "Income overview",
    description: "Track earned, spent, remaining, and saved amounts in a compact layout.",
  },
  {
    icon: Repeat2,
    title: "Subscription manager",
    description: "Manage recurring payments and know what renews every month.",
  },
  {
    icon: BarChart3,
    title: "Monthly insights",
    description: "Review charts, category breakdowns, and savings percentage.",
  },
];

const installSteps = [
  {
    title: "Download the APK",
    description: "Tap the download button and save the MoneyFlow Android file.",
  },
  {
    title: "Allow installation",
    description: "Allow installs from your browser or file manager when Android asks.",
  },
  {
    title: "Install MoneyFlow",
    description: "Open the downloaded APK and complete the installation.",
  },
  {
    title: "Start tracking",
    description: "Open the app, sign in, and manage your money on the go.",
  },
];

const trustNotes = [
  {
    icon: BadgeCheck,
    title: "Official MoneyFlow build",
    text: "The APK download is linked from the official MoneyFlow web page.",
  },
  {
    icon: LockKeyhole,
    title: "Same account experience",
    text: "Use MoneyFlow across web and mobile with the same product flow.",
  },
  {
    icon: Smartphone,
    title: "Android focused",
    text: "Built as a lightweight companion app for quick daily tracking.",
  },
];

export const metadata = {
  title: "MoneyFlow Android App",
  description: "Download the MoneyFlow Android app and track your finances on mobile.",
};

export default function MobileAppPage() {
  return (
    <main className="relative z-10 min-h-[calc(100dvh-112px)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#080808]/95 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-white/20 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to MoneyFlow
        </Link>

        {/* Hero */}
        <section className="grid items-center gap-8 rounded-[2rem] border border-white/10 bg-[#070707]/95 p-5 shadow-2xl shadow-black/30 sm:p-7 lg:grid-cols-[1fr_0.82fr] lg:gap-10 lg:p-9">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300">
              <Smartphone className="h-3.5 w-3.5" />
              Android app available
            </div>

            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Track MoneyFlow from your phone.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
              Use the MoneyFlow Android app to add expenses faster, review monthly income,
              manage subscriptions, and check your summary without opening the web dashboard.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={APK_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                <Download className="h-4 w-4" />
                Download APK
              </a>

              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Open Web App
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 flex max-w-2xl items-start gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 text-left">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" />
              <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
                Android may show a security warning because this APK is installed outside
                the Play Store. Only download it from this official MoneyFlow page.
              </p>
            </div>
          </div>

          {/* Hero phone preview */}
          <div className="mx-auto w-full max-w-[330px] lg:max-w-[380px]">
            <div className="relative rounded-[2.4rem] border border-white/10 bg-[#0c0c0c] p-3 shadow-2xl shadow-black/50">
              <div className="pointer-events-none absolute inset-x-12 top-2 z-10 h-5 rounded-b-2xl bg-black" />
              <div className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-black">
                <img
                  src="/mobile-screenshots/login.jpg"
                  alt="MoneyFlow Android login screen"
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Screenshot gallery */}
        <section className="mt-12 sm:mt-16">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                App Screens
              </p>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Designed for quick mobile tracking
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-slate-400">
              The Android app keeps the same dark MoneyFlow identity while using a
              phone-first layout for faster daily use.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {screenshots.map((screen) => (
              <article
                key={screen.title}
                className="group rounded-3xl border border-white/10 bg-[#080808]/95 p-3 shadow-xl shadow-black/20 transition hover:border-white/20"
              >
                <div className="overflow-hidden rounded-[1.65rem] border border-white/10 bg-black">
                  <img
                    src={screen.image}
                    alt={`MoneyFlow Android ${screen.title} screen`}
                    className="aspect-[9/18.3] w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-white">{screen.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {screen.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mt-12 sm:mt-16">
          <div className="mb-6 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Features
            </p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Everything important, now on Android
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-[#080808]/95 p-5 shadow-xl shadow-black/20"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Install guide */}
        <section className="mt-12 grid gap-5 rounded-3xl border border-white/10 bg-[#070707]/95 p-5 shadow-2xl shadow-black/25 sm:mt-16 sm:p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white text-black">
              <FileDown className="h-5 w-5" strokeWidth={2.3} />
            </div>
            <h2 className="text-2xl font-bold text-white">How to install</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Since this APK is shared directly, Android may ask for an extra permission
              before installation.
            </p>

            <a
              href={APK_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Download APK
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {installSteps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-black/45 p-4"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white text-xs font-bold text-black">
                  {index + 1}
                </div>
                <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust notes */}
        <section className="mt-5 grid gap-3 pb-4 sm:grid-cols-3">
          {trustNotes.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-[#080808]/95 p-4"
              >
                <Icon className="mb-3 h-5 w-5 text-slate-300" />
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {item.text}
                </p>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
