"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useTransferFundMutation, useGetMyAccountsQuery } from "@/redux/api/apiSlice";
import { updateAccountBalance } from "@/redux/slices/accountSlice";
import { setSelectedTransaction } from "@/redux/slices/transactionSlice";
import {
  ArrowRightLeft,
  Lock,
  DollarSign,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

export default function FundTransferPage() {
  const dispatch = useAppDispatch();
  const { accounts, selectedAccount } = useAppSelector((state) => state.account);

  const [senderAccountId, setSenderAccountId] = useState(
    selectedAccount?._id || accounts[0]?._id || ""
  );
  const [recipientAccount, setRecipientAccount] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState("");
  const [transactionPin, setTransactionPin] = useState("");

  const [transferMutation, { isLoading }] = useTransferFundMutation();

  const currentSenderAccount =
    accounts.find((a) => a._id === senderAccountId) || selectedAccount || accounts[0];

  const parsedAmount = parseFloat(amount) || 0;
  const fee = parsedAmount >= 500 ? 2 : 0;
  const totalDeduction = parsedAmount + fee;

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senderAccountId) {
      toast.error("Please select a source account.");
      return;
    }

    if (!recipientAccount.trim()) {
      toast.error("Please provide a recipient account number.");
      return;
    }

    if (currentSenderAccount?.accountNumber === recipientAccount.trim()) {
      toast.error("Sender and recipient accounts cannot be identical.");
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Please enter a valid transfer amount.");
      return;
    }

    if (currentSenderAccount && totalDeduction > currentSenderAccount.balance - currentSenderAccount.minBalance) {
      toast.error(
        `Insufficient funds. Account must maintain minimum balance of ${formatCurrency(
          currentSenderAccount.minBalance
        )}.`
      );
      return;
    }

    if (currentSenderAccount && parsedAmount > currentSenderAccount.maxSingleTransferLimit) {
      toast.error(
        `Amount exceeds maximum single transfer limit of ${formatCurrency(
          currentSenderAccount.maxSingleTransferLimit
        )}.`
      );
      return;
    }

    if (!transactionPin || transactionPin.length < 4) {
      toast.error("Please enter your 4-digit transaction authorization PIN.");
      return;
    }

    try {
      const res = await transferMutation({
        senderAccountId,
        recipientAccountNumber: recipientAccount.trim(),
        amount: parsedAmount,
        description: description || `Transfer to ${recipientAccount}`,
        transactionPin,
      }).unwrap();

      toast.success("Fund transfer completed successfully!");

      // Update Redux state with sender new balance
      dispatch(
        updateAccountBalance({
          accountId: senderAccountId,
          newBalance: res.senderNewBalance,
        })
      );

      // Open official electronic receipt
      dispatch(setSelectedTransaction(res.transaction));

      // Reset form
      setRecipientAccount("");
      setAmount("");
      setDescription("");
      setTransactionPin("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Transfer failed. Please check details and PIN.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-600 border border-brand-200/70 dark:bg-brand-950/60 dark:text-brand-400 dark:border-brand-800 mb-2">
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Domestic & Internal Clearing
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Instant Fund Transfer
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Atomically transfer funds between your PrimeBank accounts or to any client account
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transfer Form */}
        <div className="lg:col-span-2 glass-surface rounded-3xl p-6 sm:p-8">
          <form onSubmit={handleTransferSubmit} className="space-y-6">
            {/* Source Account */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                1. Select Source Account
              </label>
              <select
                value={senderAccountId}
                onChange={(e) => setSenderAccountId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.accountType.toUpperCase()} Account - {acc.accountNumber} (Available:{" "}
                    {formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>

              {currentSenderAccount && (
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>
                    Available:{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatCurrency(currentSenderAccount.balance)}
                    </strong>
                  </span>
                  <span>
                    Single Limit:{" "}
                    <strong className="font-mono">
                      {formatCurrency(currentSenderAccount.maxSingleTransferLimit)}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* Recipient Account */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                2. Recipient Account Number
              </label>
              <div className="relative">
                <Building2 className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  placeholder="e.g. 401000000004"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Quick transfer between own accounts buttons */}
              {accounts.length > 1 && (
                <div className="mt-2.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Or select from your other accounts:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {accounts
                      .filter((a) => a._id !== senderAccountId)
                      .map((a) => (
                        <button
                          key={a._id}
                          type="button"
                          onClick={() => setRecipientAccount(a.accountNumber)}
                          className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono transition"
                        >
                          {a.accountType.toUpperCase()} ({a.accountNumber})
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Transfer Amount */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                3. Transfer Amount ($)
              </label>
              <div className="relative">
                <DollarSign className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Quick Amount Pills */}
              <div className="flex gap-2 mt-2">
                {[100, 500, 1000, 2500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                  >
                    +${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                4. Description / Reference (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly rent, Supplier invoice, Family allowance"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Authorization PIN */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                5. Enter 4-Digit Security PIN
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={transactionPin}
                  onChange={(e) => setTransactionPin(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Default demo PIN is <code className="font-bold">1234</code>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-full btn-azure font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Authorize & Transfer {formatCurrency(totalDeduction)}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar Info & Settlement Breakdown */}
        <div className="space-y-6">
          <div className="glass-surface rounded-3xl p-6">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
              Transfer Fee Breakdown
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span>Principal Amount</span>
                <span className="font-mono text-slate-900 dark:text-white font-semibold">
                  {formatCurrency(parsedAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Institutional Clearing Fee</span>
                <span className="font-mono text-slate-900 dark:text-white font-semibold">
                  {formatCurrency(fee)}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span>Total Debit</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">
                  {formatCurrency(totalDeduction)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">
                  Two-Phase Database Commit
                </strong>
                Atomic fund debit and credit execute in one transaction session. Never worry about unilateral deductions.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">
                  Instant Electronic Receipt
                </strong>
                Downloadable PDF receipts with verifiable reference codes are generated upon completion.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
