"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { logout } from "@/redux/slices/authSlice";
import { setSelectedAccount } from "@/redux/slices/accountSlice";
import { toggleTheme, toggleSidebar } from "@/redux/slices/uiSlice";
import {
  useGetMyAccountsQuery,
  useGetMyNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "@/redux/api/apiSlice";
import {
  Bell,
  Sun,
  Moon,
  Menu,
  LogOut,
  CreditCard,
  CheckCheck,
  Building2,
  ChevronDown,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedAccount } = useAppSelector((state) => state.account);
  const { theme } = useAppSelector((state) => state.ui);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  // Fetch Accounts (if customer)
  const { data: accountsData } = useGetMyAccountsQuery(undefined, {
    skip: !user || user.role !== "customer",
  });
  const accounts = accountsData?.accounts || [];

  // Fetch Notifications
  const { data: notifData } = useGetMyNotificationsQuery(undefined, {
    skip: !user,
    pollingInterval: 30000,
  });
  const unreadCount = notifData?.unreadCount || 0;
  const notifications = notifData?.notifications || [];

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/75 dark:border-slate-800/80 bg-white/65 dark:bg-navy-900/70 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_12px_32px_-12px_rgba(13,126,245,0.18)] px-4 sm:px-6">
      {/* Left: Mobile hamburger & Brand/Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-brand-50 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shadow-brand-glow">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base">
              Prime<span className="text-brand-500 dark:text-brand-400">Bank</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-brand-50 text-brand-600 border border-brand-200/70 dark:bg-brand-950 dark:text-brand-300 dark:border-brand-800">
              {user?.role || "PORTAL"}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Account Switcher for Customers */}
      {user?.role === "customer" && accounts.length > 0 && (
        <div className="relative hidden md:block">
          <button
            onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm"
          >
            <CreditCard className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <div className="text-left">
              <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {selectedAccount?.accountType || "Primary"} Account
              </div>
              <div className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                {selectedAccount?.accountNumber || accounts[0]?.accountNumber} •{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedAccount?.balance ?? accounts[0]?.balance)}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          <AnimatePresence>
            {accountDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel p-2 z-50"
              >
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Bank Account
                </div>
                {accounts.map((acc) => (
                  <button
                    key={acc._id}
                    onClick={() => {
                      dispatch(setSelectedAccount(acc));
                      setAccountDropdownOpen(false);
                      toast.success(`Switched to ${acc.accountType.toUpperCase()} Account`);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-sm transition ${
                      selectedAccount?._id === acc._id
                        ? "bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-semibold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="capitalize text-xs font-bold">{acc.accountType} Account</div>
                      <div className="font-mono text-xs opacity-75">{acc.accountNumber}</div>
                    </div>
                    <div className="text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(acc.balance)}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark/Light mode toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            aria-label="View notifications"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Drawer */}
          <AnimatePresence>
            {notificationOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel p-4 z-50"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h4>
                    <p className="text-xs text-slate-500">{unreadCount} unread alerts</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead()}
                      className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-400">No new notifications</p>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n._id}
                        onClick={() => !n.isRead && markRead(n._id)}
                        className={`p-3 rounded-xl text-xs transition cursor-pointer ${
                          n.isRead
                            ? "bg-transparent text-slate-600 dark:text-slate-400"
                            : "bg-brand-50/70 dark:bg-brand-950/30 text-slate-900 dark:text-slate-100 font-medium border-l-2 border-brand-500"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{formatDate(n.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Identity / Logout */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-brand-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-full bg-gradient-to-b from-brand-400 to-brand-600 text-white font-bold text-xs flex items-center justify-center shadow-brand-glow shrink-0">
              {(user.name || "PB")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("")}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[160px]">
                {user.email}
              </div>
            </div>

            <button
              type="button"
              aria-label="Log out"
              onClick={handleLogout}
              title="Log out"
              className="p-2 rounded-full text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
