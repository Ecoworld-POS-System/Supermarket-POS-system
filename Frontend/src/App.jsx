import { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar        from './components/Sidebar';
import ProductCatalog from './components/billing/ProductCatalog';
import CartSidebar    from './components/billing/CartSidebar';
import PaymentModal   from './components/billing/PaymentModal';
import ReceiptModal   from './components/billing/ReceiptModal';
import './App.css';

/**
 * App — Root POS shell.
 *
 * Layout: [Nav Sidebar] | [Billing View: ProductCatalog + CartSidebar]
 *
 * Data flow:
 *   ProductCatalog  ──onStockUpdate──▶  App (products state)
 *   App             ──products──▶       CartSidebar  (stock cap per item)
 *   CartSidebar     ──onPayment──▶      App → opens PaymentModal
 *   PaymentModal    ──onConfirm──▶      App (savedBill + paymentDetails)
 *   App             ──▶                 ReceiptModal (savedBill + payment)
 *   ReceiptModal    ──onNewBill──▶      App → clear cart
 *
 * Keyboard shortcuts:
 *   F1     → open PaymentModal  (billing page, cart non-empty)
 *   F2     → focus barcode search  (handled inside ProductCatalog)
 *   F4     → clear cart
 *   Escape → close topmost modal
 */
export default function App() {
  const [activePage, setActivePage] = useState('billing');

  /* ── Product stock index (refreshed from backend by ProductCatalog) ── */
  // Keyed by product id for O(1) stock lookups during cart operations.
  const [productIndex, setProductIndex] = useState({});

  /* ── Cart state ─────────────────────────────── */
  const [cart, setCart]   = useState([]);
  const billTimestamp     = useRef(new Date());

  /* ── Modal state ────────────────────────────── */
  const [paymentOpen,  setPaymentOpen]  = useState(false);
  const [receiptState, setReceiptState] = useState(null); // { savedBill, payment }
  const pendingSummary                  = useRef(null);

  /* ── Keyboard shortcuts ─────────────────────── */
  const openPayment  = useCallback(() => {
    if (activePage === 'billing' && cart.length > 0) setPaymentOpen(true);
  }, [activePage, cart.length]);

  const closePayment = useCallback(() => setPaymentOpen(false), []);
  const closeReceipt = useCallback(() => setReceiptState(null), []);

  useEffect(() => {
    function onKey(e) {
      const tag     = document.activeElement?.tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if (e.key === 'F1') {
        e.preventDefault();
        if (!paymentOpen && !receiptState) openPayment();
      }
      if (e.key === 'F4' && !inInput) {
        e.preventDefault();
        if (!paymentOpen && !receiptState) handleClearCart();
      }
      if (e.key === 'Escape') {
        if (paymentOpen)  closePayment();
        if (receiptState) closeReceipt();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paymentOpen, receiptState, openPayment, closePayment, closeReceipt]);

  /* ── Stock update callback (called by ProductCatalog after fetch) ─── */
  const handleStockUpdate = useCallback((freshProducts) => {
    const index = {};
    freshProducts.forEach(p => { index[p.id] = p.stock; });
    setProductIndex(index);

    // Sync live stock into any existing cart items so the stepper cap
    // always reflects the most recent inventory snapshot.
    setCart(prev => prev.map(item => ({
      ...item,
      stock: index[item.id] ?? item.stock,
    })));
  }, []);

  /* ── Cart mutations ─────────────────────────── */
  function handleAddItem(product) {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        // Respect stock cap even when adding via product grid
        const newQty = existing.qty + 1;
        const cap    = productIndex[product.id] ?? product.stock ?? Infinity;
        if (newQty > cap) return prev; // silently cap (CartSidebar shows the toast)
        return prev.map(i => i.id === product.id ? { ...i, qty: newQty } : i);
      }
      return [
        ...prev,
        {
          ...product,
          qty:   1,
          stock: productIndex[product.id] ?? product.stock ?? 0,
        },
      ];
    });
  }

  function handleIncrement(id) {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i;
      const cap = productIndex[id] ?? i.stock ?? Infinity;
      return i.qty < cap ? { ...i, qty: i.qty + 1 } : i;
    }));
  }

  function handleDecrement(id) {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i)
          .filter(i => i.qty > 0),
    );
  }

  function handleRemove(id) {
    setCart(prev => prev.filter(i => i.id !== id));
  }

  function handleClearCart() {
    setCart([]);
    billTimestamp.current = new Date();
  }

  /* ── Payment flow ───────────────────────────── */
  function handleOpenPaymentWithSummary(summary) {
    pendingSummary.current = summary;
    setPaymentOpen(true);
  }

  /**
   * Called by PaymentModal after a successful POST /api/bills.
   * @param {Object} savedBill     – the full bill document from the server
   * @param {Object} paymentDetails – local cash/card totals for the receipt UI
   */
  function handlePaymentConfirm(savedBill, paymentDetails) {
    setPaymentOpen(false);
    setReceiptState({ savedBill, payment: paymentDetails });

    // Deduct sold quantities from local product index so the catalog
    // immediately reflects reduced stock without waiting for a full re-fetch.
    setProductIndex(prev => {
      const updated = { ...prev };
      (paymentDetails.cart ?? []).forEach(item => {
        if (updated[item.id] !== undefined) {
          updated[item.id] = Math.max(0, updated[item.id] - item.qty);
        }
      });
      return updated;
    });
  }

  /** ReceiptModal "New Bill" → reset everything */
  function handleNewBill() {
    setReceiptState(null);
    handleClearCart();
  }

  /* ── Derived summary for PaymentModal fallback ── */
  const TAX_RATE    = 0.08;
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="app-shell">
      {/* ── Navigation Sidebar ── */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* ── Main Content Area ── */}
      <main className="app-main">
        {activePage === 'billing' ? (
          <div className="billing-view">
            <ProductCatalog
              cart={cart}
              onAddItem={handleAddItem}
              onStockUpdate={handleStockUpdate}
            />

            <CartSidebar
              cart={cart}
              billTimestamp={billTimestamp.current}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onRemove={handleRemove}
              onClearCart={handleClearCart}
              onPayment={handleOpenPaymentWithSummary}
            />
          </div>
        ) : (
          <div className="app-placeholder">
            <p className="app-placeholder-label">
              {activePage.charAt(0).toUpperCase() + activePage.slice(1)} page coming soon.
            </p>
          </div>
        )}
      </main>

      {/* ── Payment Modal ── */}
      {paymentOpen && (
        <PaymentModal
          summary={pendingSummary.current ?? {
            subtotal:      cartSubtotal,
            discountValue: 0,
            tax:           cartSubtotal * TAX_RATE,
            grandTotal:    cartSubtotal * (1 + TAX_RATE),
            cart,
          }}
          cashier="Admin"
          onClose={closePayment}
          onConfirm={handlePaymentConfirm}
        />
      )}

      {/* ── Receipt Modal ── */}
      {receiptState && (
        <ReceiptModal
          savedBill={receiptState.savedBill}
          payment={receiptState.payment}
          onNewBill={handleNewBill}
          onClose={closeReceipt}
        />
      )}
    </div>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProductManagement from './pages/ProductManagement';
import CategoryManagement from './pages/CategoryManagement';
import ModalPreviewPage from './pages/ModalPreviewPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductManagement />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/categories" element={<CategoryManagement />} />
        <Route path="/modal" element={<ModalPreviewPage />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
