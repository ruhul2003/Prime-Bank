"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/redux/store";
import {
  useGetMyLoansQuery,
  useApplyLoanMutation,
  usePayLoanInstallmentMutation,
} from "@/redux/api/apiSlice";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  FileText,
  DollarSign,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Percent,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CustomerLoansPage() {
  const { accounts, selectedAccount } = useAppSelector((state) => state.account);

  const { data: loansData, refetch } = useGetMyLoansQuery();
  const [applyMutation, { isLoading: applying }] = useApplyLoanMutation();
  const [payInstallmentMutation, { isLoading: paying }] = usePayLoanInstallmentMutation();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [scheduleModalLoan, setScheduleModalLoan] = useState<any | null>(null);

  // Application Form State
  const [formData, setFormData] = useState({
    accountId: selectedAccount?._id || accounts[0]?._id || "",
    loanType: "personal",
    requestedAmount: 5000,
    durationMonths: 12,
    monthlyIncome: 6500,
    employmentStatus: "Full-Time Employed",
    description: "",
  });

  const rateMap: Record<string, number> = {
    personal: 7.5,
    business: 6.0,
    home: 4.5,
    education: 5.0,
  };
  const currentRate = rateMap[formData.loanType] || 6.5;

  // Live EMI Calculator
  const calculateEMI = (principal: number, rate: number, months: number) => {
    const r = rate / 100 / 12;
    if (r === 0) return principal / months;
    return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  };

  const estimatedEMI = calculateEMI(formData.requestedAmount, currentRate, formData.durationMonths);
  const estimatedTotal = estimatedEMI * formData.durationMonths;

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId) {
      toast.error("Please select an account for disbursement.");
      return;
    }

    try {
      await applyMutation(formData).unwrap();
      toast.success("Loan application submitted for Underwriting review!");
      setIsApplyModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit loan application.");
    }
  };

  const handlePayInstallment = async (loanId: string, installmentNumber: number) => {
    try {
      await payInstallmentMutation({ id: loanId, installmentNumber }).unwrap();
      toast.success(`Installment #${installmentNumber} paid successfully!`);
      refetch();
      // Update schedule modal view if open
      if (scheduleModalLoan && scheduleModalLoan._id === loanId) {
        const updated = loansData?.loans.find((l) => l._id === loanId);
        if (updated) setScheduleModalLoan(updated);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Payment failed. Check account balance.");
    }
  };

  const loans = loansData?.loans || [];
  const activeLoans = loans.filter((l) => l.status === "active");
  const totalDebt = activeLoans.reduce((sum, l) => sum + (l.remainingBalance || 0), 0);
  const totalMonthlyObligation = activeLoans.reduce((sum, l) => sum + (l.monthlyInstallment || 0), 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 mb-2">
            <FileText className="w-3.5 h-3.5" />
            Credit Facilities & Term Financing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Institutional Loans & Credit
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Transparent interest rates, amortized installment repayment schedules, and automated underwriting
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition self-start sm:self-auto"
        >
          <span>Apply for New Loan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Remaining Debt</span>
            <TrendingDown className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalDebt)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{activeLoans.length} active loan facilities</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Obligation</span>
            <DollarSign className="w-5 h-5 text-brand-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalMonthlyObligation)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Due next billing cycle</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Underwriting Status</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            {loans.filter((l) => l.status === "pending" || l.status === "under_review").length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Applications in queue</p>
        </div>
      </div>

      {/* Loans List */}
      <div className="space-y-6">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
          Your Credit Accounts & Applications
        </h3>

        {loans.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h4 className="font-bold text-slate-900 dark:text-white text-base">No Loans Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              You do not have any active or pending loan applications with PrimeBank.
            </p>
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs"
            >
              Start an Application
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loans.map((loan: any) => {
              const paidAmount = (loan.approvedAmount || loan.requestedAmount) - (loan.remainingBalance || 0);
              const progressPct = loan.approvedAmount > 0
                ? Math.min(100, Math.max(0, Math.round((paidAmount / loan.approvedAmount) * 100)))
                : 0;

              return (
                <div
                  key={loan._id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {loan.loanId}
                      </span>
                      <Badge
                        variant={
                          loan.status === "active"
                            ? "success"
                            : loan.status === "completed"
                            ? "info"
                            : loan.status === "rejected"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {loan.status}
                      </Badge>
                    </div>

                    <h4 className="text-xl font-extrabold capitalize text-slate-900 dark:text-white">
                      {loan.loanType} Financing
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{loan.description || "General facility"}</p>

                    <div className="grid grid-cols-2 gap-4 my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                      <div>
                        <span className="text-slate-400">Original Amount:</span>
                        <div className="font-bold font-mono text-sm text-slate-900 dark:text-white mt-0.5">
                          {formatCurrency(loan.approvedAmount || loan.requestedAmount)}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Interest Rate:</span>
                        <div className="font-bold font-mono text-sm text-slate-900 dark:text-white mt-0.5">
                          {loan.interestRate}% APR
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Monthly EMI:</span>
                        <div className="font-bold font-mono text-sm text-brand-600 dark:text-brand-400 mt-0.5">
                          {formatCurrency(loan.monthlyInstallment)}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Remaining Balance:</span>
                        <div className="font-bold font-mono text-sm text-purple-600 dark:text-purple-400 mt-0.5">
                          {formatCurrency(loan.remainingBalance)}
                        </div>
                      </div>
                    </div>

                    {/* Repayment Progress */}
                    {loan.status === "active" && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">Principal Amortization</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {progressPct}% Settled
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setScheduleModalLoan(loan)}
                      className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                    >
                      <span>View Amortization Schedule</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {loan.status === "active" && (
                      <button
                        disabled={paying}
                        onClick={() => {
                          const nextPending = loan.repaymentSchedule?.find(
                            (s: any) => s.status === "pending"
                          );
                          if (nextPending) {
                            handlePayInstallment(loan._id, nextPending.installmentNumber);
                          } else {
                            toast.success("All installments paid!");
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition"
                      >
                        Pay Next Installment
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: APPLY FOR LOAN WITH EMI CALCULATOR */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Term Loan Facility"
        description="Institutional underwriting with immediate amortization preview"
        maxWidth="lg"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Loan Classification
              </label>
              <select
                value={formData.loanType}
                onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-semibold"
              >
                <option value="personal">Personal Loan (7.5% APR)</option>
                <option value="business">Commercial Business Loan (6.0% APR)</option>
                <option value="home">Residential Home Loan (4.5% APR)</option>
                <option value="education">Higher Education Loan (5.0% APR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Disbursement Account
              </label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium"
              >
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.accountType.toUpperCase()} ({acc.accountNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Requested Amount ($)
              </label>
              <input
                type="number"
                min="500"
                step="500"
                value={formData.requestedAmount}
                onChange={(e) =>
                  setFormData({ ...formData, requestedAmount: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Tenor / Duration ({formData.durationMonths} Months)
              </label>
              <input
                type="range"
                min="6"
                max="60"
                step="6"
                value={formData.durationMonths}
                onChange={(e) =>
                  setFormData({ ...formData, durationMonths: Number(e.target.value) })
                }
                className="w-full accent-brand-600 mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Stated Monthly Income ($)
              </label>
              <input
                type="number"
                min="500"
                value={formData.monthlyIncome}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyIncome: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Employment Status
              </label>
              <input
                type="text"
                value={formData.employmentStatus}
                onChange={(e) =>
                  setFormData({ ...formData, employmentStatus: e.target.value })
                }
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Purpose of Loan
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Working capital, Property renovation, Tuition"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
            />
          </div>

          {/* Dynamic Live EMI Calculation Preview */}
          <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Estimated Monthly Payment</span>
              <div className="text-2xl font-extrabold font-mono text-brand-700 dark:text-brand-300 mt-0.5">
                {formatCurrency(estimatedEMI)} / mo
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400">Total Repayment</span>
              <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                {formatCurrency(estimatedTotal)}
              </div>
              <span className="text-[10px] text-slate-400">({currentRate}% annual interest)</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applying}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20"
            >
              {applying ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: REPAYMENT AMORTIZATION SCHEDULE */}
      <Modal
        isOpen={Boolean(scheduleModalLoan)}
        onClose={() => setScheduleModalLoan(null)}
        title={`Repayment Schedule - ${scheduleModalLoan?.loanId}`}
        description={`Amortization schedule for ${scheduleModalLoan?.durationMonths} monthly installments`}
        maxWidth="lg"
      >
        {scheduleModalLoan && (
          <div className="space-y-4">
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(scheduleModalLoan.repaymentSchedule || []).map((item: any) => (
                    <tr key={item.installmentNumber} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold">{item.installmentNumber}</td>
                      <td className="py-2.5 px-3">{formatDate(item.dueDate)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">{formatCurrency(item.amount)}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={item.status === "paid" ? "success" : "warning"} size="sm">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.status === "pending" && scheduleModalLoan.status === "active" ? (
                          <button
                            onClick={() =>
                              handlePayInstallment(
                                scheduleModalLoan._id,
                                item.installmentNumber
                              )
                            }
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-600 text-white hover:bg-brand-700"
                          >
                            Pay
                          </button>
                        ) : item.status === "paid" ? (
                          <span className="text-[11px] text-emerald-500 font-medium">Settled</span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Scheduled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
