import React from "react";
import { X, Printer, CheckCircle, Download } from "lucide-react";
import confetti from "canvas-confetti";

export default function ReceiptModal({ bill, onClose }) {
  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  // Trigger celebration confetti on mount
  React.useEffect(() => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {}
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in no-print-backdrop">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header toolbar (hidden on print) */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">Payment Successful</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Printable Thermal Receipt Area */}
        <div id="printable-receipt" className="p-6 overflow-y-auto bg-white font-mono text-xs text-slate-800 space-y-4">
          {/* Supermarket Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <div className="inline-block w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs leading-8 mb-1">
              ET
            </div>
            <h2 className="font-bold text-sm text-slate-900">EGOTECH WORLD SUPERMART</h2>
            <p className="text-[11px] text-slate-500">{bill.branch}</p>
            <p className="text-[10px] text-slate-400">Tel: +94 11 234 5678 • VAT No: 1048829-001</p>
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
              <span>{bill.cashierName} ({bill.cashierId})</span>
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
                <tr className="text-slate-400 border-b border-slate-200">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Price</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1 pr-1 truncate max-w-[120px] font-sans">{item.name}</td>
                    <td className="py-1 text-center">{item.qty}</td>
                    <td className="py-1 text-right">Rs.{item.price.toFixed(2)}</td>
                    <td className="py-1 text-right font-bold">Rs.{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>Rs. {bill.subtotal.toFixed(2)}</span>
            </div>
            {bill.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount:</span>
                <span>- Rs. {bill.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>VAT / Taxes (2.5%):</span>
              <span>Rs. {bill.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>TOTAL DUE:</span>
              <span>Rs. {bill.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px] pt-1">
              <span>Amount Tendered:</span>
              <span>Rs. {bill.amountTendered.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-xs">
              <span>Change Returned:</span>
              <span>Rs. {bill.changeGiven.toFixed(2)}</span>
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="text-center pt-1 space-y-1">
            <div className="flex justify-center my-1 text-slate-400 font-mono tracking-widest text-xs">
              |||||| | |||||||| ||| |||||||
            </div>
            <p className="text-[10px] text-slate-500 font-semibold">THANK YOU FOR SHOPPING AT EGOTECH!</p>
            <p className="text-[9px] text-slate-400">Please retain receipt for exchanges within 7 days.</p>
          </div>
        </div>

        {/* Action Buttons (hidden on print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Printer size={15} /> Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-500/25"
          >
            New Sale
          </button>
        </div>
      </div>
    </div>
  );
}
