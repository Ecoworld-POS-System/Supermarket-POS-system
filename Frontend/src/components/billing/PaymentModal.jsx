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
import ModalPortal from '../layout/ModalPortal';

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

export default function PaymentModal({ summary, cashier = 'Cashier 01', onClose, onConfirm }) {
  const [method, setMethod]         = useState('cash');   // 'cash' | 'card'
  const [tendered, setTendered]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState(null);
  const tenderRef                   = useRef(null);

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

    const payload = {
      cashier,
      items: cart.map(item => ({
        productId: item.id,
        name:      item.name,
        unitPrice: item.price,
        quantity:  item.qty,
        lineTotal: parseFloat((item.price * item.qty).toFixed(2)),
      })),
      subtotal:       parseFloat(subtotal.toFixed(2)),
      tax:            parseFloat(tax.toFixed(2)),
      discount:       parseFloat(discount.toFixed(2)),
      grandTotal:     parseFloat(grandTotal.toFixed(2)),
      paymentMethod:  method === 'cash' ? 'Cash' : 'Card',
      tenderedAmount: method === 'cash' ? tenderedNum : grandTotal,
      changeDue:      method === 'cash' ? Math.max(0, parseFloat(change.toFixed(2))) : 0,
    };

    try {
      setSubmitting(true);
      setApiError(null);

      const savedBill = await createBill(payload);

      onConfirm(savedBill, {
        ...summary,
        method,
        tendered: method === 'cash' ? tenderedNum : grandTotal,
        change:   method === 'cash' ? Math.max(0, change) : 0,
      });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalPortal>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Payment"
        onClick={e => !submitting && e.target === e.currentTarget && onClose()}
      >
        <div
          style={{ backgroundColor: '#ffffff' }}
          className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-100 p-5 animate-scale-up"
          onClick={e => e.stopPropagation()}
        >
          {/* ── Modal Header ──────────────────────────── */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#4A80B4] flex items-center justify-center shadow-xs">
                <Receipt size={16} />
              </div>
              <span>Process Payment</span>
            </div>
            <button
              id="payment-modal-close-btn"
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close payment modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── API Error Banner ───────────────────────── */}
          {apiError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium flex items-center gap-2 mb-3" role="alert" aria-live="assertive">
              <AlertCircle size={16} />
              <span>{apiError}</span>
            </div>
          )}

          {/* ── Grand Total Banner ────────────────────── */}
          <div className="bg-emerald-50 text-emerald-950 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between shadow-xs mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Grand Total</span>
            <span className="font-mono text-3xl font-extrabold text-emerald-700">{fmt(grandTotal)}</span>
          </div>

          {/* ── Payment Method Toggle ─────────────────── */}
          <div className="flex gap-2 mb-4">
            <button
              id="payment-method-cash"
              className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors border cursor-pointer ${
                method === 'cash'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
              onClick={() => setMethod('cash')}
              disabled={submitting}
            >
              <Banknote size={18} />
              <span>Cash</span>
            </button>
            <button
              id="payment-method-card"
              className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors border cursor-pointer ${
                method === 'card'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
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
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1" htmlFor="payment-tender-input">
                CASH TENDERED (LKR)
              </label>
              <div className="relative flex items-center mb-3">
                <span className="absolute left-3.5 text-xs font-bold text-slate-400">LKR</span>
                <input
                  id="payment-tender-input"
                  ref={tenderRef}
                  type="text"
                  inputMode="none"
                  className={`w-full border rounded-xl pl-12 pr-10 py-2.5 text-base font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50 ${
                    isShort ? 'border-rose-400 text-rose-600' : 'border-slate-200 text-slate-800 focus:border-emerald-500'
                  }`}
                  placeholder="0.00"
                  value={tendered}
                  onChange={handleTenderChange}
                  autoComplete="off"
                  readOnly
                  disabled={submitting}
                />
                {tendered.length > 0 && (
                  <button
                    className="absolute right-3 text-slate-400 hover:text-rose-500 cursor-pointer"
                    onClick={() => setTendered('')}
                    aria-label="Clear tendered amount"
                    tabIndex={-1}
                    disabled={submitting}
                  >
                    <Delete size={16} />
                  </button>
                )}
              </div>

              {/* ── Numeric Keypad ───────────────────── */}
              <div className="grid grid-cols-3 gap-1.5 mb-3" role="group" aria-label="Numeric keypad">
                {NUMPAD_ROWS.flat().map(key => (
                  <button
                    key={key.label}
                    id={`numpad-key-${key.label}`}
                    className={`py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 transition-colors cursor-pointer ${
                      key.action === 'clear' ? 'text-rose-600 hover:bg-rose-50' : ''
                    }`}
                    onClick={() => handleNumpadKey(key)}
                    disabled={submitting}
                  >
                    {key.label}
                  </button>
                ))}
              </div>

              {/* ── Denomination Chips ───────────────── */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {DENOM_CHIPS.map(d => (
                  <button
                    key={d}
                    id={`payment-denom-${d}`}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-xs transition-colors cursor-pointer"
                    onClick={() => addDenom(d)}
                    disabled={submitting}
                  >
                    +{d.toLocaleString()}
                  </button>
                ))}
                <button
                  id="payment-denom-exact"
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl px-3 py-1.5 font-bold text-xs transition-colors cursor-pointer"
                  onClick={setExact}
                  disabled={submitting}
                >
                  Exact
                </button>
              </div>

              {/* ── Change / Shortage Row ───────────── */}
              <div className={`p-3 rounded-xl flex items-center justify-between font-bold text-sm ${
                isShort
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {isShort ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <AlertCircle size={16} />
                      <span>Short by</span>
                    </div>
                    <span>{fmt(Math.abs(change))}</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={16} />
                      <span>Change Due</span>
                    </div>
                    <span className="font-mono text-base">{change >= 0 ? fmt(change) : '—'}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Card Panel ───────────────────────────── */}
          {method === 'card' && (
            <div className="py-8 flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl border border-slate-200/60 my-2">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#4A80B4] flex items-center justify-center mb-3 shadow-xs animate-pulse">
                <Nfc size={32} />
              </div>
              <p className="font-bold text-slate-800 text-sm">
                Please swipe or tap card on the POS terminal.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Visa · Mastercard · AMEX · Lanka QR accepted
              </p>
            </div>
          )}

          {/* ── Action Buttons ────────────────────────── */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
            <button
              id="payment-cancel-btn"
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl px-5 py-3 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              id="payment-complete-btn"
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold h-12 flex-1 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
              onClick={handleConfirm}
              disabled={!canComplete}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                  <span>Complete &amp; Print Bill</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}