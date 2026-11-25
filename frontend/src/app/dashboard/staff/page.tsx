"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetAllCustomersQuery,
  useGetAllAccountsQuery,
  useGetAllTransactionsQuery,
  useGetAllLoansQuery,
  useGetAllRequestsQuery,
  useOnboardCustomerMutation,
  useReviewLoanStaffMutation,
  useReviewRequestMutation,
  useFlagTransactionMutation,
} from "@/redux/api/apiSlice";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAppDispatch } from "@/redux/store";
import { setSelectedTransaction } from "@/redux/slices/transactionSlice";
import {
  Users,
  CreditCard,
  History,
  FileText,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  PlusCircle,
  AlertTriangle,
  Receipt,
  UserPlus,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

function StaffDashboardContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab") || "transactions";
  const [activeTab, setActiveTab] = useState(urlTab);

  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.replace(tabId === "transactions" ? "/dashboard/staff" : `/dashboard/staff?tab=${tabId}`, {
      scroll: false,
    });
  };

  // Queries
  const { data: customersData, refetch: refetchCustomers } = useGetAllCustomersQuery();
  const { data: transactionsData, refetch: refetchTransactions } = useGetAllTransactionsQuery();
  const { data: loansData, refetch: refetchLoans } = useGetAllLoansQuery();
  const { data: requestsData, refetch: refetchRequests } = useGetAllRequestsQuery();

  // Mutations
  const [onboardCustomer, { isLoading: onboardingLoading }] = useOnboardCustomerMutation();
  const [reviewLoan] = useReviewLoanStaffMutation();
  const [reviewRequest] = useReviewRequestMutation();
  const [flagTxn] = useFlagTransactionMutation();

  // Onboarding Form
  const [onboardForm, setOnboardForm] = useState({
    name: "",
    email: "",
    password: "TempPassword123!",
    phone: "",
    address: "",
    accountType: "savings",
    initialDeposit: 500,
  });

  // Transaction Search & Filter
  const [txnSearch, setTxnSearch] = useState("");
  const [txnTypeFilter, setTxnTypeFilter] = useState("");
  const [txnStatusFilter, setTxnStatusFilter] = useState("");

  // Flag Suspicious Modal
  const [flagModalTxn, setFlagModalTxn] = useState<any | null>(null);
  const [flagReason, setFlagReason] = useState("");

  // Staff Loan Review Modal
  const [staffLoanModal, setStaffLoanModal] = useState<any | null>(null);
  const [staffNotes, setStaffNotes] = useState("");
  const [forwardApproval, setForwardApproval] = useState(true);

  // Handlers
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onboardCustomer(onboardForm).unwrap();
      toast.success("New customer successfully registered and account issued!");
      setOnboardForm({
        name: "",
        email: "",
        password: "TempPassword123!",
        phone: "",
        address: "",
        accountType: "savings",
        initialDeposit: 500,
      });
      refetchCustomers();
    } catch (err: any) {
      toast.error(err?.data?.message || "Customer onboarding failed.");
    }
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagModalTxn) return;
    try {
      await flagTxn({
        id: flagModalTxn._id,
        isFlagged: true,
        reason: flagReason || "Flagged for Compliance and AML Review by Bank Staff.",
      }).unwrap();
      toast.success("Transaction flagged for Admin Compliance Review.");
      setFlagModalTxn(null);
      setFlagReason("");
      refetchTransactions();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to flag transaction");
    }
  };

  const handleStaffLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffLoanModal) return;
    try {
      await reviewLoan({
        id: staffLoanModal._id,
        staffNotes,
        forwardForApproval: forwardApproval,
      }).unwrap();
      toast.success(
        forwardApproval
          ? "Loan validated and forwarded for Admin Executive Approval."
          : "Internal notes saved."
      );
      setStaffLoanModal(null);
      setStaffNotes("");
      refetchLoans();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit loan review");
    }
  };

  const handleReviewRequest = async (id: string, action: "approve" | "reject") => {
    try {
      await reviewRequest({ id, action }).unwrap();
      toast.success(`Request ${action === "approve" ? "approved & balance settled" : "declined"}`);
      refetchRequests();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to review request");
    }
  };

  const transactions = transactionsData?.transactions || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 mb-2">
            <Users className="w-3.5 h-3.5" />
            Branch Operations Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bank Staff Workstation
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Customer onboarding, transaction audit & AML monitoring, and credit underwriting assistance
          </p>
        </div>
      </div>

      {/* Staff Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-surface">
          <span className="text-xs font-bold uppercase text-slate-400">Total Customers</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {customersData?.total || 0}
          </div>
        </div>
        <div className="p-5 rounded-3xl glass-surface">
          <span className="text-xs font-bold uppercase text-slate-400">Transactions Audited</span>
          <div className="text-2xl font-extrabold text-brand-500 dark:text-brand-400 mt-1">
            {transactions.length}
          </div>
        </div>
        <div className="p-5 rounded-3xl glass-surface">
          <span className="text-xs font-bold uppercase text-slate-400">Loans to Review</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {(loansData?.loans || []).filter((l: any) => l.status === "pending").length}
          </div>
        </div>
        <div className="p-5 rounded-3xl glass-surface">
          <span className="text-xs font-bold uppercase text-slate-400">Cash Requests</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {(requestsData?.requests || []).filter((r: any) => r.status === "pending").length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-1.5 rounded-2xl glass-panel flex overflow-x-auto gap-1.5 text-sm font-semibold">
        {[
          { id: "transactions", label: "Transaction Desk & AML" },
          { id: "onboard", label: "Customer Onboarding" },
          { id: "loans", label: "Loan Underwriting Desk" },
          { id: "requests", label: "Customer Cash Requests" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-sky-50 text-sky-700 border border-sky-200/80 shadow-sm dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/70 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:bg-sky-50/50 dark:hover:bg-slate-800/50 hover:text-sky-700 dark:hover:text-white border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: TRANSACTION MANAGEMENT & AML MONITORING */}
      {activeTab === "transactions" && (
        <div className="glass-panel rounded-3xl overflow-hidden">
          {/* Search & Filters */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
                placeholder="Search transaction ID, account #..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={txnTypeFilter}
                onChange={(e) => setTxnTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="transfer">Fund Transfers</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="loan_disbursement">Loan Disbursements</option>
                <option value="loan_repayment">Loan Repayments</option>
              </select>

              <select
                value={txnStatusFilter}
                onChange={(e) => setTxnStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Transaction ID</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Source / Destination</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions
                  .filter((t: any) => {
                    const matchSearch =
                      !txnSearch ||
                      t.transactionId?.toLowerCase().includes(txnSearch.toLowerCase()) ||
                      t.senderAccountNumber?.includes(txnSearch) ||
                      t.receiverAccountNumber?.includes(txnSearch);
                    const matchType = !txnTypeFilter || t.type === txnTypeFilter;
                    const matchStatus = !txnStatusFilter || t.status === txnStatusFilter;
                    return matchSearch && matchType && matchStatus;
                  })
                  .map((t: any) => (
                    <tr
                      key={t._id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                        t.isFlagged ? "bg-rose-50/30 dark:bg-rose-950/20" : ""
                      }`}
                    >
                      <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {t.isFlagged && <ShieldAlert className="w-4 h-4 text-rose-500" />}
                        <span>{t.transactionId}</span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">{formatDate(t.createdAt)}</td>
                      <td className="py-4 px-6 uppercase text-xs font-semibold">{t.type}</td>
                      <td className="py-4 px-6 text-xs font-mono">
                        <div>From: {t.senderAccountNumber || "Counter"}</div>
                        <div>To: {t.receiverAccountNumber || "N/A"}</div>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(t.amount)}
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
                        >
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => dispatch(setSelectedTransaction(t))}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-600 transition"
                          title="View Official Receipt"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                        {t.isFlagged ? (
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                            Flagged
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setFlagModalTxn(t);
                              setFlagReason("Unusual transaction velocity or high transfer amount.");
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 hover:bg-amber-100 transition"
                          >
                            Flag Suspicious
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

      {/* TAB 2: CUSTOMER ONBOARDING */}
      {activeTab === "onboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 glass-panel p-6 rounded-3xl">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              Onboard New Customer
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Create customer credentials and assign initial account
            </p>

            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={onboardForm.name}
                  onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                  placeholder="e.g. David Mitchell"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={onboardForm.email}
                  onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                  placeholder="david@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={onboardForm.phone}
                  onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                  placeholder="+1 (555) 723-9912"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Account Type
                </label>
                <select
                  value={onboardForm.accountType}
                  onChange={(e) => setOnboardForm({ ...onboardForm, accountType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                >
                  <option value="savings">Savings Account</option>
                  <option value="current">Current Account</option>
                  <option value="business">Business Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Opening Balance ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={onboardForm.initialDeposit}
                  onChange={(e) => setOnboardForm({ ...onboardForm, initialDeposit: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={onboardingLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register & Issue Account</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl overflow-hidden">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
              Registered Customers Registry
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold text-xs uppercase">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Accounts</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(customersData?.customers || []).map((c: any) => (
                    <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold">{c.name}</td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-400">{c.email}</td>
                      <td className="py-3 px-4 text-xs">{c.accountsCount || 1} accounts</td>
                      <td className="py-3 px-4">
                        <Badge variant={c.status === "active" ? "success" : "danger"}>
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOAN ASSISTANCE & PRELIMINARY REVIEW */}
      {activeTab === "loans" && (
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Credit Assistance & Application Review
            </h3>
            <p className="text-xs text-slate-500">
              Verify borrower proof-of-income, attach internal underwriting notes, and forward for Admin decision
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-6">Loan ID</th>
                  <th className="py-3.5 px-6">Applicant</th>
                  <th className="py-3.5 px-6">Income</th>
                  <th className="py-3.5 px-6">Amount & Type</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(loansData?.loans || []).map((loan: any) => (
                  <tr key={loan._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-6 font-mono font-bold">{loan.loanId}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold">{loan.userId?.name}</div>
                      <div className="text-xs text-slate-400">{loan.employmentStatus}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">
                      {formatCurrency(loan.monthlyIncome)}/mo
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold font-mono">{formatCurrency(loan.requestedAmount)}</div>
                      <div className="text-xs capitalize text-slate-500">{loan.loanType} loan</div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          loan.status === "active"
                            ? "success"
                            : loan.status === "under_review"
                            ? "info"
                            : loan.status === "rejected"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {loan.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {loan.status === "pending" || loan.status === "under_review" ? (
                        <button
                          onClick={() => {
                            setStaffLoanModal(loan);
                            setStaffNotes(loan.staffNotes || "");
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition"
                        >
                          Review & Forward
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">Decisioned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CASH DESK REQUESTS */}
      {activeTab === "requests" && (
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Customer Deposit & Withdrawal Requests
            </h3>
            <p className="text-xs text-slate-500">Verify and settle branch counter transactions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-6">Request ID</th>
                  <th className="py-3.5 px-6">Customer</th>
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
                      <div className="text-xs text-slate-400 font-mono">
                        Acc: {req.accountId?.accountNumber}
                      </div>
                    </td>
                    <td className="py-4 px-6 uppercase text-xs font-bold">
                      <span
                        className={req.type === "deposit" ? "text-emerald-500" : "text-brand-500"}
                      >
                        {req.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold">{formatCurrency(req.amount)}</td>
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
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewRequest(req._id, "reject")}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: FLAG SUSPICIOUS TRANSACTION */}
      <Modal
        isOpen={Boolean(flagModalTxn)}
        onClose={() => setFlagModalTxn(null)}
        title="Flag Suspicious Transaction"
        description={`Send transaction ${flagModalTxn?.transactionId} to Compliance Officer`}
        maxWidth="md"
      >
        <form onSubmit={handleFlagSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Internal Flagging Rationale
            </label>
            <textarea
              required
              rows={3}
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="e.g. Rapid succession of round-amount transfers exceeding normal customer velocity."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFlagModalTxn(null)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950"
            >
              Flag for Review
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: STAFF LOAN REVIEW & NOTES */}
      <Modal
        isOpen={Boolean(staffLoanModal)}
        onClose={() => setStaffLoanModal(null)}
        title="Loan Application Preliminary Assessment"
        description={`Review file for Loan ${staffLoanModal?.loanId}`}
        maxWidth="md"
      >
        <form onSubmit={handleStaffLoanSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
            <div>
              Applicant: <span className="font-bold">{staffLoanModal?.userId?.name}</span>
            </div>
            <div>
              Amount:{" "}
              <span className="font-bold font-mono">
                {formatCurrency(staffLoanModal?.requestedAmount)}
              </span>
            </div>
            <div>
              Stated Monthly Income:{" "}
              <span className="font-bold font-mono">
                {formatCurrency(staffLoanModal?.monthlyIncome)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Internal Staff Underwriting Notes
            </label>
            <textarea
              rows={3}
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              placeholder="e.g. Paystubs reviewed; employment tenure 4 years. Debt-to-income verified at 28%."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="forwardApproval"
              checked={forwardApproval}
              onChange={(e) => setForwardApproval(e.target.checked)}
              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="forwardApproval" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Forward application to Admin for Final Approval & Disbursement
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setStaffLoanModal(null)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950"
            >
              Save & Forward
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function StaffDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="glass-panel rounded-3xl p-10 text-center text-sm text-slate-400">
          Loading Staff Workstation...
        </div>
      }
    >
      <StaffDashboardContent />
    </Suspense>
  );
}
