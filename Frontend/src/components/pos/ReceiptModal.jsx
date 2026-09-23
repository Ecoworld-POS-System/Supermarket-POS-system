import React, { useEffect } from "react";
import { X, Printer, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import ModalPortal from "../layout/ModalPortal";

export default function ReceiptModal({ bill, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  // Trigger celebration confetti on mount
  useEffect(() => {
    if (!bill) return;
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (_e) {}
  }, [bill]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Escape key closes modal
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!bill) return null;

  /** Format as Rs. X,XXX.XX */
  const fmtRs = (n) =>
    `Rs. ${(Number(n) || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <ModalPortal>
      {/* ── Overlay with True Frosted Glassmorphism ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        role="dialog"
        aria-modal="true"
        aria-label="Receipt"
      >
        {/* ── Modal Panel (3-part structure) ──────────────── */}
        <div
          style={{ backgroundColor: "#ffffff" }}
          className="rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col mx-4 border border-slate-100 animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── HEADER (shrink-0) ─────────────────────────── */}
          <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 no-print">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600" />
              <span className="text-sm font-bold text-slate-800">Payment Successful</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close receipt modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── BODY (scrollable) ─────────────────────────── */}
          <div
            id="printable-receipt"
            className="flex-1 overflow-y-auto px-6 py-4 bg-white font-mono text-xs text-slate-800 space-y-4"
          >
            {/* Supermarket Header */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <div className="inline-block w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs leading-8 mb-1 shadow-xs">
                ET
              </div>
              <h2 className="font-bold text-sm text-slate-900 font-sans">EGOTECH WORLD SUPERMART</h2>
              <p className="text-[11px] text-slate-600 font-sans">{bill.branch}</p>
              <p className="text-[10px] text-slate-500 font-sans">
                Tel: +94 11 234 5678 • VAT No: 1048829-001
              </p>
            </div>

            {/* Receipt Meta */}
            <div className="text-[11px] space-y-0.5 text-slate-600 border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span>Invoice:</span>
                <span className="font-bold text-slate-900">{bill.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{bill.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>
                  {bill.cashierName} ({bill.cashierId})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{bill.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="font-bold text-slate-800">{bill.paymentMethod}</span>
              </div>
            </div>

            {/* Line items table */}
            <div className="border-b border-dashed border-slate-300 pb-2">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(bill.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 pr-1 truncate max-w-[120px] font-sans">{item.name}</td>
                      <td className="py-1 text-center">{item.qty}</td>
                      <td className="py-1 text-right">{fmtRs(item.price)}</td>
                      <td className="py-1 text-right font-bold">{fmtRs(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{fmtRs(bill.subtotal)}</span>
              </div>
              {Number(bill.discount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount:</span>
                  <span>- {fmtRs(bill.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>VAT / Taxes (2.5%):</span>
                <span>{fmtRs(bill.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL DUE:</span>
                <span>{fmtRs(bill.total)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px] pt-1">
                <span>Amount Tendered:</span>
                <span>{fmtRs(bill.amountTendered)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-xs">
                <span>Change Returned:</span>
                <span>{fmtRs(bill.changeGiven)}</span>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="text-center pt-1 space-y-1">
              <div className="flex justify-center my-1 text-slate-400 font-mono tracking-widest text-xs">
                |||||| | |||||||| ||| |||||||
              </div>
              <p className="text-[10px] text-slate-600 font-semibold font-sans">
                THANK YOU FOR SHOPPING AT EGOTECH!
              </p>
              <p className="text-[9px] text-slate-500 font-sans">
                Please retain receipt for exchanges within 7 days.
              </p>
            </div>
          </div>

          {/* ── FOOTER (shrink-0, sticky bottom) ─────────── */}
          <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70 no-print">
            <button
              onClick={handlePrint}
              className="flex-1 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-bold h-11 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <Printer size={16} /> Print Receipt
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold h-11 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
            >
              New Sale
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}