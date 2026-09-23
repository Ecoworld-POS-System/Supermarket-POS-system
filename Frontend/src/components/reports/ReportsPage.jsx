import React, { useEffect, useState } from "react";
import {
  BarChart3,
  CreditCard,
  Banknote,
  QrCode,
  Award,
  FileSpreadsheet,
  RotateCw,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function ReportsPage() {
  const { products = [] } = useApp();
  const [liveBills, setLiveBills] = useState([]);
  const [loading, setLoading] = useState(false);

  // කෙලින්ම Fetch API මඟින් MongoDB backend එකෙන් බිල්පත් ලබා ගැනීම
  const fetchLiveBills = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/bills");
      const result = await response.json();
      
      const billsData = Array.isArray(result)
        ? result
        : (result?.data || []);
      setLiveBills(billsData);
    } catch (err) {
      console.error("[ReportsPage] Failed to fetch live bills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveBills();
  }, []);

  // Completed බිල්පත් පමණක් පෙරීම
  const completedBills = liveBills.filter(
    (b) => !b.status || b.status === "Completed"
  );

  // මුදල ලබා ගැනීමේ helper function
  const getBillAmount = (b) => Number(b.grandTotal ?? b.total ?? 0);

  const totalRevenue = completedBills.reduce(
    (sum, b) => sum + getBillAmount(b),
    0
  );

  // 1. Payment Methods අනුව මුදල් වෙන් කිරීම
  const paymentStats = {
    Cash: completedBills
      .filter((b) => (b.paymentMethod || "").toLowerCase() === "cash")
      .reduce((sum, b) => sum + getBillAmount(b), 0),
    Card: completedBills
      .filter((b) => (b.paymentMethod || "").toLowerCase() === "card")
      .reduce((sum, b) => sum + getBillAmount(b), 0),
    LankaQR: completedBills
      .filter((b) =>
        ["lankaqr", "qr", "qr code"].includes((b.paymentMethod || "").toLowerCase())
      )
      .reduce((sum, b) => sum + getBillAmount(b), 0),
  };

  // 2. Cashier Performance ගණනය කිරීම
  const cashierStats = {};
  completedBills.forEach((b) => {
    const name = b.cashierName || b.cashier || "Cashier";
    if (!cashierStats[name]) {
      cashierStats[name] = { name, total: 0, count: 0 };
    }
    cashierStats[name].total += getBillAmount(b);
    cashierStats[name].count += 1;
  });

  const sortedCashiers = Object.values(cashierStats).sort(
    (a, b) => b.total - a.total
  );

  // 3. බිල්පත් පදනම් කරගෙන Best Selling Items සෙවීම
  const productSalesMap = {};
  completedBills.forEach((b) => {
    if (Array.isArray(b.items)) {
      b.items.forEach((item) => {
        const key = item.name || "Item";
        const qty = Number(item.quantity ?? item.qty ?? 1);
        const price = Number(item.unitPrice ?? item.price ?? 0);

        if (!productSalesMap[key]) {
          productSalesMap[key] = {
            name: key,
            category: "Groceries & Staples",
            price: price,
            unitsSold: 0,
          };
        }
        productSalesMap[key].unitsSold += qty;
        if (price > 0) productSalesMap[key].price = price;
      });
    }
  });

  let bestSellingItems = Object.values(productSalesMap).sort(
    (a, b) => b.unitsSold - a.unitsSold
  );

  if (bestSellingItems.length === 0 && products.length > 0) {
    bestSellingItems = products.slice(0, 5).map((p) => ({
      name: p.name,
      category: p.category || "General",
      price: Number(p.price || p.sellingPrice || 0),
      unitsSold: 0,
    }));
  }

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Invoice ID",
      "Date",
      "Branch",
      "Cashier",
      "Customer",
      "Subtotal",
      "Tax",
      "Discount",
      "Total",
      "Payment Method",
      "Status",
    ];
    const rows = liveBills.map((b) => [
      b.invoiceNumber || b.billNumber || b.transactionId || b.id || "N/A",
      `"${b.date || b.createdAt || ""}"`,
      `"${b.branch || "Head Office"}"`,
      `"${b.cashierName || b.cashier || "Cashier"}"`,
      `"${b.customerName || "Walk-in Customer"}"`,
      Number(b.subtotal || 0).toFixed(2),
      Number(b.tax || 0).toFixed(2),
      Number(b.discount || 0).toFixed(2),
      getBillAmount(b).toFixed(2),
      b.paymentMethod || "Cash",
      b.status || "Completed",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `sales_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full px-6 py-4 space-y-6 animate-fade-in">
      {/* Header & Export button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Financial & Sales Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit store revenues, tender collections, cashier productivity, and export spreadsheets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLiveBills}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            title="Refresh Live Data"
          >
            <RotateCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs shadow-emerald-600/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <FileSpreadsheet size={15} />
            <span>Export Sales to CSV</span>
          </button>
        </div>
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

      {/* Cashier Performance & Best Selling Items */}
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
            {sortedCashiers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">ගනුදෙනු කිසිවක් හමු නොවීය.</p>
            ) : (
              sortedCashiers.map((c, idx) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                      }`}
                    >
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
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Best Selling Items</h3>
              <p className="text-xs text-slate-400">Fastest turning SKUs across retail shelves</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {bestSellingItems.slice(0, 5).map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">📦</span>
                  <div className="truncate">
                    <p className="font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {p.unitsSold > 0 ? `${p.unitsSold} units sold` : p.category}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-extrabold text-slate-900 font-mono">
                    Rs. {Number(p.price || 0).toFixed(2)}
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