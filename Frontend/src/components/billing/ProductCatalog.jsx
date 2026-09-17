import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  ChevronDown,
  Plus,
  Package,
  AlertTriangle,
  Home,
  CreditCard,
  Loader2,
  WifiOff,
} from 'lucide-react';
import { fetchAllProducts, fetchProductByBarcode } from '../../services/api';

/** Format price as LKR X,XXX.00 */
function formatLKR(amount) {
  return `LKR ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Product emoji map by category */
function categoryEmoji(cat) {
  const map = {
    Beverages: '🧃', Dairy: '🥛', Snacks: '🍪',
    Household: '🧹', Personal: '🧴', Pantry: '🌾', Other: '📦',
  };
  return map[cat] ?? '📦';
}

/** Normalise a raw product from the API into the shape the UI expects */
function normalise(p) {
  return {
    id:       p._id,
    barcode:  p.barcode,
    name:     p.name,
    category: p.category ?? 'Other',
    price:    p.price,
    stock:    p.stock,
    lowStock: p.stock > 0 && p.stock <= 5,
  };
}

/* ── Skeleton card shown while products are loading ────────────────────── */
function SkeletonCard() {
  return (
    <div className="pcard pcard--skeleton" aria-hidden="true">
      <div className="skel skel-emoji" />
      <div className="skel skel-name" />
      <div className="skel skel-barcode" />
      <div className="skel skel-price" />
    </div>
  );
}

const SKELETON_COUNT = 12;

/**
 * ProductCatalog — Browseable product grid with search/filter and Add-to-cart.
 *
 * Props:
 *   cart          {Array}    – current cart items
 *   onAddItem     {function} – (product) => void
 *   onStockUpdate {function} – (products) => void — notifies App of fresh stock data
 */
export default function ProductCatalog({
  cart = [],
  onAddItem = () => {},
  onStockUpdate = () => {},
}) {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [apiError, setApiError]   = useState(null);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [now, setNow]             = useState(new Date());
  const [scanToast, setScanToast] = useState(null); // { message, type: 'error'|'info' }
  const searchRef                 = useRef(null);
  const scanTimeoutRef            = useRef(null);
  const toastTimeoutRef           = useRef(null);

  /* ── Live clock ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ── Load products from backend ─────────────────────────────────────── */
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      const raw = await fetchAllProducts();
      const normalised = raw.map(normalise);
      setProducts(normalised);
      onStockUpdate(normalised); // share fresh stock data with App
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, [onStockUpdate]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  /* ── Auto-focus search on mount; F2 shortcut ────────────────────────── */
  useEffect(() => {
    searchRef.current?.focus();

    function handleKey(e) {
      if (e.key === 'F2') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  /* ── Barcode scanner: Enter key triggers API lookup ─────────────────── */
  async function handleSearchKeyDown(e) {
    if (e.key !== 'Enter') return;
    const query = search.trim();
    if (!query) return;

    // Detect if this looks like a barcode (all digits, ≥ 6 chars)
    const looksLikeBarcode = /^\d{6,}$/.test(query);
    if (!looksLikeBarcode) return; // let normal text filtering handle it

    e.preventDefault();
    clearTimeout(scanTimeoutRef.current);

    try {
      const raw     = await fetchProductByBarcode(query);
      const product = normalise(raw);

      if (product.stock === 0) {
        showScanToast(`${product.name} is out of stock.`, 'error');
        return;
      }

      // Update local stock snapshot so the card reflects live data
      setProducts(prev =>
        prev.map(p => p.barcode === product.barcode ? product : p),
      );

      onAddItem(product);
      setSearch('');
      showScanToast(`${product.name} added to cart ✓`, 'success');
    } catch (err) {
      showScanToast(err.message, 'error');
    }
  }

  function showScanToast(message, type = 'info') {
    setScanToast({ message, type });
    clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setScanToast(null), 3000);
  }

  /* ── Derived data ────────────────────────────────────────────────────── */
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category))).sort();
    return ['All', ...cats];
  }, [products]);

  const cartMap = useMemo(() => {
    const m = {};
    cart.forEach(item => { m[item.id] = item.qty; });
    return m;
  }, [cart]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      const matchCat = category === 'All' || p.category === category;
      const matchQ   = !q
        || p.name.toLowerCase().includes(q)
        || p.barcode.includes(q);
      return matchCat && matchQ;
    });
  }, [products, search, category]);

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div className="catalog-shell">
      {/* ── Breadcrumb + Clock Bar ────────────────── */}
      <div className="catalog-topbar">
        <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
          <Home size={13} className="breadcrumb-home" />
          <span className="breadcrumb-sep">EGOTECH WORLD</span>
          <span className="breadcrumb-divider">/</span>
          <CreditCard size={13} />
          <span className="breadcrumb-active">Billing &amp; Payment</span>
        </nav>
        <div className="catalog-clock">
          <span className="catalog-date">{dateStr}</span>
          <span className="catalog-time">{timeStr}</span>
        </div>
      </div>

      {/* ── Search + Filter Toolbar ───────────────── */}
      <div className="catalog-toolbar">
        {/* Search / barcode input */}
        <div className="catalog-search-wrap">
          <Search size={16} className="catalog-search-icon" />
          <input
            id="catalog-search-input"
            ref={searchRef}
            type="text"
            className="catalog-search-input"
            placeholder="Search by name or scan barcode (Enter)…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            autoComplete="off"
            aria-label="Search products or scan barcode"
          />
        </div>

        {/* Category filter dropdown */}
        <div className="catalog-filter-wrap">
          <select
            id="catalog-category-filter"
            className="catalog-filter-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronDown size={14} className="catalog-filter-chevron" />
        </div>

        {/* Live product counter + reload button */}
        <div className="catalog-counter" aria-live="polite">
          <Package size={14} />
          <span>
            {loading
              ? 'Loading…'
              : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
          </span>
          {!loading && (
            <button
              id="catalog-refresh-btn"
              className="catalog-refresh-btn"
              onClick={loadProducts}
              aria-label="Refresh product list"
              title="Refresh from server"
            >
              ↻
            </button>
          )}
        </div>
      </div>

      {/* ── Scan Toast ─────────────────────────────── */}
      {scanToast && (
        <div
          className={`catalog-scan-toast catalog-scan-toast--${scanToast.type}`}
          role="status"
          aria-live="polite"
        >
          {scanToast.message}
        </div>
      )}

      {/* ── API Error Banner ──────────────────────── */}
      {apiError && !loading && (
        <div className="catalog-error-banner" role="alert">
          <WifiOff size={16} />
          <span>{apiError}</span>
          <button
            id="catalog-retry-btn"
            className="catalog-retry-btn"
            onClick={loadProducts}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Product Grid ─────────────────────────── */}
      <div className="catalog-grid" aria-label="Product catalog" aria-busy={loading}>

        {/* Loading skeletons */}
        {loading && Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}

        {/* Empty state */}
        {!loading && !apiError && filtered.length === 0 && (
          <div className="catalog-empty">
            <Search size={32} opacity={0.3} />
            <p>No products match your search.</p>
          </div>
        )}

        {/* Product cards */}
        {!loading && filtered.map(product => {
          const inCartQty    = cartMap[product.id] ?? 0;
          const isOutOfStock = product.stock === 0;
          const isLowStock   = product.lowStock && !isOutOfStock;

          return (
            <article
              key={product.id}
              className={`pcard${isOutOfStock ? ' pcard--oos' : ''}`}
              aria-label={product.name}
            >
              {/* Stock & Low-stock badge row */}
              <div className="pcard-badges">
                {isLowStock && (
                  <span className="pcard-badge pcard-badge--low">
                    <AlertTriangle size={10} />
                    Low Stock
                  </span>
                )}
                {isOutOfStock && (
                  <span className="pcard-badge pcard-badge--oos">Out of Stock</span>
                )}
              </div>

              {/* Emoji / visual */}
              <div className="pcard-emoji" aria-hidden="true">
                {categoryEmoji(product.category)}
              </div>

              {/* Product info */}
              <div className="pcard-info">
                <p className="pcard-name">{product.name}</p>
                <p className="pcard-barcode">{product.barcode}</p>
                <p className="pcard-price">{formatLKR(product.price)}</p>
                <p className="pcard-stock">
                  <span
                    className={`stock-dot ${isOutOfStock ? 'out' : isLowStock ? 'low' : 'ok'}`}
                  />
                  {isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}
                </p>
              </div>

              {/* Add button */}
              {!isOutOfStock && (
                <button
                  id={`add-product-${product.id}`}
                  className={`pcard-add-btn${inCartQty > 0 ? ' in-cart' : ''}`}
                  onClick={() => onAddItem(product)}
                  aria-label={`Add ${product.name} to cart`}
                >
                  <Plus size={14} strokeWidth={2.5} />
                  {inCartQty > 0 ? `+${inCartQty}` : 'Add'}
                </button>
              )}
            </article>
          );
        })}
      </div>

      {/* Floating loading indicator for barcode lookup */}
      <div
        className={`catalog-scan-spinner${loading ? ' visible' : ''}`}
        aria-hidden="true"
      >
        <Loader2 size={18} className="spin" />
      </div>
    </div>
  );
}
