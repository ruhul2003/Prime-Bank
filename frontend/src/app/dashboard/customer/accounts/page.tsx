"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  useGetMyAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountPinMutation,
} from "@/redux/api/apiSlice";
import { setSelectedAccount } from "@/redux/slices/accountSlice";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  CreditCard,
  PlusCircle,
  KeyRound,
  Copy,
  Building2,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CustomerAccountsPage() {
  const dispatch = useAppDispatch();
  const { accounts, selectedAccount } = useAppSelector((state) => state.account);

  const { refetch } = useGetMyAccountsQuery();
  const [createAccountMutation, { isLoading: creating }] = useCreateAccountMutation();
  const [updatePinMutation, { isLoading: updatingPin }] = useUpdateAccountPinMutation();

  const [isOpenNewModal, setIsOpenNewModal] = useState(false);
  const [newAccType, setNewAccType] = useState("savings");
  const [newAccDeposit, setNewAccDeposit] = useState(250);
  const [newAccPin, setNewAccPin] = useState("1234");

  const [pinModalAccount, setPinModalAccount] = useState<any | null>(null);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Account number copied!");
  };

  const handleOpenAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{4,6}$/.test(newAccPin.trim())) {
      toast.error("Transaction PIN must be 4 to 6 numeric digits.");
      return;
    }
    try {
      await createAccountMutation({
        accountType: newAccType,
        initialDeposit: Number(newAccDeposit),
        transactionPin: newAccPin.trim(),
      }).unwrap();
      toast.success(`New ${newAccType.toUpperCase()} Account successfully created!`);
      setIsOpenNewModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to open new account.");
    }
  };

  const handleUpdatePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinModalAccount) return;
    if (!/^[0-9]{4,6}$/.test(newPin.trim())) {
      toast.error("New PIN must be 4 to 6 numeric digits.");
      return;
    }
    try {
      await updatePinMutation({
        accountId: pinModalAccount._id,
        currentPin: currentPin.trim(),
        newPin: newPin.trim(),
      }).unwrap();
      toast.success("Transaction PIN updated successfully.");
      setPinModalAccount(null);
      setCurrentPin("");
      setNewPin("");
    } catch (err: any) {
      toast.error(err?.data?.message || "PIN update failed. Check current PIN.");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-600 border border-brand-200/70 dark:bg-brand-950/60 dark:text-brand-400 dark:border-brand-800 mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            Portfolio Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Institutional Bank Accounts
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your Savings, Current, and Commercial Business balances
          </p>
        </div>

        <button
          onClick={() => setIsOpenNewModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full btn-azure font-bold text-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Open Another Account</span>
        </button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => {
          const isSelected = selectedAccount?._id === acc._id;
          return (
            <div
              key={acc._id}
              className={`rounded-3xl p-6 border transition flex flex-col justify-between ${
                isSelected
                  ? "bg-gradient-to-b from-brand-50/80 to-white dark:from-brand-950/30 dark:to-navy-900 border-brand-400 ring-2 ring-brand-400/25 shadow-glass-card"
                  : "glass-surface"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 font-mono">
                    {acc.accountType} Account
                  </span>
                  <Badge variant={acc.status === "active" ? "success" : "danger"} size="sm">
                    {acc.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span>{acc.accountNumber}</span>
                  <button
                    onClick={() => copyToClipboard(acc.accountNumber)}
                    className="p-1 hover:text-slate-800 dark:hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="my-5">
                  <span className="text-xs text-slate-400">Available Balance</span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                    {formatCurrency(acc.balance)}
                  </div>
                </div>

                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Daily Limit:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(acc.dailyTransferLimit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Single Transfer Limit:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(acc.maxSingleTransferLimit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Required Reserve:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(acc.minBalance)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    dispatch(setSelectedAccount(acc));
                    toast.success(`Active account set to ${acc.accountType.toUpperCase()}`);
                  }}
                  className={`text-xs font-bold transition ${
                    isSelected
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {isSelected ? "Active Account ✓" : "Set as Active"}
                </button>

                <button
                  onClick={() => setPinModalAccount(acc)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 transition"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Change PIN</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: OPEN NEW ACCOUNT */}
      <Modal
        isOpen={isOpenNewModal}
        onClose={() => setIsOpenNewModal(false)}
        title="Open Additional Bank Account"
        description="Choose between Savings, Current, or Commercial Business account"
        maxWidth="md"
      >
        <form onSubmit={handleOpenAccountSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Account Type
            </label>
            <select
              value={newAccType}
              onChange={(e) => setNewAccType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-semibold"
            >
              <option value="savings">Savings Account (High-yield interest)</option>
              <option value="current">Current Account (Unlimited daily transactions)</option>
              <option value="business">Business Account (Higher single transfer limit)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Initial Deposit ($)
            </label>
            <input
              type="number"
              min="50"
              value={newAccDeposit}
              onChange={(e) => setNewAccDeposit(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Security Transaction PIN (4-6 digits)
            </label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={newAccPin}
              onChange={(e) => setNewAccPin(e.target.value)}
              placeholder="1234"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono tracking-widest text-center"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpenNewModal(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 rounded-full text-sm font-bold btn-azure"
            >
              {creating ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: CHANGE TRANSACTION PIN */}
      <Modal
        isOpen={Boolean(pinModalAccount)}
        onClose={() => setPinModalAccount(null)}
        title="Update Security Transaction PIN"
        description={`Modify PIN for account ${pinModalAccount?.accountNumber}`}
        maxWidth="sm"
      >
        <form onSubmit={handleUpdatePinSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Current PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              required
              maxLength={6}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              placeholder="••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono tracking-widest text-center"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              New 4-6 Digit PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              required
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono tracking-widest text-center"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPinModalAccount(null)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingPin}
              className="px-4 py-2 rounded-full text-sm font-bold btn-azure"
            >
              {updatingPin ? "Updating..." : "Save New PIN"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
