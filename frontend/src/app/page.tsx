"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { logout } from "@/redux/slices/authSlice";
import { toggleTheme } from "@/redux/slices/uiSlice";
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  Lock,
  Zap,
  TrendingUp,
  FileCheck2,
  CheckCircle,
  Sun,
  Moon,
  CreditCard,
  ArrowRightLeft,
  Receipt,
  Landmark,
  Activity,
  Sparkles,
  LogOut,
  LayoutDashboard,
  Mail,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const MARQUEE_ITEMS = [
  { label: "Atomic Fund Transfers", icon: ArrowRightLeft },
  { label: "4-Digit PIN Authorization", icon: Lock },
  { label: "Savings • Current • Business", icon: CreditCard },
  { label: "Automated Loan Underwriting", icon: FileCheck2 },
  { label: "AML Velocity Monitoring", icon: ShieldCheck },
  { label: "Instant PDF Receipts & CSV", icon: Receipt },
  { label: "Real-Time Treasury Ledger", icon: Activity },
  { label: "Amortized EMI Schedules", icon: Landmark },
];

const ACCOUNT_TIERS = [
  {
    badge: "Personal Wealth",
    title: "Savings Account",
    description:
      "Built for everyday reserves and disciplined growth with automated interest tracking and instant liquidity.",
    highlight: "$10,000 / day",
    highlightLabel: "Daily Transfer Limit",
    perks: [
      "Minimum balance hold of $50",
      "Up to $5,000 single transfer clearing",
      "Instant PDF receipts & CSV exports",
    ],
    featured: false,
  },
  {
    badge: "Most Popular",
    title: "Current Account",
    description:
      "High-velocity checking engineered for frequent clearing, recurring payments, and multi-account transfers.",
    highlight: "Zero Delay",
    highlightLabel: "Atomic Settlement",
    perks: [
      "PIN-protected instant internal clearing",
      "Live cash deposit & withdrawal tracking",
      "Seamless loan installment repayments",
    ],
    featured: true,
  },
  {
    badge: "Enterprise Treasury",
    title: "Business Account",
    description:
      "Institutional-grade treasury controls with expanded clearing ceilings and compliance audit visibility.",
    highlight: "Commercial",
    highlightLabel: "Higher Clearing Limits",
    perks: [
      "Priority underwriting & term credit access",
      "Automated AML threshold monitoring",
      "Complete counterparty transaction history",
    ],
    featured: false,
  },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Instant Account Issuance & PIN Security",
    description:
      "Open a Savings, Current, or Business account in seconds with a dedicated 4–6 digit transaction PIN and automatic account numbering.",
  },
  {
    step: "02",
    title: "Two-Phase Atomic Fund Clearing",
    description:
      "Every transfer executes inside an isolated database transaction—guaranteeing balanced debits, credits, and zero phantom balances.",
  },
  {
    step: "03",
    title: "Automated Underwriting & Audit Receipts",
    description:
      "Apply for amortized loans, track monthly installments, and download verified PDF receipts or filtered CSV statements anytime.",
  },
];

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dashboardHref =
    user?.role === "admin"
      ? "/dashboard/admin"
      : user?.role === "staff"
      ? "/dashboard/staff"
      : "/dashboard/customer";

  const userInitials = (user?.name || "PB")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-[#edf5ff] dark:bg-navy-950 sky-atmosphere text-slate-900 dark:text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-white/75 dark:border-slate-800/80 bg-white/70 dark:bg-navy-900/75 backdrop-blur-2xl backdrop-saturate-150 sticky top-0 z-30 shadow-[0_12px_32px_-12px_rgba(13,126,245,0.14)]">
        <div className="w-[95%] mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-brand-400 to-brand-600 flex items-center justify-center text-white font-extrabold shadow-brand-glow">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Prime<span className="text-brand-500 dark:text-brand-400">Bank</span>
              </span>
              <span className="block text-[10px] tracking-widest font-mono text-slate-400 uppercase">
                Digital Treasury & Banking
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#accounts" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
              Accounts
            </a>
            <a href="#security" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
              Security
            </a>
            <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
              Platform
            </a>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => dispatch(toggleTheme())}
              aria-label="Toggle theme"
              className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-brand-50 dark:hover:bg-slate-800 transition"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
            {mounted && isAuthenticated && user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full bg-white/85 dark:bg-navy-900/85 border border-white/95 ring-1 ring-brand-200/70 dark:border-slate-700 hover:ring-brand-400 shadow-sm transition group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-b from-brand-400 to-brand-600 text-white font-bold text-xs flex items-center justify-center shadow-brand-glow">
                    {userInitials}
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {user.role}
                    </div>
                  </div>
                  <LayoutDashboard className="w-4 h-4 text-brand-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Log out"
                  aria-label="Log out"
                  className="p-2 rounded-full text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-full text-sm font-semibold btn-azure flex items-center gap-2"
                >
                  <span>Open Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Full-Screen Unique Hero Banner + Bottom Marquee */}
      <section className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden">
        {/* Subtle Architectural Grid + Deep Atmospheric Orbs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hero-grid-bg" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-20 h-[28rem] w-[28rem] rounded-full bg-brand-300/45 dark:bg-brand-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/4 right-0 h-[32rem] w-[32rem] rounded-full bg-brand-400/30 dark:bg-brand-600/15 blur-3xl"
        />

        {/* Main Hero Stage */}
        <div className="flex-1 flex items-center py-12 lg:py-16 relative z-10">
          <div className="w-[95%] mx-auto pl-3 sm:pl-8 lg:pl-14 xl:pl-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Editorial Headline & Actions */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="lg:col-span-6 text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-navy-900/85 backdrop-blur-xl border border-white/90 ring-1 ring-brand-200/70 dark:border-brand-800 text-slate-700 dark:text-slate-200 text-xs font-semibold mb-6 shadow-sm">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 text-white font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Live
                  </span>
                  <span>Core Treasury & Atomic Banking Platform</span>
                </div>

                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-brand-400 to-brand-700">
                    Digital Banking
                  </span>{" "}
                  <br />
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">
                    Built for Speed &amp;
                  </span>{" "}
                  <br />
                  <span className="text-slate-900 dark:text-white">Absolute Precision.</span>
                </h1>

                <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Manage Savings, Current, and Business accounts, execute PIN-verified atomic transfers, and track amortized credit from one glassmorphic treasury workspace.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/login"
                    className="px-8 py-4 rounded-full font-bold btn-azure text-sm sm:text-base inline-flex items-center gap-2"
                  >
                    <span>Launch Banking Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/register"
                    className="px-8 py-4 rounded-full font-bold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-white/90 ring-1 ring-brand-200/70 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-glass-card transition text-sm sm:text-base inline-flex items-center gap-2"
                  >
                    <span>Open New Account</span>
                    <ArrowRight className="w-4 h-4 text-brand-500" />
                  </Link>
                </div>

                {/* Inline Key Metrics */}
                <div className="mt-10 pt-8 border-t border-brand-200/50 dark:border-slate-800 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold font-mono text-brand-600 dark:text-brand-400">
                      100%
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      Atomic Isolation
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                      &lt; 120ms
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      Clearing Speed
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                      24/7
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      AML Oversight
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Floating 3D Glassmorphism Banking Showcase */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.12, ease: "easeOut" }}
                className="lg:col-span-6 relative flex items-center justify-center py-8 lg:py-0"
              >
                <div className="relative w-full max-w-lg">
                  {/* Soft Glowing Aura Behind Showcase */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-6 rounded-full bg-gradient-to-tr from-brand-400/50 via-sky-300/45 to-brand-600/40 blur-3xl"
                  />

                  {/* Main Glass Stage Frame */}
                  <div className="relative glass-panel rounded-[2rem] p-6 sm:p-7">
                    {/* Top Window Bar */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 ml-1">
                          PRIMEBANK TREASURY OS
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-300 border border-brand-200/70 dark:border-brand-800">
                        PIN + JWT Secured
                      </span>
                    </div>

                    {/* Featured Floating Deep Azure Card */}
                    <div className="rounded-3xl p-6 bg-gradient-to-br from-[#2fa3ff] via-[#0d7ef5] to-[#0446a3] text-white shadow-[0_24px_48px_-10px_rgba(6,96,207,0.55)] border border-white/30 transform -rotate-1 hover:rotate-0 transition-transform duration-500 relative overflow-hidden">
                      <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                            PrimeBank Platinum
                          </span>
                          <div className="text-xs font-semibold text-white/95 mt-0.5">
                            Commercial Clearing Account
                          </div>
                        </div>
                        <div className="w-10 h-7 rounded-md bg-white/20 border border-white/35 backdrop-blur-sm flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <div className="my-6">
                        <span className="text-[11px] text-white/75 uppercase tracking-wider">
                          Available Treasury Balance
                        </span>
                        <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight mt-1">
                          $148,920.50
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/20 text-xs font-mono text-white/90">
                        <span>4010 •••• •••• 8842</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-sans font-bold">
                          ACTIVE
                        </span>
                      </div>
                    </div>

                    {/* Bottom Mini Activity Strip inside Stage */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-white/75 dark:bg-slate-800/60 border border-white/90 dark:border-slate-700/60">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>Daily Ceiling</span>
                          <ArrowRightLeft className="w-3.5 h-3.5 text-brand-500" />
                        </div>
                        <div className="font-mono font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                          $10,000.00
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-brand-100 dark:bg-slate-700 mt-2 overflow-hidden">
                          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-brand-400 to-brand-600" />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/75 dark:bg-slate-800/60 border border-white/90 dark:border-slate-700/60">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>Credit Health</span>
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                          4.5% APR
                        </div>
                        <div className="flex items-end gap-1 h-2.5 mt-2">
                          <span className="w-2 h-1.5 rounded-sm bg-brand-300" />
                          <span className="w-2 h-2 rounded-sm bg-brand-400" />
                          <span className="w-2 h-2.5 rounded-sm bg-brand-500" />
                          <span className="w-2 h-2 rounded-sm bg-emerald-400" />
                          <span className="w-2 h-2.5 rounded-sm bg-emerald-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Glass Pill - Top Left */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
                    transition={{
                      opacity: { duration: 0.5, delay: 0.35 },
                      x: { duration: 0.5, delay: 0.35 },
                      y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
                    }}
                    className="hidden sm:flex items-center gap-3 px-4 py-3 rounded-2xl glass-surface absolute -top-5 -left-6 z-20"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/70 dark:border-emerald-800">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white">
                        +$4,250.00 Settled
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Atomic Commit • 0.08s
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating Glass Pill - Bottom Right */}
                  <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
                    transition={{
                      opacity: { duration: 0.5, delay: 0.45 },
                      x: { duration: 0.5, delay: 0.45 },
                      y: { duration: 6.2, repeat: Infinity, ease: "easeInOut" },
                    }}
                    className="hidden sm:flex items-center gap-3 px-4 py-3 rounded-2xl glass-surface absolute -bottom-5 -right-5 z-20"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white">
                        PDF Receipt Ready
                      </div>
                      <div className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">
                        Instant Statement Export
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-brand-500 text-white flex items-center justify-center shadow-md">
                      <Receipt className="w-4 h-4" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Marquee Anchored at Bottom of Full-Screen Hero */}
        <div
          aria-label="Platform capabilities ticker"
          className="relative py-4 overflow-hidden border-y border-white/75 dark:border-slate-800/80 bg-white/55 dark:bg-navy-900/55 backdrop-blur-xl z-10"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#edf5ff] dark:from-navy-950 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#edf5ff] dark:from-navy-950 to-transparent z-10" />
          <div className="animate-marquee flex items-center gap-4">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={`${item.label}-${idx}`}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/85 dark:bg-navy-900/85 border border-white/95 ring-1 ring-brand-200/60 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap"
                >
                  <span className="p-1.5 rounded-full bg-brand-50 dark:bg-brand-950/70 text-brand-500 dark:text-brand-400">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Account Tiers Section */}
      <section id="accounts" className="py-20 relative">
        <div className="w-[95%] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/85 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 border border-white/90 ring-1 ring-brand-200/60 mb-3">
              <CreditCard className="w-3.5 h-3.5" />
              Tailored Account Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Accounts Built for Every Financial Stage
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Switch effortlessly across personal reserves, daily clearing, and commercial treasury accounts from one unified workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ACCOUNT_TIERS.map((tier, idx) => (
              <motion.div
                key={tier.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: idx * 0.1, ease: "easeOut" }}
                whileHover={{ y: -5 }}
                className={`p-7 rounded-3xl flex flex-col justify-between transition-shadow duration-300 ${
                  tier.featured
                    ? "bg-gradient-to-br from-[#2fa3ff] via-[#0d7ef5] to-[#0552bd] text-white shadow-[0_26px_54px_-12px_rgba(13,126,245,0.48)] border border-white/30"
                    : "glass-surface"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        tier.featured
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/70 dark:border-brand-800"
                      }`}
                    >
                      {tier.badge}
                    </span>
                    <Landmark
                      className={`w-5 h-5 ${tier.featured ? "text-white/90" : "text-brand-500"}`}
                    />
                  </div>

                  <h3
                    className={`text-xl font-extrabold ${
                      tier.featured ? "text-white" : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {tier.title}
                  </h3>
                  <p
                    className={`mt-2 text-xs leading-relaxed ${
                      tier.featured ? "text-white/85" : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {tier.description}
                  </p>

                  <div
                    className={`my-5 p-4 rounded-2xl ${
                      tier.featured
                        ? "bg-white/15 border border-white/20"
                        : "bg-brand-50/70 dark:bg-slate-800/60 border border-brand-100/80 dark:border-slate-700/60"
                    }`}
                  >
                    <div
                      className={`text-[11px] font-semibold uppercase tracking-wider ${
                        tier.featured ? "text-white/75" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {tier.highlightLabel}
                    </div>
                    <div
                      className={`text-2xl font-extrabold font-mono mt-0.5 ${
                        tier.featured ? "text-white" : "text-brand-600 dark:text-brand-400"
                      }`}
                    >
                      {tier.highlight}
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2">
                        <CheckCircle
                          className={`w-4 h-4 shrink-0 ${
                            tier.featured ? "text-emerald-200" : "text-emerald-500"
                          }`}
                        />
                        <span
                          className={
                            tier.featured ? "text-white/90" : "text-slate-600 dark:text-slate-300"
                          }
                        >
                          {perk}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/register"
                  className={`mt-7 w-full py-3 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition ${
                    tier.featured
                      ? "bg-white text-brand-600 hover:bg-brand-50 shadow-md"
                      : "btn-azure"
                  }`}
                >
                  <span>Open {tier.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Minimal How PrimeBank Works Section */}
      <section id="security" className="pb-20">
        <div className="w-[95%] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              <Sparkles className="w-3.5 h-3.5" />
              How PrimeBank Works
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Three Steps to Precision Banking
            </h2>
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/75 dark:bg-navy-900/75 border border-white/90 ring-1 ring-brand-200/60 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>100% Atomic • PIN + JWT Verified</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WORKFLOW_STEPS.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
                className="p-7 rounded-3xl glass-surface flex flex-col justify-between"
              >
                <div>
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/70 text-sky-700 dark:text-sky-300 font-mono font-bold text-xs">
                    {item.step}
                  </span>
                  <h3 className="mt-5 font-bold text-lg text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Pillar Badges */}
      <section
        id="features"
        className="py-16 bg-white/55 dark:bg-navy-900/55 backdrop-blur-xl border-y border-white/80 dark:border-slate-800"
      >
        <div className="w-[95%] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-3xl glass-surface flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-500 dark:text-brand-400 border border-brand-100 dark:border-brand-900">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Atomic Transfers</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Database transaction isolation guarantees zero partial deductions or phantom balances.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-3xl glass-surface flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">RTK Query & Redux</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Automatic cache invalidation, optimistic updates, and normalized state management.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-3xl glass-surface flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Loan Underwriting</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Amortized schedules, staff notes, and instant automated disbursement transactions.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-3xl glass-surface flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Suspicious Detection</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Rule-based threshold alerts for high-value velocity and staff review workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16">
        <div className="w-[95%] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#2fa3ff] via-[#0d7ef5] to-[#054aa3] text-white shadow-[0_26px_60px_-14px_rgba(13,126,245,0.5)] border border-white/30 text-center relative overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/15 blur-2xl pointer-events-none" />
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready for Modern Digital Treasury?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/85 max-w-xl mx-auto">
              Create your PrimeBank account in under a minute or sign in to access your real-time banking dashboard.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-7 py-3 rounded-full bg-white text-brand-600 hover:bg-brand-50 font-bold text-sm shadow-lg transition inline-flex items-center gap-2"
              >
                <span>Open New Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-7 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/35 font-bold text-sm transition"
              >
                Sign In to Portal
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Professional Glassmorphic Footer */}
      <footer className="mt-auto pb-6 pt-4">
        <div className="w-[95%] mx-auto rounded-[2rem] glass-panel overflow-hidden relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 right-1/4 h-64 w-64 rounded-full bg-brand-300/30 dark:bg-brand-500/10 blur-3xl"
          />

          <div className="relative z-10 p-8 sm:p-12 grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Brand & Institutional Summary */}
            <div className="md:col-span-4 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-brand-400 to-brand-600 flex items-center justify-center text-white font-extrabold shadow-brand-glow">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                    Prime<span className="text-brand-500 dark:text-brand-400">Bank</span>
                  </span>
                  <span className="block text-[10px] tracking-widest font-mono text-slate-400 uppercase">
                    Digital Treasury &amp; Banking
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
                Institutional-grade digital banking platform with atomic fund clearing, multi-account liquidity, amortized underwriting, and real-time AML monitoring.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  All Systems Operational
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/70 dark:border-brand-800 text-[11px] font-semibold text-brand-700 dark:text-brand-300">
                  <Lock className="w-3 h-3" />
                  Atomic Ledger
                </span>
              </div>
            </div>

            {/* Banking Products */}
            <div className="md:col-span-2 space-y-3.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Accounts &amp; Credit
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <a href="#accounts" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                    Savings Account
                  </a>
                </li>
                <li>
                  <a href="#accounts" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                    Current Clearing
                  </a>
                </li>
                <li>
                  <a href="#accounts" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                    Business Treasury
                  </a>
                </li>
                <li>
                  <Link
                    href="/dashboard/customer/loans"
                    className="hover:text-brand-600 dark:hover:text-brand-400 transition"
                  >
                    Term Loans &amp; EMI
                  </Link>
                </li>
              </ul>
            </div>

            {/* Platform & Portal Links */}
            <div className="md:col-span-3 space-y-3.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Banking Portal
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <Link
                    href="/dashboard/customer"
                    className="hover:text-brand-600 dark:hover:text-brand-400 transition"
                  >
                    Customer Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/customer/transfer"
                    className="hover:text-brand-600 dark:hover:text-brand-400 transition"
                  >
                    Instant Fund Transfer
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/customer/deposit-withdraw"
                    className="hover:text-brand-600 dark:hover:text-brand-400 transition"
                  >
                    Cash Deposit &amp; Withdrawal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/customer/transactions"
                    className="hover:text-brand-600 dark:hover:text-brand-400 transition"
                  >
                    Statements &amp; PDF Receipts
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Access & Support Card */}
            <div className="md:col-span-3">
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-white/95 ring-1 ring-brand-200/60 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                    Institutional Desk
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    24/7 clearing support and digital account onboarding.
                  </p>
                </div>

                <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <span className="font-mono">support@primebank.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>24/7 Automated Clearing Desk</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/register"
                    className="flex-1 py-2 px-3 rounded-full btn-azure font-bold text-[11px] text-center"
                  >
                    Open Account
                  </Link>
                  <Link
                    href="/login"
                    className="py-2 px-3 rounded-full bg-sky-50 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-800 dark:text-slate-200 font-bold text-[11px] transition"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Security Strip */}
          <div className="relative z-10 px-8 sm:px-12 py-4 border-t border-brand-100/80 dark:border-slate-800/80 bg-white/45 dark:bg-navy-950/45 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <div>
              © {new Date().getFullYear()} <span className="font-bold text-slate-700 dark:text-slate-200">PrimeBank Digital</span>. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                PIN + JWT Protected
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <span>Atomic Consistency Engine v1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
