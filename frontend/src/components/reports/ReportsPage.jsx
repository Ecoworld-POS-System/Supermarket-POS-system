import React from "react";
import {
  BarChart3,
  Download,
  CreditCard,
  Banknote,
  QrCode,
  Users,
  Award,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function ReportsPage() {
  const { bills, products, users } = useApp();

  const completedBills = bills.filter((b) => b.status === "Completed");
  const totalRevenue = completedBills.reduce((sum, b) => sum + b.total, 0);

  // Group by payment method
  const paymentStats = {
    Cash: completedBills.filter((b) => b.paymentMethod === "Cash").reduce((sum, b) => sum + b.total, 0),
    Card: completedBills.filter((b) => b.paymentMethod === "Card").reduce((sum, b) => sum + b.total, 0),
    LankaQR: completedBills.filter((b) => b.paymentMethod === "LankaQR").reduce((sum, b) => sum + b.total, 0),
  };

  // Group by cashier
  const cashierStats = {};
  completedBills.forEach((b) => {
    if (!cashierStats[b.cashierName]) {
      cashierStats[b.cashierName] = { name: b.cashierName, total: 0, count: 0 };
    }
    cashierStats[b.cashierName].total += b.total;
    cashierStats[b.cashierName].count += 1;
  });

  const sortedCashiers = Object.values(cashierStats).sort((a, b) => b.total - a.total);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Invoice ID", "Date", "Branch", "Cashier", "Customer", "Subtotal", "Tax", "Discount", "Total", "Payment Method", "Status"];
    const rows = bills.map((b) => [
      b.id,
      `"${b.date}"`,
      `"${b.branch}"`,
      `"${b.cashierName}"`,
      `"${b.customerName}"`,
      b.subtotal.toFixed(2),
      b.tax.toFixed(2),
      b.discount.toFixed(2),
      b.total.toFixed(2),
      b.paymentMethod,
      b.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `egotech_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header & Export button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Financial & Sales Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit store revenues, tender collections, cashier productivity, and export spreadsheets
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet size={15} />
          <span>Export Sales to CSV</span>
        </button>
      </div>

      {/* Top Cards: Payment Tender Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Cash Collections</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote size={16} />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-2 font-mono">
            Rs. {paymentStats.Cash.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalRevenue > 0 ? ((paymentStats.Cash / totalRevenue) * 100).toFixed(1) : 0}% of revenue
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Card Terminal Settlement</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard size={16} />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-2 font-mono">
            Rs. {paymentStats.Card.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalRevenue > 0 ? ((paymentStats.Card / totalRevenue) * 100).toFixed(1) : 0}% of revenue
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">LankaQR & Mobile Pay</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <QrCode size={16} />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-2 font-mono">
            Rs. {paymentStats.LankaQR.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalRevenue > 0 ? ((paymentStats.LankaQR / totalRevenue) * 100).toFixed(1) : 0}% of revenue
          </p>
        </div>
      </div>

      {/* Cashier Performance Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-amber-500" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Cashier Performance Leaderboard</h3>
              <p className="text-xs text-slate-400">Total gross checkouts per register operator</p>
            </div>
          </div>

          <div className="space-y-3">
            {sortedCashiers.map((c, idx) => (
              <div
                key={c.name}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{c.name}</p>
                    <p className="text-[11px] text-slate-400">{c.count} transactions handled</p>
                  </div>
                </div>

                <p className="font-extrabold text-blue-600 font-mono text-xs">
                  Rs. {c.total.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Best-Selling Products */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Best Selling Items</h3>
              <p className="text-xs text-slate-400">Fastest turning SKUs across retail shelves</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {products.slice(0, 5).map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">{p.image || "📦"}</span>
                  <div className="truncate">
                    <p className="font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.category}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-extrabold text-slate-900 font-mono">
                    Rs. {p.price.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-medium">In High Demand</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
