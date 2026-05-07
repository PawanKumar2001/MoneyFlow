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
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
        <div className="mb-6">
          <img
            src="/favicon.png"
            alt="MoneyFlow"
            className="h-20 w-20 rounded-3xl mx-auto mb-6"
          />
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            MoneyFlow
          </h1>
          <p className="text-xl text-slate-400 max-w-md mx-auto mb-8">
            Know exactly where your money goes.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/signup"
              className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-16">
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
              description: "Understand your spending patterns with visual analytics",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl border border-white/10 bg-white/5 text-left"
            >
              <span className="text-3xl mb-3 block">{feature.icon}</span>
              <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer with Privacy Policy link */}
      <footer className="py-6 text-center border-t border-white/5">
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