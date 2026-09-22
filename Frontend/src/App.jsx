import { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from './components/Layout/AppLayout';
import ProductCatalog from './components/billing/ProductCatalog';
import CartSidebar from './components/billing/CartSidebar';
import PaymentModal from './components/billing/PaymentModal';
import ReceiptModal from './components/billing/ReceiptModal';
import ReportsAnalyticsView from './components/analytics/ReportsAnalyticsView';
import BillHistoryView from './components/bill-history/BillHistoryView';
import './App.css';

export default function App() {
  const getPageFromHash = () => {
    const hash = window.location.hash.toLowerCase().replace('#', '');
    if (hash === 'billing' || hash.startsWith('billing')) return 'billing';
    if (hash.includes('report') || hash.includes('analytics')) return 'reports';
    if (hash.includes('bill') || hash.includes('history')) return 'history';
    if (hash === 'products') return 'products';
    if (hash === 'categories') return 'categories';
    if (hash === 'inventory') return 'inventory';
    if (hash === 'users') return 'users';
    if (hash === 'dashboard') return 'dashboard';
    return 'billing';
  };

  const [activePage, setActivePage] = useState(getPageFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setActivePage(getPageFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page) => {
    setActivePage(page);
    const hashMap = {
      reports:    '#reports',
      history:    '#bill-history',
      billing:    '#billing',
      dashboard:  '#dashboard',
      products:   '#products',
      categories: '#categories',
      inventory:  '#inventory',
      users:      '#users',
    };
    window.location.hash = hashMap[page] ?? `#${page}`;
  };

  /* ── Product stock index ── */
  const [productIndex, setProductIndex] = useState({});

  /* ── Cart state ── */
  const [cart, setCart] = useState([]);
  const billTimestamp = useRef(new Date());

  /* ── Modal state ── */
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptState, setReceiptState] = useState(null);
  const pendingSummary = useRef(null);

  /* ── Keyboard shortcuts ── */
  const openPayment = useCallback(() => {
    if (activePage === 'billing' && cart.length > 0) setPaymentOpen(true);
  }, [activePage, cart.length]);

  const closePayment = useCallback(() => setPaymentOpen(false), []);
  const closeReceipt = useCallback(() => setReceiptState(null), []);

  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName;
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
        if (paymentOpen) closePayment();
        if (receiptState) closeReceipt();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paymentOpen, receiptState, openPayment, closePayment, closeReceipt]);

  const handleStockUpdate = useCallback((freshProducts) => {
    const index = {};
    freshProducts.forEach(p => { index[p.id] = p.stock; });
    setProductIndex(index);
    setCart(prev => prev.map(item => ({
      ...item,
      stock: index[item.id] ?? item.stock,
    })));
  }, []);

  function handleAddItem(product) {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        const newQty = existing.qty + 1;
        const cap = productIndex[product.id] ?? product.stock ?? Infinity;
        if (newQty > cap) return prev;
        return prev.map(i => i.id === product.id ? { ...i, qty: newQty } : i);
      }
      return [
        ...prev,
        {
          ...product,
          qty: 1,
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

  function handleOpenPaymentWithSummary(summary) {
    pendingSummary.current = summary;
    setPaymentOpen(true);
  }

  function handlePaymentConfirm(savedBill, paymentDetails) {
    setPaymentOpen(false);
    setReceiptState({ savedBill, payment: paymentDetails });
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

  function handleNewBill() {
    setReceiptState(null);
    handleClearCart();
  }

  const TAX_RATE = 0.08;
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Map activePage keys to readable titles for layout
  const pageTitles = {
    billing: 'Billing & Payment',
    history: 'Bill History',
    reports: 'Reports & Analytics',
    dashboard: 'Dashboard',
    products: 'Products',
    categories: 'Categories',
    inventory: 'Inventory',
    users: 'User Management',
  };

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={handleNavigate}
    >
      {/* ── Main Content Area Rendered Inside AppLayout ── */}
      <div className="h-full">
        {activePage === 'billing' ? (
          <div className="billing-view flex h-full">
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
        ) : activePage === 'reports' ? (
          <ReportsAnalyticsView />
        ) : activePage === 'history' ? (
          <BillHistoryView />
        ) : (
          <div className="app-placeholder p-6">
            <p className="app-placeholder-label text-gray-600 text-lg font-medium">
              {activePage.charAt(0).toUpperCase() + activePage.slice(1)} page coming soon.
            </p>
          </div>
        )}
      </div>

      {/* ── Payment Modal ── */}
      {paymentOpen && (
        <PaymentModal
          summary={pendingSummary.current ?? {
            subtotal: cartSubtotal,
            discountValue: 0,
            tax: cartSubtotal * TAX_RATE,
            grandTotal: cartSubtotal * (1 + TAX_RATE),
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
    </AppLayout>
  );
 yasintha-Bill-History-Management-v2
}

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
 main
