"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { ReceiptModal } from "@/components/ui/ReceiptModal";
import { useAppDispatch } from "@/redux/store";
import { setReceiptModalOpen } from "@/redux/slices/transactionSlice";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { selectedTransaction, receiptModalOpen } = useAppSelector(
    (state) => state.transaction
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const token = localStorage.getItem("primebank_token");
      if (!token && !isAuthenticated) {
        router.push("/login");
      }
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Loading PrimeBank Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Sidebar />

      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>

      {/* Global Transaction Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => dispatch(setReceiptModalOpen(false))}
        transaction={selectedTransaction}
      />
    </div>
  );
}
