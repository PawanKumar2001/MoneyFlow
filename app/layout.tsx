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
        <div aria-hidden="true" className="pointer-events-none moneyflow-bg">
          <div className="mf-glow mf-glow-green" />
          <div className="mf-glow mf-glow-yellow" />
          <div className="mf-glow mf-glow-white" />
          <div className="mf-orbit-line" />
          <div className="mf-orbit-line mf-orbit-line-secondary" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col">
          <div className="flex flex-1 flex-col">{children}</div>

          <footer className="shrink-0 border-t border-white/10 bg-black/55 py-4 backdrop-blur-md">
            <div className="flex flex-col items-center justify-center gap-1 text-center">
              <p className="text-xs font-medium text-slate-400">MoneyFlow v2.0.0</p>
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
