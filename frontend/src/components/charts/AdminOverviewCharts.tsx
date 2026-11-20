"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AdminAnalytics } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface AdminChartsProps {
  analytics: AdminAnalytics;
}

const COLORS = ["#0c87eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export const AdminOverviewCharts: React.FC<AdminChartsProps> = ({ analytics }) => {
  const { monthlyBankingActivity = [], accountDistribution = [], loanStats = [] } = analytics;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Monthly Activity Bar Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Monthly Banking Activity
            </h3>
            <p className="text-xs text-slate-500">
              Transaction volumes across Deposits, Withdrawals and Transfers
            </p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyBankingActivity}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                tickFormatter={(val) => `$${val > 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="deposit" name="Deposits" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="withdrawal" name="Withdrawals" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="transfer" name="Transfers" fill="#0c87eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Account Type Distribution Pie Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Account Distribution
          </h3>
          <p className="text-xs text-slate-500">By account classification</p>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={accountDistribution.length > 0 ? accountDistribution : [{ type: "SAVINGS", count: 1 }]}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
              >
                {accountDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any, name: any, item: any) => [
                  `${val} accounts (${formatCurrency(item.payload.totalBalance)})`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          {accountDistribution.map((item, idx) => (
            <div key={item.type}>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="capitalize">{item.type}</span>
              </div>
              <div className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
