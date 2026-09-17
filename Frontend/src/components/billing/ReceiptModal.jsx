import { useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Printer,
  PlusCircle,
  Banknote,
  CreditCard,
  Building2,
} from 'lucide-react';

/** Format as LKR X,XXX.00 */
function fmt(n) {
  return `LKR ${n.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Format a Date or ISO string as a full human-readable timestamp */
function fmtTimestamp(value) {
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true,
  });
}

/**
 * ReceiptModal — Post-payment receipt overlay.
 *
 * Props:
 *   savedBill    Object   — the full bill document returned from the backend
 *                           includes: billNumber, createdAt, cashier, items, grandTotal, etc.
 *   payment      Object   — local payment details: { subtotal, discountValue, tax, grandTotal,
 *                           cart, method, tendered, change }
 *   onNewBill    () => void  – resets cart + closes modal
 *   onClose      () => void  – just closes (keeps cart)
 */
export default function ReceiptModal({
  savedBill = {},
  payment   = {},
  onNewBill = () => {},
  onClose   = () => {},
}) {
  const printRef = useRef(null);

  const {
    billNumber = savedBill?.billNumber ?? '—',
    createdAt  = savedBill?.createdAt  ?? new Date(),
    cashier    = savedBill?.cashier    ?? 'Cashier 01',
  } = savedBill ?? {};

  const {
    cart          = [],
    subtotal      = 0,
    discountValue = 0,
    tax           = 0,
    grandTotal    = 0,
    method        = 'cash',
    tendered      = grandTotal,
    change        = 0,
  } = payment ?? {};

  /* Escape → close */
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* Browser print */
  function handlePrint() {
    window.print();
  }

  return (
    <div
      className="rcpt-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Receipt"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div id="printable-receipt" className="rcpt-modal" ref={printRef}>

        {/* ── Success Banner ────────────────────────── */}
        <div className="rcpt-success-banner">
          <div className="rcpt-check-wrap">
            <CheckCircle2 size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="rcpt-success-title">Payment Complete</p>
            <p className="rcpt-success-sub">Transaction processed successfully</p>
          </div>
        </div>

        {/* ── Company Header ────────────────────────── */}
        <div className="rcpt-company">
          <div className="rcpt-company-icon">
            <Building2 size={18} />
          </div>
          <div>
            <p className="rcpt-company-name">EGOTECH WORLD (PVT) LTD</p>
            <p className="rcpt-company-addr">No. 42, Galle Road, Colombo 03, Sri Lanka</p>
          </div>
        </div>

        <hr className="rcpt-rule" />

        {/* ── Transaction Metadata ──────────────────── */}
        <div className="rcpt-meta-grid">
          <div className="rcpt-meta-item">
            <span className="rcpt-meta-key">Bill Number</span>
            <span className="rcpt-meta-val mono">{billNumber}</span>
          </div>
          <div className="rcpt-meta-item">
            <span className="rcpt-meta-key">Cashier</span>
            <span className="rcpt-meta-val">{cashier}</span>
          </div>
          <div className="rcpt-meta-item">
            <span className="rcpt-meta-key">Date &amp; Time</span>
            <span className="rcpt-meta-val">{fmtTimestamp(createdAt)}</span>
          </div>
          <div className="rcpt-meta-item">
            <span className="rcpt-meta-key">Payment Method</span>
            <span className="rcpt-meta-val rcpt-method-badge">
              {method === 'cash'
                ? <><Banknote size={12} /> Cash</>
                : <><CreditCard size={12} /> Card</>}
            </span>
          </div>
        </div>

        <hr className="rcpt-rule dashed" />

        {/* ── Itemized Table ────────────────────────── */}
        <div className="rcpt-items-wrap">
          <table className="rcpt-table" aria-label="Itemized receipt">
            <thead>
              <tr>
                <th className="rcpt-th">Item</th>
                <th className="rcpt-th right">Unit</th>
                <th className="rcpt-th center">Qty</th>
                <th className="rcpt-th right">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.id} className="rcpt-tr">
                  <td className="rcpt-td item-name">{item.name}</td>
                  <td className="rcpt-td right">{fmt(item.price)}</td>
                  <td className="rcpt-td center">{item.qty}</td>
                  <td className="rcpt-td right bold">{fmt(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <hr className="rcpt-rule dashed" />

        {/* ── Totals ────────────────────────────────── */}
        <div className="rcpt-totals">
          <div className="rcpt-total-row">
            <span>Subtotal</span>
            <span>{fmt(subtotal)}</span>
          </div>
          {discountValue > 0 && (
            <div className="rcpt-total-row discount">
              <span>Discount</span>
              <span>− {fmt(discountValue)}</span>
            </div>
          )}
          <div className="rcpt-total-row">
            <span>Tax (8%)</span>
            <span>{fmt(tax)}</span>
          </div>

          <hr className="rcpt-rule" />

          <div className="rcpt-total-row grand">
            <span>Grand Total</span>
            <span>{fmt(grandTotal)}</span>
          </div>

          {method === 'cash' && (
            <>
              <div className="rcpt-total-row muted">
                <span>Cash Tendered</span>
                <span>{fmt(tendered)}</span>
              </div>
              <div className="rcpt-total-row change">
                <span>Change</span>
                <span>{fmt(change)}</span>
              </div>
            </>
          )}
        </div>

        <hr className="rcpt-rule" />

        {/* ── Footer Note ───────────────────────────── */}
        <p className="rcpt-footer-note">
          Thank you for shopping at EGOTECH WORLD! 🛒
        </p>

        {/* ── Actions ──────────────────────────────── */}
        <div className="rcpt-actions">
          <button
            id="receipt-new-bill-btn"
            className="rcpt-new-bill-btn"
            onClick={onNewBill}
          >
            <PlusCircle size={16} />
            <span>New Bill</span>
          </button>
          <button
            id="receipt-print-btn"
            className="rcpt-print-btn"
            onClick={handlePrint}
          >
            <Printer size={16} />
            <span>Print Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
}
