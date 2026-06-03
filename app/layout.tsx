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
        {/* Background */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
          <div className="absolute left-[-12rem] top-24 h-[28rem] w-[28rem] rounded-full bg-white/[0.035] blur-3xl" />
          <div className="absolute right-[-10rem] top-1/3 h-[26rem] w-[26rem] rounded-full bg-white/[0.025] blur-3xl" />
          <div className="absolute bottom-[-12rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-white/[0.02] blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.07),transparent_34%),linear-gradient(to_bottom,rgba(0,0,0,0.15),#000_88%)]" />
          <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:52px_52px]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col">
          {/* Content */}
          <div className="flex flex-1 flex-col">{children}</div>

          {/* Footer */}
          <footer className="shrink-0 border-t border-white/5 bg-black/40 py-4 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center gap-1 text-center">
              <p className="text-xs text-slate-400">MoneyFlow v2.0.0</p>
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
