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
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body
        className="min-h-screen flex flex-col bg-slate-950"
        suppressHydrationWarning
      >
       
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 py-4 bg-transparent">
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <p className="text-xs text-slate-400">
              MoneyFlow v0.0.1
            </p>

            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </footer>
         <div className="fixed inset-0 bg-gradient-to-br from-indigo-950/30 via-slate-950 to-emerald-950/20 pointer-events-none" />
        <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-blob pointer-events-none" />
        <div className="fixed top-[50%] right-[-10%] w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
        <div className="fixed bottom-[-10%] left-[30%] w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-blob animation-delay-4000 pointer-events-none" />

        {/* Floating particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-indigo-400/20 animate-float"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 10 + 8}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </body>
    </html>
  );
}