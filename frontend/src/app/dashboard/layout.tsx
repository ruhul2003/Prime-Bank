"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useAppSelector } from "@/redux/store";
import { useRouter, usePathname } from "next/navigation";
import { ReceiptModal } from "@/components/ui/ReceiptModal";
import { useAppDispatch } from "@/redux/store";
import { setReceiptModalOpen } from "@/redux/slices/transactionSlice";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
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
      <div className="min-h-screen flex items-center justify-center bg-[#f7fbff] dark:bg-navy-950 sky-atmosphere">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Loading PrimeBank Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf5ff] dark:bg-navy-950 sky-atmosphere text-slate-900 dark:text-slate-100 flex flex-col relative">
      {/* Ambient Depth Orbs for Dashboard Glassmorphism */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-28 left-1/4 h-96 w-96 rounded-full bg-brand-400/25 dark:bg-brand-500/15 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-sky-300/35 dark:bg-brand-600/10 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-96 w-96 rounded-full bg-brand-500/20 dark:bg-brand-700/15 blur-3xl" />
      </div>

      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>

      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen relative z-10">
        <Navbar />
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
        >
          {children}
        </motion.main>
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
