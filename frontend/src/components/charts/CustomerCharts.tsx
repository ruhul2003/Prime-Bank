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
import { CustomerAnalytics } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface CustomerChartsProps {
  analytics: CustomerAnalytics;
}

const COLORS = ["#0c87eb", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6"];

export const CustomerCharts: React.FC<CustomerChartsProps> = ({ analytics }) => {
  const { monthlyActivity = [], transactionDistribution = [] } = analytics;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Monthly Inflow & Spending */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Monthly Inflow vs Outflow
          </h3>
          <p className="text-xs text-slate-500">
            Compare funds received against payments and transfers
          </p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyActivity}
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
              <Bar dataKey="deposit" name="Income / Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spending" name="Spending / Outflow" fill="#0c87eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction Type Breakdown */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Transaction Activity
          </h3>
          <p className="text-xs text-slate-500">By financial category</p>
        </div>
        <div className="h-56 w-full">
          {transactionDistribution.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No recent transactions recorded
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={transactionDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {transactionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), "Volume"]}
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
          )}
        </div>
        <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {transactionDistribution.slice(0, 3).map((item, idx) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span>{item.name}</span>
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
