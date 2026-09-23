import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Search,
  Barcode,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle,
  Tag,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Clock,
  Wifi,
  WifiOff,
  Calculator,
  X,
  Delete,
  LayoutGrid,
  List,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import ReceiptModal from "./ReceiptModal";
import { createBill } from "../../services/api";
import { getProducts } from "../../services/productService";
import "../../pos-terminal.css";

export default function POSPage() {
  const {
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartCustomer,
    setCartCustomer,
    cartDiscount,
    setCartDiscount,
    currentUser,
  } = useApp();

  const [products, setProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(null);

  // Toggle bakeng sa go bontšha goba go utolla diswantšho (Grid vs Compact List)
  const [showThumbnails, setShowThumbnails] = useState(() => {
    return localStorage.getItem("pos_view_thumbnails") !== "false";
  });

  const toggleThumbnailView = () => {
    setShowThumbnails((prev) => {
      const nextVal = !prev;
      localStorage.setItem("pos_view_thumbnails", String(nextVal));
      return nextVal;
    });
  };

  const loadProducts = useCallback(async () => {
    try {
      setCatalogLoading(true);
      setCatalogError(null);
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[POSPage] Failed to fetch product catalog:", err);
      setCatalogError(err.message || "Could not connect to inventory database.");
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const liveCategories = useMemo(() => {
    const seen = new Set();
    const cats = [];
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      if (!seen.has(cat)) {
        seen.add(cat);
        cats.push(cat);
      }
    });
    return cats.sort();
  }, [products]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [recentBill, setRecentBill] = useState(null);
  const [barcodeNotice, setBarcodeNotice] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const barcodeRef = useRef(null);
  const clearTimerRef = useRef(null);

  const [clockStr, setClockStr] = useState(() =>
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
  );
  useEffect(() => {
    const timer = setInterval(() => {
      setClockStr(
        new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Go netefatša gore barcode input e dula e na le focus
  const focusBarcodeInput = useCallback(() => {
    const tag = document.activeElement?.tagName;
    if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
      barcodeRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const [showCalc, setShowCalc] = useState(false);
  const [calcExpr, setCalcExpr] = useState("");
  const [calcResult, setCalcResult] = useState("0");

  const evalCalcExpression = useCallback((expr) => {
    if (!expr) return "0";
    try {
      let sanitized = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-");

      sanitized = sanitized.replace(/(\d+(?:\.\d+)?)%/g, (_, num) => `(${parseFloat(num) / 100})`);

      if (/[^0-9+\-*/.() ]/.test(sanitized)) return "Error";

      // eslint-disable-next-line no-new-func
      const res = Function(`"use strict"; return (${sanitized})`)();
      if (isNaN(res) || !isFinite(res)) return "Error";
      return Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(2)).toString();
    } catch (_err) {
      return "Error";
    }
  }, []);

  const handleCalcInput = useCallback(
    (val) => {
      if (val === "C") {
        setCalcExpr("");
        setCalcResult("0");
      } else if (val === "BACK") {
        setCalcExpr((prev) => prev.slice(0, -1));
      } else if (val === "=") {
        const res = evalCalcExpression(calcExpr);
        if (res !== "Error") {
          setCalcExpr(res);
          setCalcResult(res);
        }
      } else {
        setCalcExpr((prev) => prev + val);
      }
    },
    [calcExpr, evalCalcExpression]
  );

  useEffect(() => {
    if (!calcExpr) {
      setCalcResult("0");
    } else {
      const res = evalCalcExpression(calcExpr);
      if (res !== "Error") {
        setCalcResult(res);
      }
    }
  }, [calcExpr, evalCalcExpression]);

  const applyCalcToTendered = () => {
    const finalVal = calcResult !== "0" && calcResult !== "Error" ? calcResult : evalCalcExpression(calcExpr);
    if (finalVal && finalVal !== "Error") {
      setAmountTendered(finalVal);
      setBarcodeNotice(`Applied Rs. ${finalVal} to Tendered Amount`);
      setShowCalc(false);
      barcodeRef.current?.focus();
    }
  };

  const applyCalcToDiscount = () => {
    const finalVal = calcResult !== "0" && calcResult !== "Error" ? calcResult : evalCalcExpression(calcExpr);
    if (finalVal && finalVal !== "Error") {
      const num = parseFloat(finalVal);
      if (!isNaN(num) && num >= 0) {
        setCartDiscount(num);
        setBarcodeNotice(`Applied Rs. ${num} to Order Discount`);
        setShowCalc(false);
        barcodeRef.current?.focus();
      }
    }
  };

  useEffect(() => {
    if (selectedCategory !== "All" && !liveCategories.includes(selectedCategory)) {
      setSelectedCategory("All");
    }
  }, [liveCategories, selectedCategory]);

  useEffect(() => {
    function handleKeyDown(e) {
      const tag = document.activeElement?.tagName;
      const isTyping =
        (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") &&
        document.activeElement !== barcodeRef.current;

      if (e.key === "Escape") {
        e.preventDefault();
        if (showCalc) {
          setShowCalc(false);
          barcodeRef.current?.focus();
          return;
        }
        if (recentBill) {
          setRecentBill(null);
          barcodeRef.current?.focus();
        }
        return;
      }

      if (e.key === "F3") {
        e.preventDefault();
        setShowCalc((prev) => !prev);
        return;
      }

      if (showCalc) {
        if (e.key === "Enter" || e.key === "=") {
          e.preventDefault();
          handleCalcInput("=");
          return;
        }
        if (e.key === "Backspace") {
          e.preventDefault();
          handleCalcInput("BACK");
          return;
        }
        if (e.key === "c" || e.key === "C") {
          e.preventDefault();
          handleCalcInput("C");
          return;
        }
        if (/^[0-9.+\-*/%]$/.test(e.key)) {
          e.preventDefault();
          let keyChar = e.key;
          if (keyChar === "*") keyChar = "×";
          if (keyChar === "/") keyChar = "÷";
          if (keyChar === "-") keyChar = "−";
          handleCalcInput(keyChar);
          return;
        }
      }

      if (isTyping) return;

      if (e.key === "F2") {
        e.preventDefault();
        barcodeRef.current?.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        if (cart.length === 0) return;
        if (clearConfirm) {
          clearCart();
          setClearConfirm(false);
          clearTimeout(clearTimerRef.current);
          barcodeRef.current?.focus();
        } else {
          setClearConfirm(true);
          clearTimerRef.current = setTimeout(() => setClearConfirm(false), 3000);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [recentBill, cart.length, clearConfirm, clearCart, showCalc, handleCalcInput]);

  // Instant Search ka leina, SKU le barcode
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchCat =
        selectedCategory === "All" || (p.category || "") === selectedCategory;
      const matchSearch =
        !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.barcode || "").toLowerCase().includes(q) ||
        (p.sku || p.skuCode || "").toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, search]);

  // Barcode quick scan le go tsenya setšweletšwa ka potlako ka kiribaneng
  const handleBarcodeSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = barcodeInput.trim();
    if (!trimmed) return;

    const found = products.find(
      (p) =>
        (p.barcode || "") === trimmed ||
        (p.sku || p.skuCode || "").toLowerCase() === trimmed.toLowerCase()
    );

    if (found) {
      if ((found.stock ?? 0) <= 0) {
        setBarcodeNotice(`"${found.name}" ga e sa le gona setokong!`);
      } else {
        addToCart(found);
        setBarcodeNotice(`✓ E tsentšhitšwe: ${found.name}`);
      }
    } else {
      setBarcodeNotice(`Barcode "${trimmed}" ga ya kgotsofala.`);
    }

    setBarcodeInput("");
    setTimeout(() => {
      barcodeRef.current?.focus();
    }, 10);
    setTimeout(() => setBarcodeNotice(""), 2500);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const discountVal = Number(cartDiscount) || 0;
  const taxableAmount = Math.max(0, subtotal - discountVal);
  const tax = Number((taxableAmount * 0.025).toFixed(2));
  const total = Number((taxableAmount + tax).toFixed(2));

  const tenderedNum = Number(amountTendered) || 0;
  const changeGiven = paymentMethod === "Cash" ? Math.max(0, tenderedNum - total) : 0;
  const isTenderSufficient = paymentMethod !== "Cash" || tenderedNum >= total;
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const fmtRs = (n) => `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleCheckout = async () => {
    if (cart.length === 0 || checkoutLoading) return;
    if (paymentMethod === "Cash" && tenderedNum < total) {
      alert("Tšhelete ye e tšweleditšwego e ka fase ga palomoka.");
      return;
    }

    const tenderedFinal = paymentMethod === "Cash" ? tenderedNum : total;
    const changeFinal = paymentMethod === "Cash" ? Math.max(0, tenderedFinal - total) : 0;

    const payload = {
      cashier: currentUser?.name || "Cashier",
      cashierName: currentUser?.name || "Cashier",
      cashierId: currentUser?.id || "EMP-001",
      customerName: cartCustomer || "Walk-in Customer",
      branch: currentUser?.branch || "Colombo – Head Office",
      paymentMethod,
      subtotal,
      tax,
      discount: discountVal,
      grandTotal: total,
      total,
      tenderedAmount: tenderedFinal,
      tendered: tenderedFinal,
      changeDue: changeFinal,
      change: changeFinal,
      items: cart.map((item) => ({
        productId: item.product._id || item.product.id,
        id: item.product.id,
        name: item.product.name,
        unitPrice: item.product.price,
        price: item.product.price,
        quantity: item.qty,
        qty: item.qty,
        lineTotal: item.product.price * item.qty,
        total: item.product.price * item.qty,
      })),
    };

    try {
      setCheckoutLoading(true);
      const savedBill = await createBill(payload);

      const billForReceipt = {
        ...savedBill,
        id: savedBill?.billNumber || savedBill?.id || `TXN-${Date.now()}`,
        branch: savedBill?.branch || payload.branch,
        cashierName: savedBill?.cashier || payload.cashierName,
        cashierId: payload.cashierId,
        customerName: savedBill?.customerName || payload.customerName,
        date: savedBill?.createdAt
          ? new Date(savedBill.createdAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
        paymentMethod,
        subtotal,
        discount: discountVal,
        tax,
        total,
        amountTendered: tenderedFinal,
        changeGiven: changeFinal,
        items: cart.map((item) => ({
          name: item.product.name,
          price: item.product.price,
          qty: item.qty,
          total: item.product.price * item.qty,
        })),
        status: "Completed",
      };

      setRecentBill(billForReceipt);
      setAmountTendered("");
      clearCart();
      loadProducts();
    } catch (err) {
      console.error("[POSPage] Checkout failed:", err);
      alert(`Thekišo ga ya atlega: ${err.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-slate-100" onClick={focusBarcodeInput}>
      {/* ═══ POS TOP BAR ═══ */}
      <div className="h-14 shrink-0 w-full flex items-center justify-between px-6 bg-white border-b border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            Terminal #01
          </span>
          <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {currentUser?.name || "Cashier"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm font-mono font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
            <Clock size={14} className="text-slate-400" />
            {clockStr}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
            <span className={`pos-status-dot ${isOnline ? "online" : "offline"}`} />
            {isOnline ? (
              <span className="text-emerald-700 font-semibold">Synced</span>
            ) : (
              <span className="text-rose-600 font-semibold">Offline</span>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MAIN SPLIT VIEW ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT PANEL: Product Catalog (62%) ── */}
        <div className="w-[62%] h-full flex flex-col overflow-hidden border-r border-slate-200">
          <div className="shrink-0 px-4 py-3 bg-white border-b border-slate-200">
            <div className="flex items-center gap-3">
              {/* Barcode scanner input yeo e dulago e lokišeditšwe go bala */}
              <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
                <Barcode size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A8BC1]" />
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan barcode or enter SKU…"
                  className="w-full h-12 pl-11 pr-16 text-base font-medium rounded-lg border-2 border-slate-300 focus:border-[#4A80B4] focus:ring-2 focus:ring-[#4A80B4]/20 outline-none text-slate-800 placeholder:text-sm placeholder-slate-400 transition-colors"
                  aria-label="Barcode scanner input"
                  autoFocus
                />
                <span className="pos-kbd absolute right-3 top-1/2 -translate-y-1/2">F2</span>
              </form>

              {/* Instant Search Bar */}
              <div className="relative w-60">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search item, code, SKU…"
                  className="w-full h-12 pl-9 pr-4 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-[#4A80B4]/20 focus:border-[#4A80B4] text-slate-800 placeholder-slate-400 transition-colors"
                  aria-label="Search products"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* View Switcher: Grid View vs Compact List View */}
              <button
                type="button"
                onClick={toggleThumbnailView}
                title={showThumbnails ? "Fetoletša go List View (Fihla Diswantšho)" : "Fetoletša go Grid View (Bontšha Diswantšho)"}
                className="shrink-0 h-12 px-3 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
                aria-label="Toggle product view"
              >
                {showThumbnails ? (
                  <>
                    <List size={18} className="text-[#4A80B4]" />
                    <span className="text-xs font-bold hidden sm:inline">Compact</span>
                  </>
                ) : (
                  <>
                    <LayoutGrid size={18} className="text-[#4A80B4]" />
                    <span className="text-xs font-bold hidden sm:inline">Thumbnails</span>
                  </>
                )}
              </button>

              {/* Calculator Button */}
              <button
                onClick={() => setShowCalc((prev) => !prev)}
                title="Toggle POS Calculator (F3)"
                className={`shrink-0 h-12 px-3 flex items-center justify-center gap-1.5 rounded-xl border text-sm font-medium transition-colors ${
                  showCalc
                    ? "bg-[#4A80B4] text-white border-[#4A80B4] shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300"
                }`}
                aria-label="Toggle POS Calculator"
              >
                <Calculator size={18} className={showCalc ? "text-white" : "text-[#4A80B4]"} />
                <span className="font-bold text-xs">Calc</span>
                <span className="pos-kbd text-[10px]">F3</span>
              </button>

              {/* Refresh Catalog */}
              <button
                onClick={loadProducts}
                disabled={catalogLoading}
                title="Reload catalog from database"
                className="shrink-0 w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-medium transition-colors"
                aria-label="Refresh product catalog"
              >
                <RefreshCw size={16} className={catalogLoading ? "animate-spin text-[#4A80B4]" : ""} />
              </button>
            </div>

            {barcodeNotice && (
              <div className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-[#2B4C74] ring-1 ring-inset ring-[#4A80B4]/30 font-medium flex items-center justify-between">
                <span>{barcodeNotice}</span>
                <button onClick={() => setBarcodeNotice("")} className="text-[#4A80B4] hover:text-[#2B4C74] ml-2">×</button>
              </div>
            )}

            {catalogError && (
              <div className="mt-2 text-xs px-3 py-2 rounded-lg bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 font-medium flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={13} className="shrink-0" />
                  <span>{catalogError}</span>
                </div>
                <button onClick={loadProducts} className="underline font-semibold hover:text-rose-900 whitespace-nowrap">
                  Leka gape
                </button>
              </div>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="shrink-0 flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b border-slate-200 no-scrollbar">
            <button
              onClick={() => {
                setSelectedCategory("All");
                barcodeRef.current?.focus();
              }}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === "All"
                  ? "bg-[#4A80B4] text-white border-[#4A80B4] shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300"
              }`}
            >
              All Items ({products.length})
            </button>

            {liveCategories.map((catName) => {
              const count = products.filter((p) => p.category === catName).length;
              const isSelected = selectedCategory === catName;
              return (
                <button
                  key={catName}
                  onClick={() => {
                    setSelectedCategory(catName);
                    barcodeRef.current?.focus();
                  }}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border ${
                    isSelected
                      ? "bg-[#4A80B4] text-white border-[#4A80B4] shadow-xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300"
                  }`}
                >
                  {catName} ({count})
                </button>
              );
            })}
          </div>

          {/* Product View Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {catalogLoading && products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Loader2 size={28} className="animate-spin text-[#4A80B4] mb-3" />
                <p className="text-sm font-medium text-slate-600">Go laiša ditšweletšwa tša database…</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ShoppingCart size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">Ga go setšweletšwa seo se hweditšwego</p>
                <p className="text-[10px] text-slate-500">Leka go nyaka ka leina le lengwe goba SKU</p>
              </div>
            ) : showThumbnails ? (
              /* PONO YA 1: GRID VIEW (E na le di-thumbnail) */
              <div className="grid grid-cols-4 gap-3 content-start">
                {filteredProducts.map((p) => {
                  const stock = p.stock ?? 0;
                  const minStock = p.minStock ?? p.minThreshold ?? 5;
                  const isOutOfStock = stock <= 0;
                  const isLowStock = stock > 0 && stock <= minStock;
                  const rowKey = p._id || p.id;

                  return (
                    <div
                      key={rowKey}
                      onClick={() => {
                        if (!isOutOfStock) {
                          addToCart(p);
                          barcodeRef.current?.focus();
                        }
                      }}
                      className={`bg-white rounded-lg border p-3 flex flex-col justify-between transition-all select-none ${
                        isOutOfStock
                          ? "border-slate-200 opacity-60 cursor-not-allowed"
                          : "border-slate-200 hover:border-[#4A80B4] hover:shadow-md cursor-pointer group"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform overflow-hidden shrink-0">
                            {p.image && (p.image.startsWith("http") || p.image.startsWith("data:")) ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              p.image || "📦"
                            )}
                          </div>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isOutOfStock
                                ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
                                : isLowStock
                                ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
                                : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                            }`}
                          >
                            {isOutOfStock ? "Out of Stock" : `${stock} ${p.unit || "pcs"}`}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mt-2.5 leading-snug">
                          {p.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {p.sku || p.skuCode || ""}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500">Price</span>
                          <p className="text-base font-extrabold text-slate-900 font-mono leading-tight">
                            {fmtRs(p.price || 0)}
                          </p>
                        </div>
                        <button
                          disabled={isOutOfStock}
                          className="w-7 h-7 rounded-lg bg-blue-50 group-hover:bg-[#4A80B4] text-[#4A80B4] group-hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* PONO YA 2: COMPACT LIST VIEW (Ga go na diswantšho, e šoma ka lebelo) */
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5">Item Name</th>
                      <th className="px-4 py-2.5">Code / SKU</th>
                      <th className="px-4 py-2.5 text-center">Stock</th>
                      <th className="px-4 py-2.5 text-right">Price</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => {
                      const stock = p.stock ?? 0;
                      const isOutOfStock = stock <= 0;
                      const rowKey = p._id || p.id;

                      return (
                        <tr
                          key={rowKey}
                          onClick={() => {
                            if (!isOutOfStock) {
                              addToCart(p);
                              barcodeRef.current?.focus();
                            }
                          }}
                          className={`hover:bg-blue-50/60 transition-colors ${
                            isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                          }`}
                        >
                          <td className="px-4 py-2.5 font-bold text-slate-900 truncate max-w-[200px]">
                            {p.name}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-slate-500 text-[11px]">
                            {p.sku || p.skuCode || p.barcode || "—"}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                                isOutOfStock
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {stock} {p.unit || "pcs"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono font-bold text-slate-900 text-right">
                            {fmtRs(p.price || 0)}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              disabled={isOutOfStock}
                              className="px-2.5 py-1 rounded-md bg-[#4A80B4] text-white hover:bg-[#3B6D9E] font-bold text-xs"
                            >
                              + Add
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Active Order (38%) ── */}
        <div className="w-[38%] h-full flex flex-col overflow-hidden bg-white relative">
          <div className="shrink-0 p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingCart size={18} className="text-[#4A80B4]" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Active Order</h3>
                <p className="text-[10px] text-slate-500">
                  {totalItems} item{totalItems !== 1 ? "s" : ""} • {currentUser?.name?.split(" ")[0] || "Staff"}
                </p>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => {
                  if (clearConfirm) {
                    clearCart();
                    setClearConfirm(false);
                    clearTimeout(clearTimerRef.current);
                    barcodeRef.current?.focus();
                  } else {
                    setClearConfirm(true);
                    clearTimerRef.current = setTimeout(() => setClearConfirm(false), 3000);
                  }
                }}
                className={`transition-colors rounded-lg px-2.5 py-1.5 font-semibold text-xs flex items-center gap-1 ${
                  clearConfirm
                    ? "bg-rose-600 text-white border border-rose-600"
                    : "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                }`}
              >
                <Trash2 size={13} />
                {clearConfirm ? "Confirm Clear?" : "Clear Cart"}
              </button>
            )}
          </div>

          <div className="shrink-0 px-4 py-2.5 border-b border-slate-100 bg-white">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              CUSTOMER NAME
            </label>
            <input
              type="text"
              value={cartCustomer}
              onChange={(e) => setCartCustomer(e.target.value)}
              placeholder="Walk-in Customer"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#4A80B4] focus:ring-1 focus:ring-[#4A80B4]/20 transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {cart.map(({ product, qty }) => (
              <div
                key={product._id || product.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs font-bold text-slate-800 truncate">{product.name}</p>
                  <p className="text-[11px] text-slate-600">
                    {fmtRs(product.price || 0)} × {qty} ={" "}
                    <span className="font-semibold text-slate-800">
                      {fmtRs((product.price || 0) * qty)}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200 shrink-0">
                  <button
                    onClick={() => {
                      updateCartQty(product.id, qty - 1);
                      barcodeRef.current?.focus();
                    }}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l-md transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-slate-800">{qty}</span>
                  <button
                    onClick={() => {
                      updateCartQty(product.id, qty + 1);
                      barcodeRef.current?.focus();
                    }}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r-md transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    removeFromCart(product.id);
                    barcodeRef.current?.focus();
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg px-2.5 py-1.5 font-semibold transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <ShoppingCart size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">Cart is empty</p>
                <p className="text-[10px] text-slate-500">Scan barcode or click products to add</p>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white p-4 space-y-2">
            <div className="flex justify-between text-sm font-medium text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">{fmtRs(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-sm font-medium text-slate-600">
              <span className="flex items-center gap-1">
                <Tag size={12} className="text-[#4A80B4]" /> Discount (Rs.)
              </span>
              <input
                type="number"
                min="0"
                value={cartDiscount || ""}
                onChange={(e) => setCartDiscount(Number(e.target.value))}
                placeholder="0.00"
                className="w-20 px-2 py-0.5 border border-slate-200 rounded text-right text-xs font-semibold outline-none focus:border-[#4A80B4] text-slate-800"
              />
            </div>

            <div className="flex justify-between text-sm font-medium text-slate-600">
              <span>VAT / Taxes (2.5%)</span>
              <span className="font-semibold text-slate-800">{fmtRs(tax)}</span>
            </div>

            <div className="bg-blue-50/70 border-2 border-[#4A80B4]/40 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B6D9E]">Total Due</span>
              <span className="font-mono text-3xl font-black text-[#2B4C74]">{fmtRs(total)}</span>
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                PAYMENT METHOD
              </label>
              <div className="flex gap-1.5 w-full">
                {[
                  { id: "Cash", icon: Banknote },
                  { id: "Card", icon: CreditCard },
                  { id: "LankaQR", icon: QrCode },
                ].map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setPaymentMethod(id);
                      barcodeRef.current?.focus();
                    }}
                    className={`flex-1 h-11 flex items-center justify-center gap-1.5 rounded-xl px-3.5 text-sm font-bold transition-colors border cursor-pointer ${
                      paymentMethod === id
                        ? "bg-[#4A80B4] hover:bg-[#3B6D9E] text-white border-[#4A80B4] shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{id}</span>
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === "Cash" && (
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-600 uppercase">Tendered:</span>
                  <input
                    type="number"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    placeholder={`Rs. ${total}`}
                    className="w-28 px-2.5 py-1 border border-slate-200 rounded-lg text-sm font-bold text-right outline-none focus:border-[#4A80B4] text-slate-800"
                  />
                </div>

                <div className="flex gap-1">
                  {[
                    { label: "Exact", val: total },
                    { label: "500", val: 500 },
                    { label: "1000", val: 1000 },
                    { label: "2000", val: 2000 },
                    { label: "5000", val: 5000 },
                  ].map(({ label, val }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setAmountTendered(val.toString());
                        barcodeRef.current?.focus();
                      }}
                      className="flex-1 h-11 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl px-2 text-sm font-bold transition-colors cursor-pointer"
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {tenderedNum > 0 && (
                  <div className="flex justify-between items-center bg-blue-50 text-[#2B4C74] ring-1 ring-inset ring-[#4A80B4]/40 rounded-lg px-2.5 py-1.5 text-xs font-bold">
                    <span>Change to Return:</span>
                    <span className="font-mono">{fmtRs(changeGiven)}</span>
                  </div>
                )}
              </div>
            )}

            <button
              disabled={cart.length === 0 || !isTenderSufficient || checkoutLoading}
              onClick={handleCheckout}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-14 w-full rounded-xl text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <CheckCircle size={20} />
              )}
              <span>
                {checkoutLoading ? "Processing…" : `Complete Sale — ${fmtRs(total)}`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ RECEIPT MODAL ═══ */}
      {recentBill && (
        <ReceiptModal
          bill={recentBill}
          onClose={() => {
            setRecentBill(null);
            barcodeRef.current?.focus();
          }}
        />
      )}

      {/* ═══ QUICK POS CALCULATOR MODAL ═══ */}
      {showCalc && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCalc(false);
              barcodeRef.current?.focus();
            }
          }}
        >
          <div
            style={{ backgroundColor: "#ffffff" }}
            className="rounded-2xl shadow-2xl border border-slate-200 w-80 overflow-hidden flex flex-col p-4 animate-scale-up"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calculator size={18} className="text-[#4A80B4]" />
                <h3 className="font-bold text-slate-800 text-sm">POS Calculator</h3>
                <span className="pos-kbd text-[10px]">F3</span>
              </div>
              <button
                onClick={() => {
                  setShowCalc(false);
                  barcodeRef.current?.focus();
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="my-3 p-3 bg-slate-900 rounded-xl text-right font-mono flex flex-col justify-between h-20 shadow-inner">
              <div className="text-xs text-slate-400 truncate">
                {calcExpr || "0"}
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 truncate">
                {calcResult}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-sm font-semibold">
              <button
                onClick={() => handleCalcInput("C")}
                className="py-2.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              >
                C
              </button>
              <button
                onClick={() => handleCalcInput("BACK")}
                className="py-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center justify-center cursor-pointer"
              >
                <Delete size={16} />
              </button>
              <button
                onClick={() => handleCalcInput("%")}
                className="py-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              >
                %
              </button>
              <button
                onClick={() => handleCalcInput("÷")}
                className="py-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-base cursor-pointer"
              >
                ÷
              </button>

              {["7", "8", "9"].map((n) => (
                <button
                  key={n}
                  onClick={() => handleCalcInput(n)}
                  className="py-2.5 rounded-lg bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors text-base font-bold cursor-pointer"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => handleCalcInput("×")}
                className="py-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-base cursor-pointer"
              >
                ×
              </button>

              {["4", "5", "6"].map((n) => (
                <button
                  key={n}
                  onClick={() => handleCalcInput(n)}
                  className="py-2.5 rounded-lg bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors text-base font-bold cursor-pointer"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => handleCalcInput("−")}
                className="py-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-base cursor-pointer"
              >
                −
              </button>

              {["1", "2", "3"].map((n) => (
                <button
                  key={n}
                  onClick={() => handleCalcInput(n)}
                  className="py-2.5 rounded-lg bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors text-base font-bold cursor-pointer"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => handleCalcInput("+")}
                className="py-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-base cursor-pointer"
              >
                +
              </button>

              <button
                onClick={() => handleCalcInput("0")}
                className="py-2.5 rounded-lg bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors text-base font-bold cursor-pointer"
              >
                0
              </button>
              <button
                onClick={() => handleCalcInput("00")}
                className="py-2.5 rounded-lg bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors text-xs font-bold cursor-pointer"
              >
                00
              </button>
              <button
                onClick={() => handleCalcInput(".")}
                className="py-2.5 rounded-lg bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors text-base font-bold cursor-pointer"
              >
                .
              </button>
              <button
                onClick={() => handleCalcInput("=")}
                className="py-2.5 rounded-lg bg-[#4A80B4] hover:bg-[#3B6D9E] text-white transition-colors font-bold text-base shadow-xs cursor-pointer"
              >
                =
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
              <button
                onClick={applyCalcToTendered}
                className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-[#2B4C74] border border-[#4A80B4]/40 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Apply to Tendered</span>
                <span className="font-mono text-[#3B6D9E]">Rs. {calcResult !== "0" && calcResult !== "Error" ? calcResult : evalCalcExpression(calcExpr)}</span>
              </button>
              <button
                onClick={applyCalcToDiscount}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Apply to Discount</span>
                <span className="font-mono text-slate-800">Rs. {calcResult !== "0" && calcResult !== "Error" ? calcResult : evalCalcExpression(calcExpr)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}