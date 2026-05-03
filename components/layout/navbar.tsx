"use client";

import { motion } from "framer-motion";
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
  PlusCircle,
  RefreshCw,
  BarChart2,
  LogOut,
  Settings,
  User,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";

type NavbarProps = {
  username: string | null;
  email: string | null;
  image: string | null;
  incomeType: string;
};



export default function Navbar({ username, email, image, incomeType }: NavbarProps) {

  const NAV_TABS = [
    { label: "Expenses", href: "/dashboard", icon: PlusCircle },
    ...(incomeType === "FREELANCER"
      ? [{ label: "Income", href: "/dashboard/income", icon: TrendingUp }]
      : []),
    { label: "Subscriptions", href: "/dashboard/subscriptions", icon: RefreshCw },
    { label: "Summary", href: "/dashboard/summary", icon: BarChart2 },
  ];
  
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutUser();
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-50 w-full"
      >
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl border-b border-white/10" />

        <div className="relative px-4 md:px-12 lg:px-20 py-1">
          {/* Top Row */}
          <div className="flex h-16 items-center justify-between">
            {/* Left — Logo + Username */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-lg shadow-white/20 shrink-0">
                <span className="text-sm">💸</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xs text-slate-500 block leading-none">
                  Welcome back
                </span>
                <span className="text-sm font-semibold text-white leading-none mt-0.5 block">
                  {username ?? "User"}
                </span>
              </div>
            </div>

            {/* Right — Desktop Nav + Profile */}
            <div className="flex items-center gap-4">
              {/* Desktop Nav Tabs */}
              <nav className="hidden md:flex items-center gap-1">
                {NAV_TABS.map((tab) => {
                  const isActive = pathname === tab.href;
                  const Icon = tab.icon;
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                          ? "text-white"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-white/10 rounded-lg border border-white/20"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.4,
                          }}
                        />
                      )}
                      <Icon className="h-3.5 w-3.5 relative z-10" />
                      <span className="relative z-10">{tab.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Desktop Month Selector */}
              <div className="hidden md:block">
                <MonthSelector />
              </div>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <Avatar className="h-8 w-8 border border-white/20">
                      <AvatarImage src={image ?? ""} />
                      <AvatarFallback className="bg-indigo-600 text-white text-xs">
                        {username?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56 bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl shadow-black/50 text-white rounded-xl z-[60] mt-3"
                >
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-white">{username}</p>
                    <p className="text-xs text-slate-400 truncate">{email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem
                    className="hover:bg-white/8 cursor-pointer gap-2 rounded-lg mx-1 focus:bg-white/10"
                    onClick={() => router.push("/dashboard/profile")}
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-white/8 cursor-pointer gap-2 rounded-lg mx-1 focus:bg-white/10"
                    onClick={() => router.push("/dashboard/credentials")}
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    Change Credentials
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem
                    className="hover:bg-red-500/10 text-red-400 cursor-pointer gap-2 rounded-lg mx-1 focus:bg-red-500/10"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    <LogOut className="h-4 w-4" />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen((v) => !v)}
              >
                {mobileMenuOpen
                  ? <X className="h-5 w-5" />
                  : <Menu className="h-5 w-5" />
                }
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="fixed top-[68px] left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 px-4 py-4 space-y-4 md:hidden"
        >
          {/* Month Selector */}
          <div className="flex justify-center">
            <MonthSelector />
          </div>

          {/* Nav Tabs */}
          <nav className="flex flex-col gap-1">
            {NAV_TABS.map((tab) => {
              const isActive = pathname === tab.href;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                      ? "bg-indigo-600/30 border border-indigo-500/30 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </motion.div>
      )}
    </>
  );
}