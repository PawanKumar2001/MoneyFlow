import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MoneyFlow",
    template: "%s | MoneyFlow",
  },
  description: "Know exactly where your money goes.",
  verification: {
    google: "MFsbZPPJwxZjnjL0ePj7Ed5AgsBsLteK5mFtHvlBOW0",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body
        className="min-h-screen overflow-x-hidden bg-black text-white antialiased"
        suppressHydrationWarning
      >
        {/* Global responsive background image */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black"
        >
          <div
            className="absolute inset-0 bg-[url('/backgrounds/moneyflow-bg.png')] bg-cover bg-[center_top] bg-no-repeat opacity-100 md:bg-center"
          />

          {/* Light overlays keep text readable without hiding the background */}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/45" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.10)_48%,rgba(0,0,0,0.45)_100%)]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col">
          <div className="flex flex-1 flex-col">{children}</div>

          <footer className="shrink-0 border-t border-white/5 bg-transparent py-4">
            <div className="flex flex-col items-center justify-center gap-1 text-center">
              <p className="text-xs font-medium text-slate-400">
                MoneyFlow v2.0.0
              </p>
              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} All rights reserved
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
