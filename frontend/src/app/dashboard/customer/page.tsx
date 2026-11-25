"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  useGetMyAccountsQuery,
  useGetCustomerAnalyticsQuery,
  useGetMyTransactionsQuery,
} from "@/redux/api/apiSlice";
import { setAccounts, setSelectedAccount } from "@/redux/slices/accountSlice";
import { setSelectedTransaction } from "@/redux/slices/transactionSlice";
import { CustomerCharts } from "@/components/charts/CustomerCharts";
import { Badge } from "@/components/ui/Badge";
import {
  CreditCard,
  ArrowRightLeft,
  DollarSign,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Copy,
  Receipt,
  ShieldCheck,
  Building2,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatDate, exportTransactionsToCSV } from "@/lib/utils";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function CustomerDashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { accounts, selectedAccount } = useAppSelector((state) => state.account);

  // Queries
  const { data: accountsData } = useGetMyAccountsQuery();
  const { data: analyticsData } = useGetCustomerAnalyticsQuery();
  const { data: txnData } = useGetMyTransactionsQuery({ limit: 5 });

  useEffect(() => {
    if (accountsData?.accounts) {
      dispatch(setAccounts(accountsData.accounts));
    }
  }, [accountsData, dispatch]);

  const activeAcc = selectedAccount || accounts[0];
  const summary = analyticsData?.summary || {
    totalBalance: activeAcc?.balance || 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    accountsCount: accounts.length || 1,
    activeLoansCount: 0,
    totalLoanDebt: 0,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Account number copied to clipboard");
  };

  const recentTransactions = txnData?.transactions || [];

  return (
    <div className="space-y-8">
      {/* Welcome & Account Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name || "Client"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Institutional Client Account • Primary Currency: USD
          </p>
        </div>

        {/* Quick Statement Download */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportTransactionsToCSV(recentTransactions, "PrimeBank-Account-Statement.csv")}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#DCECFB] dark:border-slate-800 bg-white/90 dark:bg-slate-900 hover:bg-brand-50/70 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-brand-500" />
            <span>Export Statement (CSV)</span>
          </button>
        </div>
      </div>

      {/* Main Account Card Banner & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fintech Virtual Azure Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          whileHover={{ y: -4 }}
          className="lg:col-span-1 rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#2fa3ff] via-[#0d7ef5] to-[#0446a3] text-white shadow-[0_24px_48px_-10px_rgba(6,96,207,0.52)] transition-shadow duration-300 border border-white/30 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
        >
          {/* Card subtle background patterns */}
          <div className="absolute -right-10 -bottom-10 w-52 h-52 rounded-full bg-white/20 blur-2xl pointer-events-none" />
          <div className="absolute right-6 top-6 opacity-20">
            <Building2 className="w-16 h-16" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
                PrimeBank Azure
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white border border-white/30">
                {activeAcc?.status || "ACTIVE"}
              </span>
            </div>
            <p className="text-xs text-white/80 mt-1 capitalize">
              {activeAcc?.accountType || "Savings"} Account
            </p>
          </div>

          <div className="my-4">
            <span className="text-xs text-white/80">Available Balance</span>
            <div className="text-3xl font-extrabold tracking-tight mt-0.5 font-mono">
              {formatCurrency(activeAcc?.balance)}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs font-mono text-white/90">
            <div className="flex items-center gap-1.5">
              <span>{activeAcc?.accountNumber || "401000000001"}</span>
              <button
                onClick={() => copyToClipboard(activeAcc?.accountNumber || "")}
                className="p-1 hover:text-white transition"
                title="Copy Account Number"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[11px] uppercase tracking-wider text-white/80">USD</span>
          </div>
        </motion.div>

        {/* Financial Metrics Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl glass-surface flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Portfolio</span>
              <CreditCard className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatCurrency(summary.totalBalance)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{summary.accountsCount} accounts active</p>
          </div>

          <div className="p-5 rounded-3xl glass-surface flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Inflow</span>
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(summary.totalDeposits)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Deposits & credited funds</p>
          </div>

          <div className="p-5 rounded-3xl glass-surface flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Outflow</span>
              <ArrowUpRight className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatCurrency(summary.totalWithdrawals)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Transfers & withdrawals</p>
          </div>

          <div className="p-5 rounded-3xl glass-surface flex flex-col justify-between col-span-2 sm:col-span-3">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Daily Transfer Ceiling Usage
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Limit: {formatCurrency(activeAcc?.dailyTransferLimit || 10000)}
              </span>
            </div>
            <div className="w-full bg-brand-50 dark:bg-slate-800 rounded-full h-2.5 my-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-400 to-brand-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: "24%" }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Max single transaction: {formatCurrency(activeAcc?.maxSingleTransferLimit || 5000)}</span>
              <span>Min balance hold: {formatCurrency(activeAcc?.minBalance || 50)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/dashboard/customer/transfer"
          className="p-4 rounded-3xl glass-surface hover:border-brand-400 transition group flex items-center gap-3"
        >
          <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-500 dark:text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">Fund Transfer</div>
            <div className="text-[11px] text-slate-400">Send money instantly</div>
          </div>
        </Link>

        <Link
          href="/dashboard/customer/deposit-withdraw"
          className="p-4 rounded-3xl glass-surface hover:border-emerald-400 transition group flex items-center gap-3"
        >
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">Deposit / Cash</div>
            <div className="text-[11px] text-slate-400">Branch cash requests</div>
          </div>
        </Link>

        <Link
          href="/dashboard/customer/loans"
          className="p-4 rounded-3xl glass-surface hover:border-brand-400 transition group flex items-center gap-3"
        >
          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 group-hover:bg-brand-500 group-hover:text-white transition">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">Loans & Credit</div>
            <div className="text-[11px] text-slate-400">Apply & EMI schedules</div>
          </div>
        </Link>

        <Link
          href="/dashboard/customer/accounts"
          className="p-4 rounded-3xl glass-surface hover:border-slate-400 transition group flex items-center gap-3"
        >
          <div className="p-3 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white group-hover:bg-brand-500 transition">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">Bank Accounts</div>
            <div className="text-[11px] text-slate-400">Manage & change PIN</div>
          </div>
        </Link>
      </div>

      {/* Customer Analytics Visualization */}
      {analyticsData && <CustomerCharts analytics={analyticsData} />}

      {/* Recent Transactions List with Click-to-Receipt */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-[#E5F1FD] dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Recent Account Activity
            </h3>
            <p className="text-xs text-slate-500">Click any transaction to generate official PDF receipt</p>
          </div>
          <Link
            href="/dashboard/customer/transactions"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All Records</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-400">No transactions recorded yet.</div>
          ) : (
            recentTransactions.map((txn: any) => (
              <div
                key={txn._id}
                onClick={() => dispatch(setSelectedTransaction(txn))}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl ${
                      txn.type === "deposit" || txn.type === "loan_disbursement"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {txn.type === "deposit" || txn.type === "loan_disbursement" ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {txn.description || "Digital Banking Transfer"}
                    </div>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>{txn.transactionId}</span>
                      <span>•</span>
                      <span>{formatDate(txn.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-mono font-bold text-sm ${
                      txn.type === "deposit" || txn.type === "loan_disbursement"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {txn.type === "deposit" || txn.type === "loan_disbursement" ? "+" : "-"}
                    {formatCurrency(txn.amount)}
                  </div>
                  <Badge variant={txn.status === "completed" ? "success" : "warning"} size="sm">
                    {txn.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
