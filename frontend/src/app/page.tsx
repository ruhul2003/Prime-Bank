"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/store";
import { setCredentials } from "@/redux/slices/authSlice";
import { useLoginMutation } from "@/redux/api/apiSlice";
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  Lock,
  Zap,
  TrendingUp,
  FileCheck2,
  Users,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loginMutation, { isLoading }] = useLoginMutation();

  const handleQuickLogin = async (email: string, pass: string, targetPath: string) => {
    try {
      const res = await loginMutation({ email, password: pass }).unwrap();
      dispatch(setCredentials({ user: res.user, token: res.token }));
      toast.success(`Authenticated as ${res.user.name} (${res.user.role.toUpperCase()})`);
      router.push(targetPath);
    } catch (err: any) {
      toast.error(err?.data?.message || "Demo login failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-brand-500/25">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Prime<span className="text-brand-600 dark:text-brand-400">Bank</span>
              </span>
              <span className="block text-[10px] tracking-widest font-mono text-slate-400 uppercase">
                Digital Treasury & Banking
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition flex items-center gap-2"
            >
              <span>Open Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6 animate-pulse">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Next-Gen Core Banking with Atomic Fund Integrity</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Enterprise Digital Banking <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600">
                Engineered for High Precision.
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              PrimeBank delivers a full-spectrum financial simulation platform: multi-currency accounts, atomic fund transfers, automated loan underwriting, and role-based staff operations.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="px-8 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25 transition text-base"
              >
                Launch Banking Portal
              </Link>
              <Link
                href="/register"
                className="px-8 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-base"
              >
                Apply for New Account
              </Link>
            </div>
          </div>

          {/* Quick Demo Credentials & Access Cards */}
          <div className="mt-20">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                One-Click Role Demonstration
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select any verified institutional persona to experience custom role-based dashboards immediately
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Admin */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                      Role: Admin
                    </span>
                    <ShieldCheck className="w-5 h-5 text-rose-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Alexander Vance
                  </h3>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">admin@primebank.com</p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Bank-wide metrics & Recharts analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Customer registry & block / activate
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Loan underwriting approvals & disbursement
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Set daily limits & freeze accounts
                    </li>
                  </ul>
                </div>
                <button
                  disabled={isLoading}
                  onClick={() =>
                    handleQuickLogin("admin@primebank.com", "AdminPassword123!", "/dashboard/admin")
                  }
                  className="mt-6 w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-slate-800 font-semibold text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Launch as Admin</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 2: Staff */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                      Role: Bank Staff
                    </span>
                    <Users className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Elena Rostova
                  </h3>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">staff@primebank.com</p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Customer onboarding & KYC verification
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Transaction search, date/type filtering
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Flag suspicious transfers for audit
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Loan preliminary review & notes
                    </li>
                  </ul>
                </div>
                <button
                  disabled={isLoading}
                  onClick={() =>
                    handleQuickLogin("staff@primebank.com", "StaffPassword123!", "/dashboard/staff")
                  }
                  className="mt-6 w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-slate-800 font-semibold text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Launch as Bank Staff</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 3: Customer */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                      Role: Customer
                    </span>
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Robert Sterling
                  </h3>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">customer@primebank.com</p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Multi-account switching (Savings/Current/Business)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Atomic fund transfers with PIN validation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Instant PDF Receipts & CSV statement exports
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Loan application & installment repayment
                    </li>
                  </ul>
                </div>
                <button
                  disabled={isLoading}
                  onClick={() =>
                    handleQuickLogin(
                      "customer@primebank.com",
                      "CustomerPassword123!",
                      "/dashboard/customer"
                    )
                  }
                  className="mt-6 w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Launch as Customer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Badges */}
      <section className="py-16 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Atomic Transfers</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Database transaction isolation guarantees zero partial deductions or phantom balances.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">RTK Query & Redux</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Automatic cache invalidation, optimistic updates, and normalized state management.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Loan Underwriting</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Amortized schedules, staff notes, and instant automated disbursement transactions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="w-6 h-6" />
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

      {/* Footer */}
      <footer className="mt-auto py-10 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span className="font-bold text-slate-700 dark:text-slate-300">PrimeBank Digital</span>
            <span>• Simulated Banking Assessment Project</span>
          </div>
          <div>
            Built with Next.js App Router, TypeScript, Redux Toolkit & Mongoose
          </div>
        </div>
      </footer>
    </div>
  );
}
