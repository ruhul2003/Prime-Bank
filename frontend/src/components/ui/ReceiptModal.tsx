import React from "react";
import { Modal } from "./Modal";
import { Badge } from "./Badge";
import { Transaction } from "@/types";
import { formatCurrency, formatDate, generateReceiptPDF } from "@/lib/utils";
import { CheckCircle2, Download, Printer, ShieldCheck } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Electronic Transaction Receipt"
      description="Official PrimeBank financial record and transfer confirmation"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Receipt Header Banner */}
        <div className="text-center p-5 rounded-xl bg-gradient-to-b from-brand-50 to-slate-50 dark:from-slate-800/60 dark:to-slate-900 border border-brand-100 dark:border-slate-800">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Settlement Amount
          </p>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(transaction.amount + (transaction.fee || 0))}
          </h2>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge
              variant={
                transaction.status === "completed"
                  ? "success"
                  : transaction.status === "pending"
                  ? "warning"
                  : "danger"
              }
            >
              {transaction.status}
            </Badge>
            <span className="text-xs font-mono text-slate-400">
              {transaction.type.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Transaction Key Meta */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 divide-y divide-slate-200/60 dark:divide-slate-700/60 text-sm">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Transaction ID</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {transaction.transactionId}
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Reference</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {transaction.reference || "N/A"}
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Date & Time</span>
            <span className="text-slate-800 dark:text-slate-200">
              {formatDate(transaction.createdAt)}
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Source Account</span>
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
              {transaction.senderAccountNumber || "Direct Branch Deposit"}
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Beneficiary Account</span>
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
              {transaction.receiverAccountNumber || "N/A"}
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Description</span>
            <span className="text-slate-800 dark:text-slate-200 text-right max-w-[200px] truncate">
              {transaction.description || "N/A"}
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Transfer Amount</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {formatCurrency(transaction.amount)}
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Service Fee</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {formatCurrency(transaction.fee)}
            </span>
          </div>
        </div>

        {/* Security Seal */}
        <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secured by PrimeBank 256-bit Encrypted Ledger</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => generateReceiptPDF(transaction)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition shadow-sm hover:shadow"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
};
