"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/redux/store";
import { useGetMyTransactionsQuery } from "@/redux/api/apiSlice";
import { setSelectedTransaction } from "@/redux/slices/transactionSlice";
import { Badge } from "@/components/ui/Badge";
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";
import { formatCurrency, formatDate, exportTransactionsToCSV } from "@/lib/utils";

export default function CustomerTransactionsPage() {
  const dispatch = useAppDispatch();

  // Filters
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const { data: txnData, isLoading } = useGetMyTransactionsQuery({
    page,
    limit: 15,
    search: search || undefined,
    type: type || undefined,
    status: status || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const transactions = txnData?.transactions || [];
  const totalPages = txnData?.totalPages || 1;

  const handleClearFilters = () => {
    setSearch("");
    setType("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400 mb-2">
            <History className="w-3.5 h-3.5" />
            Financial Audit Records
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transaction Activity & Receipts
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time statement records, searchable reference IDs, and downloadable tax receipts
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={() => exportTransactionsToCSV(transactions, `PrimeBank-Statement-${Date.now()}.csv`)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold shadow-sm transition self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export Filtered Statement (CSV)</span>
        </button>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search transaction ID, description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="transfer">Fund Transfers</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="loan_disbursement">Loan Disbursements</option>
              <option value="loan_repayment">Loan Repayments</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div>
            <button
              onClick={handleClearFilters}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Date Filtering */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Date Range:</span>
          <div className="flex items-center gap-2">
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Transaction ID</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6">Counterparty</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    No transactions matched your selected criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((t: any) => {
                  const isInflow = t.type === "deposit" || t.type === "loan_disbursement";
                  return (
                    <tr
                      key={t._id}
                      onClick={() => dispatch(setSelectedTransaction(t))}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {t.transactionId}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">{formatDate(t.createdAt)}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                          {t.description || "Digital Banking Transfer"}
                        </div>
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                          {t.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">
                        {isInflow
                          ? `From: ${t.senderAccountNumber || "Branch Teller"}`
                          : `To: ${t.receiverAccountNumber || "N/A"}`}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-sm">
                        <span className={isInflow ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}>
                          {isInflow ? "+" : "-"}
                          {formatCurrency(t.amount)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={
                            t.status === "completed"
                              ? "success"
                              : t.status === "pending"
                              ? "warning"
                              : "danger"
                          }
                          size="sm"
                        >
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setSelectedTransaction(t));
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-600 transition"
                          title="Generate Receipt"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
