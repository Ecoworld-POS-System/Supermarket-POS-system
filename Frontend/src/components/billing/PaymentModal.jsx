import { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Banknote,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Nfc,
  Receipt,
  Delete,
  Loader2,
} from 'lucide-react';
import { createBill } from '../../services/api';

/** Format as LKR X,XXX.00 */
function fmt(n) {
  return `LKR ${n.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Sri Lankan denomination chips (ascending)
const DENOM_CHIPS = [100, 500, 1000, 2000, 5000];

// Numpad layout rows × cols
const NUMPAD_ROWS = [
  [{ label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }],
  [{ label: '4', value: '4' }, { label: '5', value: '5' }, { label: '6', value: '6' }],
  [{ label: '7', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' }],
  [{ label: 'C', action: 'clear' }, { label: '0', value: '0' }, { label: '.', value: '.' }],
];

/**
 * PaymentModal — Cash / Card payment overlay with numeric keypad.
 *
 * Props:
 *   summary   { subtotal, discountValue, tax, grandTotal, cart }
 *   cashier   string  — cashier display name (from App shell)
 *   onClose   () => void
 *   onConfirm (savedBill, paymentDetails) => void  — triggers receipt modal
 */
export default function PaymentModal({ summary, cashier = 'Cashier 01', onClose, onConfirm }) {
  const [method, setMethod]       = useState('cash');   // 'cash' | 'card'
  const [tendered, setTendered]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]   = useState(null);
  const tenderRef                 = useRef(null);

  const { grandTotal = 0 } = summary ?? {};

  /* Auto-focus tender input when Cash tab is active */
  useEffect(() => {
    if (method === 'cash') {
      setTimeout(() => tenderRef.current?.focus(), 50);
    }
  }, [method]);

  /* Reset tender + errors when modal first opens */
  useEffect(() => {
    setTendered('');
    setApiError(null);
  }, []);

  /* Keyboard: Escape → close (only if not submitting) */
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && !submitting) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  /* Derived cash values */
  const tenderedNum = useMemo(() => {
    const n = parseFloat(tendered);
    return isNaN(n) ? 0 : n;
  }, [tendered]);

  const change      = tenderedNum - grandTotal;
  const isShort     = method === 'cash' && tenderedNum > 0 && change < 0;
  const canComplete = !submitting && (
    method === 'card' || (method === 'cash' && tenderedNum >= grandTotal)
  );

  /* ── Numpad handler ─────────────────────────────────── */
  function handleNumpadKey(key) {
    if (key.action === 'clear') {
      setTendered('');
      tenderRef.current?.focus();
      return;
    }
    const digit = key.value;
    setTendered(prev => {
      if (digit === '.' && prev.includes('.')) return prev;
      if (digit !== '.' && prev === '0') return digit;
      const dotIdx = prev.indexOf('.');
      if (dotIdx !== -1 && prev.length - dotIdx > 2) return prev;
      return prev + digit;
    });
  }

  /* Denomination chip: add value to current tendered */
  function addDenom(val) {
    setTendered(prev => String((parseFloat(prev) || 0) + val));
  }

  /* "Exact" chip — rounds up to nearest rupee */
  function setExact() {
    setTendered(String(Math.ceil(grandTotal)));
  }

  /* Tender input — manual keyboard fallback */
  function handleTenderChange(e) {
    setTendered(e.target.value.replace(/[^0-9.]/g, ''));
  }

  /* ── Submit to backend ──────────────────────────────── */
  async function handleConfirm() {
    if (!canComplete) return;

    const { cart = [], subtotal = 0, tax = 0, discountValue: discount = 0 } = summary ?? {};

    // Build the payload the backend expects
    const payload = {
      cashier,
      items: cart.map(item => ({
        productId: item.id,          // MongoDB _id stored as 'id' after normalise()
        name:      item.name,
        unitPrice: item.price,
        quantity:  item.qty,
        lineTotal: parseFloat((item.price * item.qty).toFixed(2)),
      })),
      subtotal:      parseFloat(subtotal.toFixed(2)),
      tax:           parseFloat(tax.toFixed(2)),
      discount:      parseFloat(discount.toFixed(2)),
      grandTotal:    parseFloat(grandTotal.toFixed(2)),
      paymentMethod: method === 'cash' ? 'Cash' : 'Card',
      tenderedAmount: method === 'cash' ? tenderedNum : grandTotal,
      changeDue:     method === 'cash' ? Math.max(0, parseFloat(change.toFixed(2))) : 0,
    };

    try {
      setSubmitting(true);
      setApiError(null);

      const savedBill = await createBill(payload);

      // Pass both the saved bill (with server billNumber + createdAt)
      // and the local payment details needed for the receipt display
      onConfirm(savedBill, {
        ...summary,
        method,
        tendered: method === 'cash' ? tenderedNum : grandTotal,
        change:   method === 'cash' ? Math.max(0, change) : 0,
      });
    } catch (err) {
      // Surface error without closing the modal or clearing the cart
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="pmo-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Payment"
      onClick={e => !submitting && e.target === e.currentTarget && onClose()}
    >
      <div className="pmo-modal">

        {/* ── Modal Header ──────────────────────────── */}
        <div className="pmo-header">
          <div className="pmo-header-left">
            <Receipt size={18} />
            <span>Process Payment</span>
          </div>
          <button
            id="payment-modal-close-btn"
            className="pmo-close-btn"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close payment modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── API Error Banner ───────────────────────── */}
        {apiError && (
          <div className="pmo-api-error" role="alert" aria-live="assertive">
            <AlertCircle size={16} />
            <span>{apiError}</span>
          </div>
        )}

        {/* ── Grand Total Banner ────────────────────── */}
        <div className="pmo-grand-total-banner">
          <span className="pmo-gt-label">Grand Total</span>
          <span className="pmo-gt-value">{fmt(grandTotal)}</span>
        </div>

        {/* ── Payment Method Toggle ─────────────────── */}
        <div className="pmo-method-toggle">
          <button
            id="payment-method-cash"
            className={`pmo-method-btn${method === 'cash' ? ' active' : ''}`}
            onClick={() => setMethod('cash')}
            disabled={submitting}
          >
            <Banknote size={18} />
            <span>Cash</span>
          </button>
          <button
            id="payment-method-card"
            className={`pmo-method-btn${method === 'card' ? ' active' : ''}`}
            onClick={() => setMethod('card')}
            disabled={submitting}
          >
            <CreditCard size={18} />
            <span>Card</span>
          </button>
        </div>

        {/* ── Cash Panel ───────────────────────────── */}
        {method === 'cash' && (
          <div className="pmo-cash-panel">

            {/* Tender input display */}
            <label className="pmo-field-label" htmlFor="payment-tender-input">
              CASH TENDERED (LKR)
            </label>
            <div className="pmo-tender-wrap">
              <span className="pmo-tender-prefix">LKR</span>
              <input
                id="payment-tender-input"
                ref={tenderRef}
                type="text"
                inputMode="none"
                className={`pmo-tender-input${isShort ? ' short' : ''}`}
                placeholder="0.00"
                value={tendered}
                onChange={handleTenderChange}
                autoComplete="off"
                aria-label="Cash tendered amount"
                readOnly
                disabled={submitting}
              />
              {tendered.length > 0 && (
                <button
                  className="pmo-tender-clear-btn"
                  onClick={() => setTendered('')}
                  aria-label="Clear tendered amount"
                  tabIndex={-1}
                  disabled={submitting}
                >
                  <Delete size={14} />
                </button>
              )}
            </div>

            {/* ── Numeric Keypad ───────────────────── */}
            <div className="pmo-numpad" role="group" aria-label="Numeric keypad">
              {NUMPAD_ROWS.map((row, ri) => (
                <div key={ri} className="pmo-numpad-row">
                  {row.map(key => (
                    <button
                      key={key.label}
                      id={`numpad-key-${key.label}`}
                      className={`pmo-numpad-btn${key.action === 'clear' ? ' clear' : ''}`}
                      onClick={() => handleNumpadKey(key)}
                      aria-label={key.action === 'clear' ? 'Clear' : key.label}
                      disabled={submitting}
                    >
                      {key.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* ── Denomination Chips ───────────────── */}
            <div className="pmo-denom-chips">
              {DENOM_CHIPS.map(d => (
                <button
                  key={d}
                  id={`payment-denom-${d}`}
                  className="pmo-denom-chip"
                  onClick={() => addDenom(d)}
                  disabled={submitting}
                >
                  +{d.toLocaleString()}
                </button>
              ))}
              <button
                id="payment-denom-exact"
                className="pmo-denom-chip exact"
                onClick={setExact}
                disabled={submitting}
              >
                Exact
              </button>
            </div>

            {/* ── Change / Shortage Row ───────────── */}
            <div className={`pmo-change-row${isShort ? ' short' : change > 0 ? ' surplus' : ''}`}>
              {isShort ? (
                <>
                  <AlertCircle size={16} />
                  <span>Short by {fmt(Math.abs(change))}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Change Due</span>
                  <span className="pmo-change-value">{change >= 0 ? fmt(change) : '—'}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Card Panel ───────────────────────────── */}
        {method === 'card' && (
          <div className="pmo-card-panel">
            <div className="pmo-card-terminal">
              <div className="pmo-card-pulse">
                <Nfc size={32} />
              </div>
              <p className="pmo-card-instruction">
                Please swipe or tap card on the POS terminal.
              </p>
              <p className="pmo-card-sub">
                Visa · Mastercard · AMEX · Lanka QR accepted
              </p>
            </div>
          </div>
        )}

        {/* ── Action Buttons ────────────────────────── */}
        <div className="pmo-actions">
          <button
            id="payment-cancel-btn"
            className="pmo-cancel-btn"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            id="payment-complete-btn"
            className="pmo-complete-btn"
            onClick={handleConfirm}
            disabled={!canComplete}
            aria-disabled={!canComplete}
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Processing…</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} strokeWidth={2.5} />
                <span>Complete &amp; Print Bill</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
