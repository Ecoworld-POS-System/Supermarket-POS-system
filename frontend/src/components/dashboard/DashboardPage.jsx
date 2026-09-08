import React from "react";
import {
  CreditCard,
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus,
  Receipt,
  CheckCircle,
  Package,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function DashboardPage({ setActiveTab }) {
  const { bills, products, users, lowStockCount, activeBranch } = useApp();

  const totalRevenue = bills
    .filter((b) => b.status === "Completed")
    .reduce((sum, b) => sum + b.total, 0);

  const completedBills = bills.filter((b) => b.status === "Completed");
  const recentBills = bills.slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-100 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Store Terminal • {activeBranch}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Supermarket Operations Command</h1>
          <p className="text-blue-100 text-xs max-w-xl">
            Real-time cashier activity, sales velocity, catalog health, and inventory tracking for EgoTech World.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab("pos")}
            className="bg-white hover:bg-blue-50 text-blue-700 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-2 hover:scale-102"
          >
            <CreditCard size={16} />
            <span>Launch POS Register</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Sales */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Sales Recorded</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
              Rs. {totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0 })}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <TrendingUp size={13} /> +14.2% vs yesterday
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard size={20} />
          </div>
        </div>

        {/* Card 2: Transactions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Transactions Processed</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
              {completedBills.length} Bills
            </p>
            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
              100% register uptime
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Card 3: Active Staff */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Store Staff</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
              {users.filter((u) => u.status === "Active").length} Active
            </p>
            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
              Across 5 branch outlets
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div
          onClick={() => setActiveTab("inventory")}
          className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer group transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-slate-400">Low Stock Warnings</p>
            <p className="text-xl font-extrabold text-rose-600 mt-1 font-mono">
              {lowStockCount} SKUs
            </p>
            <span className="text-[11px] font-semibold text-amber-600 mt-1 group-hover:underline flex items-center gap-1">
              Click to view replenishment <ArrowRight size={11} />
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Middle Visual Section: Hourly Velocity & Department Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly sales velocity bar chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Hourly Sales Velocity</h3>
              <p className="text-xs text-slate-400">Customer checkout volume across today's operating hours</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              Peak: 09:00 - 11:00 AM
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100">
            {[
              { time: "08 AM", height: "35%", val: "Rs. 2.4k" },
              { time: "09 AM", height: "85%", val: "Rs. 8.2k" },
              { time: "10 AM", height: "95%", val: "Rs. 9.1k" },
              { time: "11 AM", height: "65%", val: "Rs. 5.8k" },
              { time: "12 PM", height: "50%", val: "Rs. 4.6k" },
              { time: "01 PM", height: "45%", val: "Rs. 3.9k" },
              { time: "02 PM", height: "60%", val: "Rs. 5.2k" },
              { time: "03 PM", height: "70%", val: "Rs. 6.4k" },
              { time: "04 PM", height: "80%", val: "Rs. 7.5k" },
              { time: "05 PM", height: "90%", val: "Rs. 8.8k" },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-100 hover:bg-blue-100 rounded-t-lg h-36 flex items-end justify-center overflow-hidden p-0.5">
                  <div
                    className="w-full bg-blue-600 group-hover:bg-blue-500 rounded-t-md transition-all relative"
                    style={{ height: bar.height }}
                    title={bar.val}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-600">
                  {bar.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Top Revenue Categories</h3>
            <p className="text-xs text-slate-400 mb-4">Contribution by supermart department</p>

            <div className="space-y-3">
              {[
                { name: "Groceries & Staples", share: 38, color: "bg-blue-600" },
                { name: "Dairy & Eggs", share: 24, color: "bg-emerald-500" },
                { name: "Beverages", share: 18, color: "bg-amber-500" },
                { name: "Bakery & Confectionery", share: 12, color: "bg-purple-500" },
                { name: "Household & Care", share: 8, color: "bg-pink-500" },
              ].map((cat) => (
                <div key={cat.name} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700">{cat.name}</span>
                    <span className="font-mono text-slate-500">{cat.share}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab("reports")}
              className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View Detailed Analytics →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: Recent Sales Ledger */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Recent Counter Checkouts</h3>
            <p className="text-xs text-slate-400">Latest completed sales bills at register stations</p>
          </div>
          <button
            onClick={() => setActiveTab("bills")}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>View Full Ledger</span> <ArrowRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-2.5 rounded-l-xl">Invoice</th>
                <th className="px-4 py-2.5">Date & Time</th>
                <th className="px-4 py-2.5">Branch</th>
                <th className="px-4 py-2.5">Cashier</th>
                <th className="px-4 py-2.5">Items</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5 rounded-r-xl">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBills.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-bold font-mono text-blue-600">{b.id}</td>
                  <td className="px-4 py-3 text-slate-500">{b.date}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{b.branch}</td>
                  <td className="px-4 py-3 text-slate-600">{b.cashierName}</td>
                  <td className="px-4 py-3 text-slate-500">{b.items.length} items</td>
                  <td className="px-4 py-3 font-bold font-mono text-slate-900">
                    Rs. {b.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      {b.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
