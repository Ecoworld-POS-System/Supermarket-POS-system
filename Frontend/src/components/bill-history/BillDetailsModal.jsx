import { useEffect, useState } from 'react';
import { X, Printer, Download, Hash, MapPin, Calendar, User, CreditCard, RefreshCw, Star } from 'lucide-react';

const ACCENT = '#6B9CD2';

/**
 * BillDetailsModal
 * – Counter ID shown under cashier
 * – Loyalty points earned + current balance
 * – Return / Exchange button per line item
 * – Discount, promotion code, tax all displayed
 * – Grand total recalculated from subtotal − discount + tax
 */
export default function BillDetailsModal({ bill, onClose = () => {} }) {
  const [returnItem, setReturnItem] = useState(null); // item index being returned

  if (!bill) return null;

  /* ── Normalise both data shapes ─────────────────────────────── */
  const txnId        = bill.billNumber ?? bill.id ?? '—';
  const customerName = (typeof bill.customer === 'object' ? bill.customer?.name  : bill.customer)  ?? 'Walk-in Customer';
  const customerTier = (typeof bill.customer === 'object' ? bill.customer?.tier  : null);
  const customerPhone= (typeof bill.customer === 'object' ? bill.customer?.phone : null);
  const loyaltyBal   = bill.customer?.loyaltyPoints ?? null;
  const earnedPts    = bill.customer?.earnedPoints   ?? bill.earnedPoints ?? null;
  const cashier      = bill.cashier    ?? 'Admin';
  const counterId    = bill.counterId  ?? null;
  const branch       = bill.branch     ?? 'Colombo - Head';
  const registerId   = bill.registerId ?? bill.register ?? 'Register #01';
  const dateTime     = bill.formattedDate
    ? bill.formattedDate.replace('\n', ' ')
    : bill.dateTime ?? (bill.createdAt
      ? new Date(bill.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
      : '—');
  const paymentMethod = bill.paymentMethod ?? bill.method ?? '—';
  const promoCode     = bill.promoCode ?? null;

  const rawTotal   = bill.grandTotal ?? bill.total ?? 0;
  const grandTotal = typeof rawTotal === 'number' ? rawTotal : Number(String(rawTotal).replace(/[^0-9.]/g, '')) || 0;
  const subtotal   = typeof bill.subtotal === 'number' ? bill.subtotal
                   : Number(String(bill.subtotal ?? '').replace(/[^0-9.]/g, '')) || grandTotal;
  const discount   = Number(bill.discount) || 0;
  const tax        = Number(bill.tax)      || 0;
  // Recompute final total to be sure
  const finalTotal = subtotal - discount + tax;

  const items = bill.items?.length
    ? bill.items
    : (bill.itemsList ?? []).map((i) => ({
        name: i.name, quantity: i.qty, unitPrice: i.price, lineTotal: i.total,
      }));
  if (!items.length) items.push({ name: 'Item', quantity: 1, unitPrice: grandTotal, lineTotal: grandTotal });

  const fmt = (n) => `LKR ${Number(n).toLocaleString('en-LK')}`;

  /* ── Status badge ────────────────────────────────────────────── */
  const statusCfg = {
    completed: { bg: '#ecfdf5', text: '#065f46', border: '#6ee7b7' },
    pending:   { bg: '#fffbeb', text: '#92400e', border: '#fcd34d' },
    refunded:  { bg: '#fff1f2', text: '#9f1239', border: '#fca5a5' },
    exchanged: { bg: '#faf5ff', text: '#6b21a8', border: '#d8b4fe' },
    cancelled: { bg: '#f9fafb', text: '#4b5563', border: '#d1d5db' },
  };
  const sk     = (bill.status ?? '').toLowerCase();
  const stCfg  = statusCfg[sk] ?? { bg: '#eff6ff', text: '#1e40af', border: '#93c5fd' };

  /* ── Tier badge ──────────────────────────────────────────────── */
  const tierCfg = {
    GOLD:     { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    SILVER:   { bg: '#f3f4f6', text: '#1f2937', border: '#d1d5db' },
    STANDARD: { bg: '#fefce8', text: '#713f12', border: '#fde68a' },
  };
  const tCfg = customerTier ? (tierCfg[customerTier.toUpperCase()] ?? tierCfg.STANDARD) : null;

  /* ── Escape key ──────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* ── Download receipt as text ────────────────────────────────── */
  const handleDownload = () => {
    const lines = [
      'TRANSACTION RECEIPT',
      '===================',
      `ID       : ${txnId}`,
      `Date     : ${dateTime}`,
      `Customer : ${customerName}`,
      `Cashier  : ${cashier}${counterId ? ` / ${counterId}` : ''}`,
      `Branch   : ${branch} (${registerId})`,
      '',
      'ITEMS',
      '-----',
      ...items.map((i) => `${i.name} x${i.quantity}  ${fmt(i.lineTotal ?? i.unitPrice * i.quantity)}`),
      '',
      `Subtotal : ${fmt(subtotal)}`,
      ...(promoCode  ? [`Promo    : ${promoCode}`]                     : []),
      ...(discount   ? [`Discount : -${fmt(discount)}`]                : []),
      ...(tax        ? [`Tax      :  ${fmt(tax)}`]                     : []),
      `TOTAL    : ${fmt(finalTotal)}`,
      `Method   : ${paymentMethod}`,
      `Status   : ${bill.status ?? '—'}`,
      ...(earnedPts  ? [`Pts Earned: +${earnedPts} pts`]               : []),
      ...(loyaltyBal !== null ? [`Pts Bal  : ${loyaltyBal} pts`]       : []),
    ].join('\n');

    const a    = Object.assign(document.createElement('a'), {
      href:     URL.createObjectURL(new Blob([lines], { type: 'text/plain' })),
      download: `${txnId}.txt`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(4px)' }}
      role="dialog" aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}>

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(107,156,210,0.12)', color: ACCENT }}>
              <Hash size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Transaction Details</h3>
              <span className="text-[11px] font-mono font-bold" style={{ color: ACCENT }}>{txnId}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {bill.status && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                style={{ backgroundColor: stCfg.bg, color: stCfg.text, borderColor: stCfg.border }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stCfg.text }} />
                {bill.status}
              </span>
            )}
            <button type="button" onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Branch */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin size={11} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Branch</span>
              </div>
              <p className="text-xs font-semibold text-gray-800">{branch}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{registerId}</p>
            </div>

            {/* Date & Time */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={11} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Date & Time</span>
              </div>
              <p className="text-xs font-semibold text-gray-800">{dateTime}</p>
            </div>

            {/* Customer */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <User size={11} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Customer</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-semibold text-gray-800">{customerName}</p>
                {tCfg && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border"
                    style={{ backgroundColor: tCfg.bg, color: tCfg.text, borderColor: tCfg.border }}>
                    {customerTier}
                  </span>
                )}
              </div>
              {customerPhone && <p className="text-[11px] text-gray-400 mt-0.5">{customerPhone}</p>}
            </div>

            {/* Cashier + Counter ID */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <User size={11} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Cashier</span>
              </div>
              <p className="text-xs font-semibold text-gray-800">{cashier}</p>
              {counterId && <p className="text-[11px] text-gray-400 mt-0.5">{counterId}</p>}
            </div>
          </div>

          {/* Loyalty Points */}
          {(earnedPts !== null || loyaltyBal !== null) && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ backgroundColor: 'rgba(107,156,210,0.06)', borderColor: 'rgba(107,156,210,0.25)' }}>
              <Star size={15} style={{ color: ACCENT, flexShrink: 0 }} />
              <div className="flex-1 flex flex-wrap items-center gap-4 text-xs">
                {earnedPts !== null && (
                  <div>
                    <span className="text-gray-500 font-medium">Points Earned: </span>
                    <span className="font-bold text-emerald-600">+{earnedPts} pts</span>
                  </div>
                )}
                {loyaltyBal !== null && (
                  <div>
                    <span className="text-gray-500 font-medium">Points Balance: </span>
                    <span className="font-bold text-gray-800">{Number(loyaltyBal).toLocaleString()} pts</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items table */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
              Purchased Items ({items.length})
            </p>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2 font-semibold text-gray-500">Item</th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-500">Qty</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-500">Unit Price</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-500">Total</th>
                    <th className="text-center px-2 py-2 font-semibold text-gray-500">Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2.5 font-medium text-gray-800">{item.name}</td>
                      <td className="px-3 py-2.5 text-center text-gray-600">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600">{fmt(item.unitPrice)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-gray-900">
                        {fmt(item.lineTotal ?? item.unitPrice * item.quantity)}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <button type="button"
                          onClick={() => setReturnItem(returnItem === i ? null : i)}
                          title="Return / Exchange this item"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold cursor-pointer transition-all"
                          style={returnItem === i
                            ? { backgroundColor: ACCENT, color: '#fff', borderColor: ACCENT }
                            : { backgroundColor: '#f9fafb', color: '#6b7280', borderColor: '#e5e7eb' }}>
                          <RefreshCw size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Inline return/exchange form */}
            {returnItem !== null && (
              <div className="mt-2 p-3 rounded-xl border text-xs space-y-2"
                style={{ backgroundColor: 'rgba(107,156,210,0.05)', borderColor: 'rgba(107,156,210,0.3)' }}>
                <p className="font-bold text-gray-700">
                  Return / Exchange — <span style={{ color: ACCENT }}>{items[returnItem]?.name}</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Action</label>
                    <select className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none">
                      <option>Issue Refund</option>
                      <option>Item Exchange</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Reason</label>
                    <select className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none">
                      <option>Damaged / Defective</option>
                      <option>Incorrect Item</option>
                      <option>Near Expiry</option>
                      <option>Customer Changed Mind</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setReturnItem(null)}
                    className="px-3 py-1 text-[10px] font-semibold text-gray-600 hover:text-gray-900 rounded-lg cursor-pointer">
                    Cancel
                  </button>
                  <button type="button" onClick={() => { alert(`Return/Exchange submitted for: ${items[returnItem]?.name}`); setReturnItem(null); }}
                    className="px-3 py-1 text-[10px] font-bold text-white rounded-lg cursor-pointer hover:opacity-90"
                    style={{ backgroundColor: ACCENT }}>
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Financial breakdown */}
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>

            {promoCode && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">
                  Promotion Applied{' '}
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold border ml-1"
                    style={{ backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#6ee7b7' }}>
                    {promoCode}
                  </span>
                </span>
                <span className="text-emerald-600 font-semibold">−{fmt(discount)}</span>
              </div>
            )}

            {discount > 0 && !promoCode && (
              <div className="flex justify-between text-xs text-emerald-600">
                <span>Discount</span>
                <span>−{fmt(discount)}</span>
              </div>
            )}

            {tax > 0 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Tax (applied)</span>
                <span>+{fmt(tax)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
              <span>Grand Total</span>
              <span style={{ color: ACCENT }}>{fmt(finalTotal)}</span>
            </div>

            <div className="flex justify-between text-xs text-gray-500 pt-1">
              <span>Payment Method</span>
              <span className="font-semibold text-gray-700 inline-flex items-center gap-1">
                <CreditCard size={11} />
                {paymentMethod}
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
            Close
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
              <Download size={13} /> Download PDF
            </button>
            <button type="button" onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              style={{ backgroundColor: ACCENT }}>
              <Printer size={13} /> Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
