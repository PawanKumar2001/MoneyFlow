"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/actions/auth";
import MonthSelector from "@/components/shared/MonthSelector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  ChevronDown,
  LogOut,
  Menu,
  ReceiptText,
  Repeat2,
  Settings,
  TrendingUp,
  UserCircle,
  WalletCards,
  X,
} from "lucide-react";

type NavbarProps = {
  username: string | null;
  email: string | null;
  image: string | null;
  incomeType: string;
};

const iconAccentMap: Record<string, string> = {
  Expenses: "text-emerald-300",
  Income: "text-sky-300",
  Subscriptions: "text-amber-300",
  Summary: "text-violet-300",
};

export default function Navbar({
  username,
  email,
  image,
  incomeType,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_TABS = [
    { label: "Expenses", href: "/dashboard", icon: ReceiptText },
    ...(incomeType === "FREELANCER"
      ? [{ label: "Income", href: "/dashboard/income", icon: TrendingUp }]
      : []),
    { label: "Subscriptions", href: "/dashboard/subscriptions", icon: Repeat2 },
    { label: "Summary", href: "/dashboard/summary", icon: BarChart3 },
  ];

  const initials = username?.[0]?.toUpperCase() ?? email?.[0]?.toUpperCase() ?? "U";

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutUser();
  };

  return (
    <>
      <motion.header
        initial={{ y: -76, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#030505]/88 shadow-[0_18px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
      >
        <div className="mx-auto w-full max-w-[1480px] px-4 md:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between gap-3 md:h-[76px]">
            {/* Brand */}
            <Link
              href="/dashboard"
              className="group flex min-w-0 items-center gap-3 rounded-2xl outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-emerald-300/30"
            >
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.16)]">
                <WalletCards className="h-5 w-5" strokeWidth={2.3} />
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]" />
              </span>

              <div className="hidden min-w-0 sm:block">
                <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.28em] text-slate-500">
                  MoneyFlow
                </p>
                <p className="mt-1.5 max-w-[180px] truncate text-sm font-semibold leading-none text-white">
                  {username ? `Welcome, ${username}` : "Welcome back"}
                </p>
              </div>
            </Link>

            {/* Mobile Month Selector */}
            <div className="flex flex-1 justify-center md:hidden">
              <MonthSelector />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-[#080b0b]/80 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] md:flex">
              {NAV_TABS.map((tab) => {
                const isActive = pathname === tab.href;
                const Icon = tab.icon;
                const iconAccent = iconAccentMap[tab.label] ?? "text-slate-300";

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`relative flex h-11 items-center gap-2.5 rounded-xl px-4 text-sm font-semibold transition-colors lg:px-5 ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 hover:bg-white/[0.045] hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="navbar-active-tab"
                        className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.08] shadow-[0_10px_32px_rgba(0,0,0,0.24)]"
                        transition={{
                          type: "spring",
                          bounce: 0.18,
                          duration: 0.45,
                        }}
                      />
                    )}

                    {isActive && (
                      <motion.span
                        layoutId="navbar-active-line"
                        className="absolute -bottom-1.5 left-3 right-3 h-px rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.85)]"
                      />
                    )}

                    <Icon
                      className={`relative z-10 h-4.5 w-4.5 ${isActive ? iconAccent : "text-slate-500"}`}
                      strokeWidth={2.2}
                    />
                    <span className="relative z-10">{tab.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center justify-end gap-2.5">
              <div className="hidden md:block">
                <MonthSelector />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-[#080b0b]/80 p-1 pr-2 text-slate-300 outline-none transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-300/25">
                    <Avatar className="h-9 w-9 border border-white/15 shadow-[0_0_22px_rgba(255,255,255,0.06)]">
                      <AvatarImage src={image ?? ""} />
                      <AvatarFallback className="bg-white text-xs font-semibold text-black">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <ChevronDown className="hidden h-3.5 w-3.5 text-slate-500 transition-transform group-data-[state=open]:rotate-180 sm:block" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="z-[60] w-64 rounded-2xl border border-white/10 bg-[#070909]/98 p-2 text-white shadow-2xl shadow-black/60 backdrop-blur-2xl"
                >
                  <div className="px-3 py-3">
                    <p className="truncate text-sm font-semibold text-white">
                      {username ?? "User"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {email}
                    </p>
                  </div>

                  <DropdownMenuSeparator className="my-1 bg-white/10" />

                  <DropdownMenuItem
                    className="cursor-pointer gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:bg-white/[0.07] focus:text-white"
                    onClick={() => router.push("/dashboard/profile")}
                  >
                    <UserCircle className="h-4 w-4 text-emerald-300" />
                    Profile Settings
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:bg-white/[0.07] focus:text-white"
                    onClick={() => router.push("/dashboard/credentials")}
                  >
                    <Settings className="h-4 w-4 text-amber-300" />
                    Change Password
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 bg-white/10" />

                  <DropdownMenuItem
                    className="cursor-pointer gap-2 rounded-xl px-3 py-2.5 text-sm text-red-300 outline-none focus:bg-red-500/10 focus:text-red-200"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    <LogOut className="h-4 w-4" />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#080b0b]/80 text-slate-400 transition-colors hover:bg-white/[0.07] hover:text-white md:hidden"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed left-0 right-0 top-[72px] z-40 border-b border-white/10 bg-[#030505]/98 px-4 py-4 shadow-2xl shadow-black/40 backdrop-blur-2xl md:hidden"
          >
            <nav className="mx-auto flex max-w-md flex-col gap-1.5">
              {NAV_TABS.map((tab) => {
                const isActive = pathname === tab.href;
                const Icon = tab.icon;
                const iconAccent = iconAccentMap[tab.label] ?? "text-slate-300";

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-white/15 bg-white/[0.08] text-white"
                        : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                        isActive
                          ? "border-white/15 bg-white/[0.08]"
                          : "border-white/10 bg-white/[0.04]"
                      }`}
                    >
                      <Icon
                        className={`h-4.5 w-4.5 ${isActive ? iconAccent : "text-slate-400"}`}
                        strokeWidth={2.2}
                      />
                    </span>
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
