"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  useGetAdminAnalyticsQuery,
  useGetAllCustomersQuery,
  useGetAllAccountsQuery,
  useGetAllLoansQuery,
  useGetAllRequestsQuery,
  useGetAllTransactionsQuery,
  useUpdateCustomerStatusMutation,
  useUpdateAccountStatusMutation,
  useSetAccountLimitsMutation,
  useApproveLoanAdminMutation,
  useRejectLoanAdminMutation,
  useReviewRequestMutation,
  useFlagTransactionMutation,
  useGetCustomerDetailsQuery,
} from "@/redux/api/apiSlice";
import { AdminOverviewCharts } from "@/components/charts/AdminOverviewCharts";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Users,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  FileText,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Eye,
  Sliders,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Queries
  const { data: analyticsData, isLoading: analyticsLoading } = useGetAdminAnalyticsQuery();
  const { data: customersData, refetch: refetchCustomers } = useGetAllCustomersQuery();
  const { data: accountsData, refetch: refetchAccounts } = useGetAllAccountsQuery();
  const { data: loansData, refetch: refetchLoans } = useGetAllLoansQuery();
  const { data: requestsData, refetch: refetchRequests } = useGetAllRequestsQuery();
  const { data: transactionsData } = useGetAllTransactionsQuery();

  // Mutations
  const [updateCustomerStatus] = useUpdateCustomerStatusMutation();
  const [updateAccountStatus] = useUpdateAccountStatusMutation();
  const [setLimits] = useSetAccountLimitsMutation();
  const [approveLoan] = useApproveLoanAdminMutation();
  const [rejectLoan] = useRejectLoanAdminMutation();
  const [reviewRequest] = useReviewRequestMutation();
  const [flagTxn] = useFlagTransactionMutation();

  // Filter & Search states
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerStatusFilter, setCustomerStatusFilter] = useState("");
  const [accountSearch, setAccountSearch] = useState("");
  const [loanStatusFilter, setLoanStatusFilter] = useState("");

  // Modals state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [limitsModalAccount, setLimitsModalAccount] = useState<any | null>(null);
  const [limitsForm, setLimitsForm] = useState({ daily: 10000, single: 5000, min: 50 });
  const [approveLoanModalData, setApproveLoanModalData] = useState<any | null>(null);
  const [approveLoanForm, setApproveLoanForm] = useState({ amount: 0, rate: 6.5 });
  const [rejectLoanId, setRejectLoanId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Customer Details Query
  const { data: customerDetailsData } = useGetCustomerDetailsQuery(selectedCustomerId || "", {
    skip: !selectedCustomerId,
  });

  const overview = analyticsData?.overview || {
    totalCustomers: 0,
    totalAccounts: 0,
    totalBankBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTransactions: 0,
    pendingLoansCount: 0,
    pendingRequestsCount: 0,
  };

  // Handlers
  const handleCustomerStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateCustomerStatus({ id, status: newStatus }).unwrap();
      toast.success(`Customer status updated to ${newStatus.toUpperCase()}`);
      refetchCustomers();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const handleAccountStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateAccountStatus({ id, status: newStatus }).unwrap();
      toast.success(`Account marked as ${newStatus.toUpperCase()}`);
      refetchAccounts();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update account status");
    }
  };

  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitsModalAccount) return;
    try {
      await setLimits({
        id: limitsModalAccount._id,
        dailyTransferLimit: Number(limitsForm.daily),
        maxSingleTransferLimit: Number(limitsForm.single),
        minBalance: Number(limitsForm.min),
      }).unwrap();
      toast.success("Account limits updated successfully");
      setLimitsModalAccount(null);
      refetchAccounts();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update limits");
    }
  };

  const handleApproveLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveLoanModalData) return;
    try {
      await approveLoan({
        id: approveLoanModalData._id,
        approvedAmount: Number(approveLoanForm.amount),
        interestRate: Number(approveLoanForm.rate),
      }).unwrap();
      toast.success("Loan approved and funds disbursed to customer account!");
      setApproveLoanModalData(null);
      refetchLoans();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to approve loan");
    }
  };

  const handleRejectLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectLoanId) return;
    try {
      await rejectLoan({ id: rejectLoanId, reason: rejectReason }).unwrap();
      toast.success("Loan application declined.");
      setRejectLoanId(null);
      setRejectReason("");
      refetchLoans();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reject loan");
    }
  };

  const handleReviewRequest = async (id: string, action: "approve" | "reject") => {
    try {
      await reviewRequest({ id, action }).unwrap();
      toast.success(`Request ${action === "approve" ? "approved & balance settled" : "rejected"}`);
      refetchRequests();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to review request");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Executive Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Institutional Bank Operations
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time oversight of customer portfolios, bank balances, underwriting and transaction safety
          </p>
        </div>

        {/* Global Stats Refresh Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live Ledger Synchronized
          </span>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bank Reserves</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(overview.totalBankBalance)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all client deposit accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Customers</span>
            <Users className="w-5 h-5 text-brand-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {overview.totalCustomers.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {overview.totalAccounts} total bank accounts active
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cumulative Inflows</span>
            <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(overview.totalDeposits)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Outflows: {formatCurrency(overview.totalWithdrawals)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Action</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {overview.pendingLoansCount + overview.pendingRequestsCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {overview.pendingLoansCount} loans, {overview.pendingRequestsCount} cash requests
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex overflow-x-auto space-x-6 text-sm font-semibold">
        {[
          { id: "overview", label: "Analytics & Charts" },
          { id: "customers", label: `Customers (${customersData?.total || 0})` },
          { id: "accounts", label: `Bank Accounts (${accountsData?.total || 0})` },
          { id: "loans", label: `Loan Applications (${loansData?.total || 0})` },
          { id: "requests", label: `Deposit / Withdrawals (${requestsData?.total || 0})` },
          { id: "audit", label: "Security & Flagged" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 transition border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & DATA VISUALIZATIONS */}
      {activeTab === "overview" && analyticsData && (
        <div className="space-y-6">
          <AdminOverviewCharts analytics={analyticsData} />
        </div>
      )}

      {/* TAB 2: CUSTOMER MANAGEMENT */}
      {activeTab === "customers" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={customerStatusFilter}
                onChange={(e) => setCustomerStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="deactivated">Deactivated</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Contact</th>
                  <th className="py-3.5 px-6">Accounts</th>
                  <th className="py-3.5 px-6">Total Balance</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(customersData?.customers || [])
                  .filter((c: any) => {
                    const matchSearch =
                      !customerSearch ||
                      c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      c.email?.toLowerCase().includes(customerSearch.toLowerCase());
                    const matchStatus = !customerStatusFilter || c.status === customerStatusFilter;
                    return matchSearch && matchStatus;
                  })
                  .map((customer: any) => (
                    <tr key={customer._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {customer.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{customer.email}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs">
                        {customer.phone || "No phone"}
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        {customer.accountsCount || 1} accounts
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(customer.totalBalance)}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={
                            customer.status === "active"
                              ? "success"
                              : customer.status === "blocked"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {customer.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => setSelectedCustomerId(customer._id)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-600 transition"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {customer.status !== "active" ? (
                          <button
                            onClick={() => handleCustomerStatusChange(customer._id, "active")}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-100 transition"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCustomerStatusChange(customer._id, "deactivated")}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 hover:bg-amber-100 transition"
                          >
                            Deactivate
                          </button>
                        )}
                        {customer.status !== "blocked" && (
                          <button
                            onClick={() => handleCustomerStatusChange(customer._id, "blocked")}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 hover:bg-rose-100 transition"
                          >
                            Block
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BANK ACCOUNT MANAGEMENT */}
      {activeTab === "accounts" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Institutional Bank Accounts Registry
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total Accounts: {accountsData?.accounts?.length || 0}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Account Number</th>
                  <th className="py-3.5 px-6">Account Holder</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Balance</th>
                  <th className="py-3.5 px-6">Daily Limit</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(accountsData?.accounts || []).map((acc: any) => (
                  <tr key={acc._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white">
                      {acc.accountNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold">{acc.userId?.name || "Customer"}</div>
                      <div className="text-xs text-slate-400 font-mono">{acc.userId?.email}</div>
                    </td>
                    <td className="py-4 px-6 capitalize font-medium">{acc.accountType}</td>
                    <td className="py-4 px-6 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(acc.balance)}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">
                      {formatCurrency(acc.dailyTransferLimit)} / day
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={acc.status === "active" ? "success" : "danger"}>
                        {acc.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => {
                          setLimitsModalAccount(acc);
                          setLimitsForm({
                            daily: acc.dailyTransferLimit || 10000,
                            single: acc.maxSingleTransferLimit || 5000,
                            min: acc.minBalance || 50,
                          });
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-600 transition"
                        title="Set Transaction Limits"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>
                      {acc.status === "active" ? (
                        <button
                          onClick={() => handleAccountStatusChange(acc._id, "frozen")}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 hover:bg-rose-100 transition"
                        >
                          Freeze
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAccountStatusChange(acc._id, "active")}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-100 transition"
                        >
                          Unfreeze
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LOAN UNDERWRITING & APPROVALS */}
      {activeTab === "loans" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Underwriting & Loan Applications
              </h3>
              <p className="text-xs text-slate-500">
                Review applicant qualifications, staff forwardings, approve disbursement or reject
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Loan ID</th>
                  <th className="py-3.5 px-6">Applicant</th>
                  <th className="py-3.5 px-6">Type & Term</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Staff Review Notes</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(loansData?.loans || []).map((loan: any) => (
                  <tr key={loan._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-6 font-mono font-bold">{loan.loanId}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold">{loan.userId?.name}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        Income: {formatCurrency(loan.monthlyIncome)}/mo
                      </div>
                    </td>
                    <td className="py-4 px-6 capitalize">
                      <span className="font-bold">{loan.loanType}</span>
                      <div className="text-xs text-slate-500">{loan.durationMonths} months</div>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(loan.requestedAmount)}
                    </td>
                    <td className="py-4 px-6 max-w-xs text-xs text-slate-600 dark:text-slate-400">
                      {loan.staffNotes ? (
                        <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 font-mono text-[11px]">
                          {loan.staffNotes}
                        </div>
                      ) : (
                        <span className="italic text-slate-400">No notes added</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          loan.status === "active" || loan.status === "approved"
                            ? "success"
                            : loan.status === "rejected"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {loan.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {loan.status === "pending" || loan.status === "under_review" ? (
                        <>
                          <button
                            onClick={() => {
                              setApproveLoanModalData(loan);
                              setApproveLoanForm({
                                amount: loan.requestedAmount,
                                rate: loan.interestRate || 6.5,
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          >
                            Approve & Disburse
                          </button>
                          <button
                            onClick={() => setRejectLoanId(loan._id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 hover:bg-rose-100 transition"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DEPOSIT & WITHDRAWAL REQUESTS */}
      {activeTab === "requests" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Customer Deposit & Cash Withdrawal Queue
            </h3>
            <p className="text-xs text-slate-500">
              Staff approval simulator for over-the-counter and wire requests
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Request ID</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Account</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(requestsData?.requests || []).map((req: any) => (
                  <tr key={req._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-6 font-mono font-bold">{req.requestId}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold">{req.userId?.name}</div>
                      <div className="text-xs text-slate-400">{req.userId?.email}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">
                      {req.accountId?.accountNumber}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs font-bold uppercase ${
                          req.type === "deposit" ? "text-emerald-500" : "text-brand-500"
                        }`}
                      >
                        {req.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(req.amount)}
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          req.status === "approved"
                            ? "success"
                            : req.status === "rejected"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {req.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {req.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleReviewRequest(req._id, "approve")}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewRequest(req._id, "reject")}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 hover:bg-rose-100 transition"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY & SUSPICIOUS TRANSACTIONS */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Flagged Suspicious Transactions & AML Audit
            </h3>
            <p className="text-xs text-slate-500">
              Rule-based alerts triggered by velocity thresholds or manual bank staff flagging
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Transaction ID</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Sender / Receiver</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Flag Reason</th>
                  <th className="py-3.5 px-6 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(transactionsData?.transactions || [])
                  .filter((t: any) => t.isFlagged)
                  .map((txn: any) => (
                    <tr key={txn._id} className="hover:bg-rose-50/20 dark:hover:bg-rose-950/10">
                      <td className="py-4 px-6 font-mono font-bold text-rose-600 dark:text-rose-400">
                        {txn.transactionId}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">{formatDate(txn.createdAt)}</td>
                      <td className="py-4 px-6 text-xs">
                        <div>From: {txn.senderAccountNumber || "Counter"}</div>
                        <div>To: {txn.receiverAccountNumber || "N/A"}</div>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="py-4 px-6 text-xs text-rose-600 dark:text-rose-400 font-mono">
                        {txn.flaggedReason || "High risk transaction pattern"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={async () => {
                            await flagTxn({ id: txn._id, isFlagged: false }).unwrap();
                            toast.success("Flag removed and cleared by Administrator.");
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                        >
                          Clear Flag
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CUSTOMER FULL PROFILE & AUDIT */}
      <Modal
        isOpen={Boolean(selectedCustomerId)}
        onClose={() => setSelectedCustomerId(null)}
        title="Comprehensive Customer Dossier"
        description="Verified identity, active financial accounts, and transaction records"
        maxWidth="xl"
      >
        {customerDetailsData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
              <div>
                <span className="text-slate-400">Name:</span>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {customerDetailsData.customer.name}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Email:</span>
                <div className="font-mono text-slate-800 dark:text-slate-200">
                  {customerDetailsData.customer.email}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Phone:</span>
                <div className="text-slate-800 dark:text-slate-200">
                  {customerDetailsData.customer.phone || "N/A"}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Address:</span>
                <div className="text-slate-800 dark:text-slate-200">
                  {customerDetailsData.customer.address || "N/A"}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Active Bank Accounts
              </h4>
              <div className="space-y-2">
                {customerDetailsData.accounts.map((acc: any) => (
                  <div
                    key={acc._id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-sm">{acc.accountNumber}</span>
                      <span className="ml-2 uppercase text-slate-500 font-semibold">
                        ({acc.accountType})
                      </span>
                    </div>
                    <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(acc.balance)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: SET TRANSACTION LIMITS */}
      <Modal
        isOpen={Boolean(limitsModalAccount)}
        onClose={() => setLimitsModalAccount(null)}
        title="Account Policy Limits"
        description={`Set transaction ceilings for account ${limitsModalAccount?.accountNumber}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveLimits} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Daily Transfer Limit ($)
            </label>
            <input
              type="number"
              value={limitsForm.daily}
              onChange={(e) => setLimitsForm({ ...limitsForm, daily: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Maximum Single Transfer Amount ($)
            </label>
            <input
              type="number"
              value={limitsForm.single}
              onChange={(e) => setLimitsForm({ ...limitsForm, single: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Minimum Required Balance ($)
            </label>
            <input
              type="number"
              value={limitsForm.min}
              onChange={(e) => setLimitsForm({ ...limitsForm, min: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setLimitsModalAccount(null)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white"
            >
              Save Policy Limits
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: APPROVE LOAN & DISBURSE */}
      <Modal
        isOpen={Boolean(approveLoanModalData)}
        onClose={() => setApproveLoanModalData(null)}
        title="Approve & Disburse Loan"
        description={`Confirm underwriting terms and disburse funds for Loan ${approveLoanModalData?.loanId}`}
        maxWidth="md"
      >
        <form onSubmit={handleApproveLoanSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
            <div>
              Applicant: <span className="font-bold">{approveLoanModalData?.userId?.name}</span>
            </div>
            <div>
              Requested Amount:{" "}
              <span className="font-bold font-mono">
                {formatCurrency(approveLoanModalData?.requestedAmount)}
              </span>
            </div>
            <div>
              Tenor: <span className="font-bold">{approveLoanModalData?.durationMonths} months</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Final Approved Amount ($)
            </label>
            <input
              type="number"
              value={approveLoanForm.amount}
              onChange={(e) => setApproveLoanForm({ ...approveLoanForm, amount: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Annual Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={approveLoanForm.rate}
              onChange={(e) => setApproveLoanForm({ ...approveLoanForm, rate: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setApproveLoanModalData(null)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Authorize Disbursement
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: REJECT LOAN */}
      <Modal
        isOpen={Boolean(rejectLoanId)}
        onClose={() => setRejectLoanId(null)}
        title="Decline Loan Application"
        description="Provide justification for institutional underwriting record"
        maxWidth="md"
      >
        <form onSubmit={handleRejectLoanSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Rejection Reason
            </label>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Debt-to-income ratio exceeds institutional credit ceiling."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectLoanId(null)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
