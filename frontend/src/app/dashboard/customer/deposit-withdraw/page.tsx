"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/redux/store";
import {
  useSubmitRequestMutation,
  useGetMyRequestsQuery,
} from "@/redux/api/apiSlice";
import { Badge } from "@/components/ui/Badge";
import {
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function DepositWithdrawPage() {
  const { accounts, selectedAccount } = useAppSelector((state) => state.account);

  const [requestType, setRequestType] = useState<"deposit" | "withdrawal">("deposit");
  const [accountId, setAccountId] = useState(
    selectedAccount?._id || accounts[0]?._id || ""
  );
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [submitMutation, { isLoading }] = useSubmitRequestMutation();
  const { data: requestsData, refetch } = useGetMyRequestsQuery();

  const currentAccount =
    accounts.find((a) => a._id === accountId) || selectedAccount || accounts[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (
      requestType === "withdrawal" &&
      currentAccount &&
      parsedAmount > currentAccount.balance - currentAccount.minBalance
    ) {
      toast.error(
        `Insufficient balance for withdrawal. Minimum balance of ${formatCurrency(
          currentAccount.minBalance
        )} must remain.`
      );
      return;
    }

    try {
      await submitMutation({
        accountId,
        type: requestType,
        amount: parsedAmount,
        description: description || `${requestType.toUpperCase()} request for processing`,
      }).unwrap();

      toast.success(
        `${requestType === "deposit" ? "Deposit" : "Withdrawal"} request submitted to bank desk!`
      );
      setAmount("");
      setDescription("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit request.");
    }
  };

  const requests = requestsData?.requests || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 mb-2">
          <DollarSign className="w-3.5 h-3.5" />
          Branch Cash & Wire Counter
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Deposit & Withdrawal Requests
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Submit funds for branch teller verification and cash counter pickup
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <div className="lg:col-span-1 glass-surface rounded-3xl p-6">
          {/* Toggle Type Buttons */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setRequestType("deposit")}
              className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                requestType === "deposit"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Deposit</span>
            </button>
            <button
              type="button"
              onClick={() => setRequestType("withdrawal")}
              className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                requestType === "withdrawal"
                  ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdrawal</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Target Bank Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.accountType.toUpperCase()} - {acc.accountNumber} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                {requestType === "deposit" ? "Deposit" : "Withdrawal"} Amount ($)
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Notes / Channel Reference
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Check #4912, Counter Cash"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-2 py-3 px-4 rounded-full font-bold text-sm text-white shadow-md transition flex items-center justify-center gap-2 ${
                requestType === "deposit"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : "btn-azure"
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit {requestType.toUpperCase()} Request</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Requests Activity History Table */}
        <div className="lg:col-span-2 glass-surface rounded-3xl p-6 overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Submitted Request History
              </h3>
              <p className="text-xs text-slate-500">Live approval status from Bank Staff & Admin</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{requests.length} requests</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold text-xs uppercase">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      No deposit or withdrawal requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  requests.map((r: any) => (
                    <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs">{r.requestId}</td>
                      <td className="py-3.5 px-4 uppercase text-xs font-bold">
                        <span
                          className={r.type === "deposit" ? "text-emerald-500" : "text-brand-500"}
                        >
                          {r.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono">
                        {r.accountId?.accountNumber || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(r.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            r.status === "approved"
                              ? "success"
                              : r.status === "rejected"
                              ? "danger"
                              : "warning"
                          }
                          size="sm"
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {r.reviewNotes || r.description || "In queue"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
