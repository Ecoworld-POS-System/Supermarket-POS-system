import { useMemo, useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  CreditCard,
  X,
  Receipt,
  Tag,
  AlertTriangle,
} from 'lucide-react';

/** Format as LKR X,XXX.00 */
function fmt(n) {
  return `LKR ${n.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const TAX_RATE = 0.08; // 8%

/**
 * CartSidebar — Live bill panel shown to the right of the product catalog.
 *
 * Props:
 *   cart           {Array}    – [{ id, name, barcode, price, qty, stock, category }]
 *   billTimestamp  {Date}     – when the current bill session was started
 *   onIncrement    {function} – (id) => void
 *   onDecrement    {function} – (id) => void  (removes item when qty reaches 0)
 *   onRemove       {function} – (id) => void
 *   onClearCart    {function} – () => void
 *   onPayment      {function} – (summary) => void  — opens payment modal
 */
export default function CartSidebar({
  cart = [],
  billTimestamp = new Date(),
  onIncrement   = () => {},
  onDecrement   = () => {},
  onRemove      = () => {},
  onClearCart   = () => {},
  onPayment     = () => {},
}) {
  const [discount, setDiscount]     = useState('');
  const [stockToast, setStockToast] = useState(null); // { message }
  const toastTimerRef               = useRef(null);

  /* ── Derived totals ────────────────────────────────────────────────── */
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart],
  );

  const discountValue = useMemo(() => {
    const parsed = parseFloat(discount);
    if (isNaN(parsed) || parsed <= 0) return 0;
    // ≤ 100 → percentage; > 100 → fixed LKR amount
    if (parsed <= 100) return (subtotal * parsed) / 100;
    return Math.min(parsed, subtotal);
  }, [discount, subtotal]);

  const taxableAmount = subtotal - discountValue;
  const tax           = taxableAmount * TAX_RATE;
  const grandTotal    = taxableAmount + tax;
  const totalItems    = cart.reduce((sum, i) => sum + i.qty, 0);

  /* ── Bill label from timestamp ─────────────────────────────────────── */
  const billLabel = billTimestamp.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  /* ── Confirm clear guard ────────────────────────────────────────────── */
  const [confirmClear, setConfirmClear] = useState(false);

  function handleClearClick() {
    if (confirmClear) {
      onClearCart();
      setConfirmClear(false);
      setDiscount('');
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  }

  /* ── Stock-capped increment ─────────────────────────────────────────── */
  function handleIncrement(item) {
    const availableStock = item.stock ?? Infinity;

    if (item.qty >= availableStock) {
      // At stock cap — show warning toast, don't increment
      showStockToast(`Only ${availableStock} unit${availableStock !== 1 ? 's' : ''} available for "${item.name}".`);
      return;
    }

    // Warn if next increment would reach the last unit
    if (item.qty + 1 === availableStock && availableStock <= 5) {
      showStockToast(`⚠ Low stock: only ${availableStock} unit${availableStock !== 1 ? 's' : ''} of "${item.name}" remain.`);
    }

    onIncrement(item.id);
  }

  function showStockToast(message) {
    setStockToast({ message });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setStockToast(null), 3500);
  }

  // Clean up on unmount
  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  /* ── Proceed to payment ─────────────────────────────────────────────── */
  function handlePayment() {
    if (cart.length === 0) return;
    onPayment({ subtotal, discountValue, tax, grandTotal, cart });
  }

  /* ── Discount input handler ─────────────────────────────────────────── */
  function handleDiscountChange(e) {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setDiscount(val);
  }

  return (
    <aside className="cart-sidebar" aria-label="Live cart">

      {/* ── Header ──────────────────────────────────── */}
      <div className="csb-header">
        <div className="csb-title">
          <ShoppingCart size={17} strokeWidth={2.5} />
          <span>Cart</span>
          {totalItems > 0 && (
            <span className="csb-count-badge" aria-label={`${totalItems} items`}>
              {totalItems}
            </span>
          )}
        </div>
        <div className="csb-bill-tag">
          <Receipt size={12} />
          <span>Bill #{billLabel}</span>
        </div>
      </div>

      {/* ── Stock Warning Toast ──────────────────────── */}
      {stockToast && (
        <div className="csb-stock-toast" role="alert" aria-live="assertive">
          <AlertTriangle size={14} />
          <span>{stockToast.message}</span>
        </div>
      )}

      {/* ── Item List ───────────────────────────────── */}
      <div className="csb-items" role="list" aria-label="Cart items">
        {cart.length === 0 ? (
          <div className="csb-empty">
            <ShoppingCart size={36} opacity={0.25} />
            <p>Your cart is empty.</p>
            <p className="csb-empty-sub">Scan a barcode or tap + Add on a product.</p>
          </div>
        ) : (
          cart.map(item => {
            const availableStock = item.stock ?? Infinity;
            const atStockCap     = item.qty >= availableStock;
            const isLowStock     = availableStock > 0 && availableStock <= 5;

            return (
              <div key={item.id} className="csb-item" role="listitem">
                {/* Item info */}
                <div className="csb-item-info">
                  <p className="csb-item-name">{item.name}</p>
                  <p className="csb-item-unit">
                    {fmt(item.price)} / unit
                    {isLowStock && (
                      <span className="csb-item-low-badge" title="Low stock">
                        <AlertTriangle size={10} /> {availableStock} left
                      </span>
                    )}
                  </p>
                </div>

                {/* Quantity stepper */}
                <div className="csb-qty-control">
                  <button
                    id={`cart-dec-${item.id}`}
                    className="csb-qty-btn csb-qty-minus"
                    onClick={() => onDecrement(item.id)}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    <Minus size={12} strokeWidth={3} />
                  </button>

                  <span className="csb-qty-value" aria-label={`Quantity: ${item.qty}`}>
                    {item.qty}
                  </span>

                  <button
                    id={`cart-inc-${item.id}`}
                    className={`csb-qty-btn csb-qty-plus${atStockCap ? ' at-cap' : ''}`}
                    onClick={() => handleIncrement(item)}
                    aria-label={`Increase quantity of ${item.name}`}
                    aria-disabled={atStockCap}
                    title={atStockCap ? `Max stock reached (${availableStock})` : undefined}
                  >
                    <Plus size={12} strokeWidth={3} />
                  </button>
                </div>

                {/* Line total */}
                <span className="csb-item-total">{fmt(item.price * item.qty)}</span>

                {/* Remove */}
                <button
                  id={`cart-remove-${item.id}`}
                  className="csb-remove-btn"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <X size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* ── Calculation Summary ──────────────────────── */}
      <div className="csb-summary">
        {/* Subtotal */}
        <div className="csb-sum-row">
          <span className="csb-sum-label">Subtotal</span>
          <span className="csb-sum-value">{fmt(subtotal)}</span>
        </div>

        {/* Discount */}
        <div className="csb-sum-row csb-discount-row">
          <div className="csb-discount-label-wrap">
            <Tag size={12} />
            <span className="csb-sum-label">Discount</span>
            <span className="csb-discount-hint">% or LKR</span>
          </div>
          <div className="csb-discount-input-wrap">
            <input
              id="cart-discount-input"
              type="text"
              inputMode="decimal"
              className="csb-discount-input"
              placeholder="0"
              value={discount}
              onChange={handleDiscountChange}
              aria-label="Discount amount or percentage"
            />
            {discountValue > 0 && (
              <span className="csb-discount-saved">-{fmt(discountValue)}</span>
            )}
          </div>
        </div>

        {/* Tax */}
        <div className="csb-sum-row">
          <span className="csb-sum-label">Tax (8%)</span>
          <span className="csb-sum-value">{fmt(tax)}</span>
        </div>

        {/* Divider */}
        <hr className="csb-divider" />

        {/* Grand Total */}
        <div className="csb-grand-total">
          <span className="csb-grand-label">Grand Total</span>
          <span className="csb-grand-value">{fmt(grandTotal)}</span>
        </div>
      </div>

      {/* ── Action Buttons ───────────────────────────── */}
      <div className="csb-actions">
        {/* Primary — Proceed to Payment */}
        <button
          id="cart-proceed-payment-btn"
          className="csb-pay-btn"
          onClick={handlePayment}
          disabled={cart.length === 0}
          aria-disabled={cart.length === 0}
        >
          <CreditCard size={18} strokeWidth={2.5} />
          <span>Proceed to Payment</span>
        </button>

        {/* Secondary — Clear Cart */}
        <button
          id="cart-clear-btn"
          className={`csb-clear-btn${confirmClear ? ' confirm' : ''}`}
          onClick={handleClearClick}
          disabled={cart.length === 0}
          aria-disabled={cart.length === 0}
        >
          <Trash2 size={15} />
          <span>{confirmClear ? 'Tap again to confirm clear' : 'Clear Cart'}</span>
        </button>
      </div>
    </aside>
  );
}
