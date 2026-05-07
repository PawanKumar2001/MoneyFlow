import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    if (!session.user.isSetupDone) redirect("/setup");
    redirect("/dashboard");
  }

  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-10 sm:py-16">
        <div className="w-full max-w-3xl mx-auto">
          {/* Logo + Title */}
          <img
            src="/favicon.png"
            alt="MoneyFlow"
            className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl mx-auto mb-4"
          />
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-3">
            MoneyFlow
          </h1>
          <p className="text-base sm:text-xl text-slate-400 max-w-md mx-auto mb-6">
            Know exactly where your money goes.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-3 justify-center flex-wrap mb-12 sm:mb-16">
            <Link
              href="/signup"
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all text-sm sm:text-base"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 text-sm sm:text-base"
            >
              Sign In
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: "💸",
                title: "Track Expenses",
                description: "Log and categorize your daily spending effortlessly",
              },
              {
                icon: "🔄",
                title: "Manage Subscriptions",
                description: "Never forget a recurring payment again",
              },
              {
                icon: "📊",
                title: "Smart Insights",
                description: "Understand spending patterns with visual analytics",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-4 sm:p-6 rounded-2xl border border-white/10 bg-white/5 text-left"
              >
                <span className="text-2xl sm:text-3xl mb-2 block">{feature.icon}</span>
                <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer — always visible */}
      <footer className="py-4 text-center border-t border-white/5 shrink-0">
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} MoneyFlow</span>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}