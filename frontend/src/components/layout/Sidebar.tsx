"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setSidebarOpen } from "@/redux/slices/uiSlice";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowRightLeft,
  DollarSign,
  FileText,
  ShieldAlert,
  Building2,
  X,
  History,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  const role = user?.role || "customer";

  const adminNav = [
    { label: "Executive Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Customer Registry", href: "/dashboard/admin?tab=customers", icon: Users },
    { label: "Bank Accounts", href: "/dashboard/admin?tab=accounts", icon: CreditCard },
    { label: "Loan Underwriting", href: "/dashboard/admin?tab=loans", icon: FileText },
    { label: "Deposit / Withdrawals", href: "/dashboard/admin?tab=requests", icon: DollarSign },
    { label: "Security & Flagged", href: "/dashboard/admin?tab=audit", icon: ShieldAlert },
  ];

  const staffNav = [
    { label: "Staff Dashboard", href: "/dashboard/staff", icon: LayoutDashboard },
    { label: "Onboard Customer", href: "/dashboard/staff?tab=onboard", icon: Users },
    { label: "Transaction Desk", href: "/dashboard/staff?tab=transactions", icon: History },
    { label: "Loan Assistance", href: "/dashboard/staff?tab=loans", icon: FileText },
    { label: "Review Requests", href: "/dashboard/staff?tab=requests", icon: CheckCircle },
  ];

  const customerNav = [
    { label: "Dashboard", href: "/dashboard/customer", icon: LayoutDashboard },
    { label: "Fund Transfer", href: "/dashboard/customer/transfer", icon: ArrowRightLeft },
    { label: "Deposit & Withdraw", href: "/dashboard/customer/deposit-withdraw", icon: DollarSign },
    { label: "Loans & Credit", href: "/dashboard/customer/loans", icon: FileText },
    { label: "Transaction History", href: "/dashboard/customer/transactions", icon: History },
    { label: "My Bank Accounts", href: "/dashboard/customer/accounts", icon: CreditCard },
  ];

  const currentNav =
    role === "admin" ? adminNav : role === "staff" ? staffNav : customerNav;

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => dispatch(setSidebarOpen(false))}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-white/75 dark:border-slate-800/80 bg-white/70 dark:bg-navy-900/80 backdrop-blur-2xl backdrop-saturate-150 shadow-[12px_0_40px_-14px_rgba(13,126,245,0.20)] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/70 dark:border-slate-800/80">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#2fa3ff] to-[#0660cf] flex items-center justify-center text-white font-bold shadow-brand-glow">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="font-extrabold tracking-tight text-lg text-slate-900 dark:text-white">
              Prime<span className="text-brand-600 dark:text-brand-400">Bank</span>
            </div>
          </Link>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => dispatch(setSidebarOpen(false))}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge Card */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-white/80 ring-1 ring-brand-200/50 dark:border-slate-700/70 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Security Clearance
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900 dark:text-white capitalize">
              {role === "admin"
                ? "Bank Administrator"
                : role === "staff"
                ? "Branch Operations Staff"
                : "Verified Customer"}
            </span>
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                role === "admin"
                  ? "bg-rose-500"
                  : role === "staff"
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              )}
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Sidebar navigation" className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          {currentNav.map((item) => {
            const Icon = item.icon;
            const [itemPath, itemQuery] = item.href.split("?");
            const itemTab = itemQuery ? new URLSearchParams(itemQuery).get("tab") : null;
            const isActive = itemTab
              ? pathname === itemPath && currentTab === itemTab
              : itemPath === "/dashboard/admin" || itemPath === "/dashboard/staff"
              ? pathname === itemPath && !currentTab
              : pathname === itemPath ||
                (itemPath !== "/dashboard/customer" && pathname.startsWith(itemPath));

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) dispatch(setSidebarOpen(false));
                }}
                className={cn(
                  "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors group",
                  isActive
                    ? "text-sky-700 dark:text-sky-300 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-sky-50/60 dark:hover:bg-slate-800/60 hover:text-sky-700 dark:hover:text-white"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-sky-50/95 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/70 shadow-[0_4px_14px_-4px_rgba(14,165,233,0.18)] -z-10"
                  />
                )}
                <Icon
                  className={cn(
                    "w-4 h-4 transition-transform group-hover:scale-110",
                    isActive ? "text-sky-600 dark:text-sky-400" : "text-slate-400 group-hover:text-sky-500"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center">
          PrimeBank Core v1.0.0
          <br />
          <span className="font-mono text-[10px] text-slate-500">Atomic Consistency Engine</span>
        </div>
      </aside>
    </>
  );
};
