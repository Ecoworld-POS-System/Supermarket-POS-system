import React, { useState } from "react";
import {
  Search,
  FileClock,
  Printer,
  RotateCcw,
  Calendar,
  Building,
  CreditCard,
  Banknote,
  QrCode,
  DollarSign,
  Receipt,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { BRANCHES } from "../../data/mockData";
import ReceiptModal from "../pos/ReceiptModal";

export default function BillHistoryPage() {
  const { bills, refundBill, activeBranch } = useApp();
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [paymentFilter, setPaymentFilter] = useState("All Methods");
  const [viewingBill, setViewingBill] = useState(null);

  const filteredBills = bills.filter((b) => {
    const matchSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.cashierName.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter === "All Branches" || b.branch === branchFilter;
    const matchPayment = paymentFilter === "All Methods" || b.paymentMethod === paymentFilter;
    return matchSearch && matchBranch && matchPayment;
  });

  const totalRevenue = filteredBills
    .filter((b) => b.status === "Completed")
    .reduce((sum, b) => sum + b.total, 0);

  const avgTicket = filteredBills.length > 0 ? totalRevenue / filteredBills.length : 0;

  const handleRefund = (bill) => {
    if (bill.status === "Refunded") return;
    if (window.confirm(`Issue full refund for ${bill.id} (Rs. ${bill.total.toFixed(2)})? This will replenish inventory.`)) {
      refundBill(bill.id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Bill History & Sales Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit store sales, inspect customer receipts, and manage transaction returns
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs">
            <p className="text-xs font-semibold text-slate-400">Total Revenue</p>
            <p className="text-base font-extrabold text-blue-600 font-mono">
              Rs. {totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs">
            <p className="text-xs font-semibold text-slate-400">Bills Count</p>
            <p className="text-base font-bold text-slate-800">{filteredBills.length}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs hidden md:block">
            <p className="text-xs font-semibold text-slate-400">Avg Ticket</p>
            <p className="text-base font-bold text-slate-800 font-mono">
              Rs. {avgTicket.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice #, customer, cashier..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white outline-none"
          >
            <option>All Branches</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white outline-none"
          >
            <option>All Methods</option>
            <option>Cash</option>
            <option>Card</option>
            <option>LankaQR</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5">Branch & Cashier</th>
                <th className="px-5 py-3.5">Customer & Items</th>
                <th className="px-5 py-3.5">Method</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-bold font-mono text-blue-600">
                    {b.id}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 text-[11px]">
                    {b.date}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800">{b.branch}</p>
                    <p className="text-[11px] text-slate-400">{b.cashierName}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-800">{b.customerName}</p>
                    <p className="text-[11px] text-slate-400">
                      {b.items.length} item{b.items.length > 1 ? "s" : ""}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                      {b.paymentMethod === "Cash" && <Banknote size={12} />}
                      {b.paymentMethod === "Card" && <CreditCard size={12} />}
                      {b.paymentMethod === "LankaQR" && <QrCode size={12} />}
                      {b.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold font-mono text-slate-900">
                    Rs. {b.total.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        b.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          b.status === "Completed" ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => setViewingBill(b)}
                        className="inline-flex items-center gap-1 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 hover:text-blue-600 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        title="View / Print Receipt"
                      >
                        <Receipt size={13} />
                        <span>Receipt</span>
                      </button>

                      {b.status === "Completed" && (
                        <button
                          onClick={() => handleRefund(b)}
                          className="inline-flex items-center gap-1 border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          title="Void / Refund transaction and replenish stock"
                        >
                          <RotateCcw size={13} />
                          <span>Refund</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-slate-400 py-12">
                    <FileClock size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">No transaction records found</p>
                    <p className="text-xs text-slate-400">Complete sales in POS to record new transactions.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {viewingBill && (
        <ReceiptModal bill={viewingBill} onClose={() => setViewingBill(null)} />
      )}
    </div>
  );
}
