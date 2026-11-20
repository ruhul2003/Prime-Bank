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
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Statement (CSV)</span>
          </button>
        </div>
      </div>

      {/* Main Account Card Banner & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fintech Virtual Platinum Card */}
        <div className="lg:col-span-1 rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-brand-900 via-navy-900 to-slate-950 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          {/* Card subtle background patterns */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-brand-500/10 blur-2xl pointer-events-none" />
          <div className="absolute right-6 top-6 opacity-20">
            <Building2 className="w-16 h-16" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-300">
                PrimeBank Platinum
              </span>
              <Badge variant="success" size="sm">
                {activeAcc?.status || "ACTIVE"}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-1 capitalize">
              {activeAcc?.accountType || "Savings"} Account
            </p>
          </div>

          <div className="my-4">
            <span className="text-xs text-slate-400">Available Balance</span>
            <div className="text-3xl font-extrabold tracking-tight mt-0.5 font-mono">
              {formatCurrency(activeAcc?.balance)}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono text-slate-300">
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
            <span className="text-[11px] uppercase tracking-wider text-slate-400">USD</span>
          </div>
        </div>

        {/* Financial Metrics Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Portfolio</span>
              <CreditCard className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatCurrency(summary.totalBalance)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{summary.accountsCount} accounts active</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Inflow</span>
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(summary.totalDeposits)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Deposits & credited funds</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Outflow</span>
              <ArrowUpRight className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatCurrency(summary.totalWithdrawals)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Transfers & withdrawals</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-3">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Daily Transfer Ceiling Usage
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Limit: {formatCurrency(activeAcc?.dailyTransferLimit || 10000)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 my-2 overflow-hidden">
              <div
                className="bg-brand-500 h-2.5 rounded-full transition-all duration-500"
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
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:shadow-md transition group flex items-center gap-3"
        >
          <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">Fund Transfer</div>
            <div className="text-[11px] text-slate-400">Send money instantly</div>
          </div>
        </Link>

        <Link
          href="/dashboard/customer/deposit-withdraw"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-md transition group flex items-center gap-3"
        >
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">Deposit / Cash</div>
            <div className="text-[11px] text-slate-400">Branch cash requests</div>
          </div>
        </Link>

        <Link
          href="/dashboard/customer/loans"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:shadow-md transition group flex items-center gap-3"
        >
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">Loans & Credit</div>
            <div className="text-[11px] text-slate-400">Apply & EMI schedules</div>
          </div>
        </Link>

        <Link
          href="/dashboard/customer/accounts"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:shadow-md transition group flex items-center gap-3"
        >
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition">
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
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
