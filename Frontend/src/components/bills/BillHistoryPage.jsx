import React, { useState, useEffect } from "react";
import {
  Search,
  FileClock,
  RotateCcw,
  CreditCard,
  Banknote,
  QrCode,
  Receipt,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { BRANCHES } from "../../data/mockData";
import { fetchBills, fetchBillById, refundBill } from "../../services/billService";
import ReceiptModal from "../pos/ReceiptModal";

export default function BillHistoryPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundLoadingId, setRefundLoadingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [paymentFilter, setPaymentFilter] = useState("All Methods");
  const [viewingBill, setViewingBill] = useState(null);
  const [viewingLoading, setViewingLoading] = useState(false);

  const loadBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = {};
      if (search) queryParams.search = search;
      if (paymentFilter !== "All Methods") queryParams.paymentMethod = paymentFilter;

      const data = await fetchBills(queryParams);
      setBills(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching bills:", err);
      setError(err.message || "Failed to load transaction history from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, [paymentFilter]);

  // Client-side search and branch filter
  const filteredBills = bills.filter((b) => {
    const invId = (b.id || b.invoiceNumber || b.billNumber || "").toString().toLowerCase();
    const custName = (b.customerName || "").toString().toLowerCase();
    const cashName = (b.cashierName || b.cashier || "").toString().toLowerCase();
    const sLower = search.toLowerCase();

    const matchSearch =
      !search ||
      invId.includes(sLower) ||
      custName.includes(sLower) ||
      cashName.includes(sLower);

    const matchBranch =
      branchFilter === "All Branches" || (b.branch || "Colombo – Head Office") === branchFilter;

    const matchPayment =
      paymentFilter === "All Methods" || (b.paymentMethod || "Cash") === paymentFilter;

    return matchSearch && matchBranch && matchPayment;
  });

  const totalRevenue = filteredBills
    .filter((b) => b.status === "Completed")
    .reduce((sum, b) => sum + (b.total ?? b.grandTotal ?? 0), 0);

  const avgTicket = filteredBills.length > 0 ? totalRevenue / filteredBills.length : 0;

  const handleRefund = async (bill) => {
    if (bill.status === "Refunded") return;
    const targetId = bill._id || bill.id || bill.billNumber;
    const amountStr = (bill.total ?? bill.grandTotal ?? 0).toFixed(2);

    if (
      window.confirm(
        `Issue full refund for invoice ${targetId} (Rs. ${amountStr})? This will replenish inventory stock in MongoDB.`
      )
    ) {
      try {
        setRefundLoadingId(targetId);
        await refundBill(targetId);
        setSuccessMessage(`Bill ${targetId} successfully refunded and stock replenished.`);
        setTimeout(() => setSuccessMessage(null), 4000);
        await loadBills();
      } catch (err) {
        console.error("Refund error:", err);
        alert(`Failed to process refund: ${err.message}`);
      } finally {
        setRefundLoadingId(null);
      }
    }
  };

  const handleViewReceipt = async (bill) => {
    try {
      setViewingLoading(true);
      const targetId = bill._id || bill.id || bill.billNumber;
      const detailedBill = await fetchBillById(targetId);
      
      // Normalize bill details for ReceiptModal component
      const normalized = {
        ...detailedBill,
        id: detailedBill._id || detailedBill.id || detailedBill.invoiceNumber || detailedBill.billNumber || targetId,
        branch: detailedBill.branch || bill.branch || "Colombo – Head Office",
        cashierName: detailedBill.cashierName || detailedBill.cashier || bill.cashierName || "Cashier",
        cashierId: detailedBill.cashierId || "EMP-001",
        customerName: detailedBill.customerName || "Walk-in Customer",
        date: detailedBill.date || (detailedBill.createdAt ? new Date(detailedBill.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : bill.date),
        paymentMethod: detailedBill.paymentMethod || bill.paymentMethod || "Cash",
        total: detailedBill.total ?? detailedBill.grandTotal ?? bill.total ?? 0,
        subtotal: detailedBill.subtotal ?? detailedBill.total ?? detailedBill.grandTotal ?? bill.subtotal ?? 0,
        discount: detailedBill.discount ?? bill.discount ?? 0,
        tax: detailedBill.tax ?? bill.tax ?? 0,
        amountTendered: detailedBill.amountTendered ?? detailedBill.tenderedAmount ?? detailedBill.tendered ?? (detailedBill.total ?? detailedBill.grandTotal ?? 0),
        changeGiven: detailedBill.changeGiven ?? detailedBill.changeDue ?? detailedBill.change ?? 0,
        items: (detailedBill.items || []).map((item) => ({
          name: item.name || "Item",
          qty: item.qty ?? item.quantity ?? 1,
          price: item.price ?? item.unitPrice ?? 0,
          total: item.total ?? item.lineTotal ?? ((item.price ?? item.unitPrice ?? 0) * (item.qty ?? item.quantity ?? 1)),
        })),
      };

      setViewingBill(normalized);
    } catch (err) {
      console.error("Fetch bill details error:", err);
      // Fallback to locally formatted bill object
      const fallbackBill = {
        ...bill,
        id: bill._id || bill.id || bill.billNumber,
        branch: bill.branch || "Colombo – Head Office",
        cashierName: bill.cashierName || bill.cashier || "Cashier",
        cashierId: bill.cashierId || "EMP-001",
        customerName: bill.customerName || "Walk-in Customer",
        total: bill.total ?? bill.grandTotal ?? 0,
        subtotal: bill.subtotal ?? bill.total ?? 0,
        discount: bill.discount ?? 0,
        tax: bill.tax ?? 0,
        amountTendered: bill.amountTendered ?? bill.tenderedAmount ?? bill.total ?? 0,
        changeGiven: bill.changeGiven ?? bill.changeDue ?? 0,
        items: (bill.items || []).map((i) => ({
          name: i.name || "Item",
          qty: i.qty ?? i.quantity ?? 1,
          price: i.price ?? i.unitPrice ?? 0,
          total: i.total ?? i.lineTotal ?? 0,
        })),
      };
      setViewingBill(fallbackBill);
    } finally {
      setViewingLoading(false);
    }
  };

  return (
    <div className="w-full px-6 py-4 space-y-6 animate-fade-in">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Bill History & Sales Ledger
            {loading && <Loader2 size={16} className="animate-spin text-blue-600" />}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit store invoices, track payment tender breakdowns, and reprint customer receipts
          </p>
        </div>

        {/* Counter cards */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadBills}
            disabled={loading}
            title="Refresh from server"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs">
            <p className="text-xs font-semibold text-slate-400">Bills Count</p>
            <p className="text-base font-bold text-slate-900 leading-tight">{filteredBills.length}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs">
            <p className="text-xs font-semibold text-slate-400">Filtered Total</p>
            <p className="text-base font-extrabold text-emerald-600 font-mono leading-tight">
              Rs. {totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-fade-in">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center justify-between text-rose-800 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadBills} className="underline hover:text-rose-900 ml-4">
            Retry
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice #, customer, cashier..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 bg-white outline-none cursor-pointer"
          >
            <option>All Branches</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 bg-white outline-none cursor-pointer"
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
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs md:text-sm font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-4">Invoice #</th>
                <th className="px-5 py-4">Date & Time</th>
                <th className="px-5 py-4">Branch & Cashier</th>
                <th className="px-5 py-4">Customer & Items</th>
                <th className="px-5 py-4">Method</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && bills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Loading transaction history from server...</span>
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-slate-400 py-12">
                    <FileClock size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">No transaction records found</p>
                    <p className="text-xs text-slate-400">Complete sales in POS to record new transactions.</p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((b, index) => {
                  const billKey = b._id || b.id || b.billNumber || b.invoiceNumber || `bill-${index}`;
                  const invoiceNum = b.invoiceNumber || b.billNumber || b.id || billKey;
                  const grandTotal = b.total ?? b.grandTotal ?? 0;
                  const cashierName = b.cashierName || b.cashier || "Cashier";
                  const customerName = b.customerName || "Walk-in Customer";
                  const itemsCount = Array.isArray(b.items) ? b.items.length : 0;
                  const paymentMethod = b.paymentMethod || "Cash";
                  const isRefunded = b.status === "Refunded";
                  const isRefunding = refundLoadingId === (b._id || b.id || b.billNumber);

                  return (
                    <tr key={`${billKey}-${index}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-bold font-mono text-blue-600">
                        {invoiceNum}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 text-[11px]">
                        {b.date || (b.createdAt ? new Date(b.createdAt).toLocaleString() : "N/A")}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{b.branch || "Colombo – Head Office"}</p>
                        <p className="text-[11px] text-slate-400">{cashierName}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{customerName}</p>
                        <p className="text-[11px] text-slate-400">
                          {itemsCount} item{itemsCount !== 1 ? "s" : ""}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {paymentMethod === "Cash" && <Banknote size={12} />}
                          {paymentMethod === "Card" && <CreditCard size={12} />}
                          {paymentMethod === "LankaQR" && <QrCode size={12} />}
                          {paymentMethod}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold font-mono text-slate-900">
                        Rs. {grandTotal.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            !isRefunded
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              !isRefunded ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {b.status || "Completed"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleViewReceipt(b)}
                            disabled={viewingLoading}
                            className="inline-flex items-center gap-1 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 hover:text-blue-600 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            title="View / Print Receipt"
                          >
                            <Receipt size={13} />
                            <span>Receipt</span>
                          </button>

                          {!isRefunded && (
                            <button
                              onClick={() => handleRefund(b)}
                              disabled={isRefunding}
                              className="inline-flex items-center gap-1 border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                              title="Void / Refund transaction and replenish stock"
                            >
                              {isRefunding ? (
                                <Loader2 size={13} className="animate-spin text-rose-600" />
                              ) : (
                                <RotateCcw size={13} />
                              )}
                              <span>{isRefunding ? "Refunding..." : "Refund"}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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