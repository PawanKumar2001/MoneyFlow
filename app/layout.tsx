import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MatrixCanvas from "./Matrixcanvas";

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
        className="min-h-screen flex flex-col bg-black"
        suppressHydrationWarning
      >

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 py-4 bg-transparent">
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <p className="text-xs text-slate-400">MoneyFlow v1.0.0</p>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </footer>
        
        {/* Matrix Animation */}
        <MatrixCanvas />
      </body>
    </html>
  );
}