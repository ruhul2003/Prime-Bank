"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/store";
import { setCredentials } from "@/redux/slices/authSlice";
import { useLoginMutation } from "@/redux/api/apiSlice";
import { Building2, Lock, Mail, ArrowRight, Shield, ShieldCheck, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginMutation, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    try {
      const res = await loginMutation({ email, password }).unwrap();
      dispatch(setCredentials({ user: res.user, token: res.token }));
      toast.success(`Welcome back, ${res.user.name}!`);

      if (res.user.role === "admin") {
        router.push("/dashboard/admin");
      } else if (res.user.role === "staff") {
        router.push("/dashboard/staff");
      } else {
        router.push("/dashboard/customer");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Invalid email or password.");
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.success("Credentials populated. Click 'Sign In' to proceed.");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-[#f7fbff] dark:bg-navy-950 sky-atmosphere">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shadow-brand-glow">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
              Prime<span className="text-brand-500 dark:text-brand-400">Bank</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In to Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Access your institutional accounts and services</p>
        </div>

        {/* Login Card */}
        <div className="glass-surface rounded-3xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@primebank.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-100 dark:border-slate-800 bg-[#f7fbff] dark:bg-navy-950 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-100 dark:border-slate-800 bg-[#f7fbff] dark:bg-navy-950 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-full btn-azure font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Evaluator Fill Section */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="block text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              One-Click Demo Fill
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo("admin@primebank.com", "admin123")}
                className="py-2 px-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-medium hover:bg-rose-100 transition text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo("staff@primebank.com", "staff123")}
                className="py-2 px-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium hover:bg-amber-100 transition text-center"
              >
                Bank Staff
              </button>
              <button
                type="button"
                onClick={() => fillDemo("customer@primebank.com", "CustomerPassword123!")}
                className="py-2 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-100 transition text-center"
              >
                Customer
              </button>
            </div>
          </div>
        </div>

        {/* Link to Register */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Do not have an account?{" "}
          <Link href="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            Open New Bank Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
