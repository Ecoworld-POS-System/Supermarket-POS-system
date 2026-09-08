import React, { useState, useMemo } from "react";
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
  AlertCircle,
  Tag,
  RotateCcw,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import ReceiptModal from "./ReceiptModal";

export default function POSPage() {
  const {
    products,
    categories,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartCustomer,
    setCartCustomer,
    cartDiscount,
    setCartDiscount,
    processSale,
    currentUser,
  } = useApp();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [recentBill, setRecentBill] = useState(null);
  const [barcodeNotice, setBarcodeNotice] = useState("");

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.includes(search) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, search]);

  // Handle barcode quick scan
  const handleBarcodeSubmit = (e) => {
    if (e) e.preventDefault();
    if (!barcodeInput.trim()) return;

    const found = products.find(
      (p) => p.barcode === barcodeInput.trim() || p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (found) {
      if (found.stock <= 0) {
        setBarcodeNotice(`"${found.name}" is out of stock!`);
      } else {
        addToCart(found);
        setBarcodeNotice(`Added: ${found.name}`);
      }
    } else {
      setBarcodeNotice(`Barcode ${barcodeInput} not recognized.`);
    }

    setBarcodeInput("");
    setTimeout(() => setBarcodeNotice(""), 2500);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const discountVal = Number(cartDiscount) || 0;
  const taxableAmount = Math.max(0, subtotal - discountVal);
  const tax = Number((taxableAmount * 0.025).toFixed(2));
  const total = Number((taxableAmount + tax).toFixed(2));

  // Change computation for cash
  const tenderedNum = Number(amountTendered) || 0;
  const changeGiven = paymentMethod === "Cash" ? Math.max(0, tenderedNum - total) : 0;
  const isTenderSufficient = paymentMethod !== "Cash" || tenderedNum >= total;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === "Cash" && tenderedNum < total) {
      alert("Amount tendered is less than the total amount due.");
      return;
    }

    const bill = processSale({
      paymentMethod,
      amountTendered: paymentMethod === "Cash" ? tenderedNum : total,
      changeGiven,
    });

    setRecentBill(bill);
    setAmountTendered("");
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-100 animate-fade-in">
      {/* Left: Product Catalog & Scanner */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 bg-white">
        {/* Top Scanner & Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by title, SKU, or brand..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            {/* Barcode Scanner Simulator */}
            <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2">
              <div className="relative w-44 sm:w-52">
                <Barcode size={16} className="absolute left-3 top-3 text-blue-600" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan Barcode / SKU..."
                  className="w-full pl-9 pr-3 py-2 border border-blue-200 bg-blue-50/40 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-xs"
              >
                Scan
              </button>
            </form>
          </div>

          {/* Barcode Notice Toast */}
          {barcodeNotice && (
            <div className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-medium animate-fade-in flex items-center justify-between">
              <span>{barcodeNotice}</span>
              <button onClick={() => setBarcodeNotice("")} className="text-blue-400 hover:text-blue-600">×</button>
            </div>
          )}

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === "All"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((c) => {
              const count = products.filter((p) => p.category === c.name).length;
              const isSelected = selectedCategory === c.name;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.stock <= 0;
              const isLowStock = p.stock > 0 && p.stock <= p.minStock;

              return (
                <div
                  key={p.id}
                  onClick={() => !isOutOfStock && addToCart(p)}
                  className={`bg-white border rounded-2xl p-3 flex flex-col justify-between transition-all select-none ${
                    isOutOfStock
                      ? "border-slate-200 opacity-60 cursor-not-allowed"
                      : "border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer group"
                  }`}
                >
                  <div>
                    {/* Top image & stock badge */}
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        {p.image || "📦"}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOutOfStock
                            ? "bg-rose-100 text-rose-700"
                            : isLowStock
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {isOutOfStock ? "Out of Stock" : `${p.stock} ${p.unit}`}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-800 text-xs mt-2.5 line-clamp-2 leading-snug">
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.sku}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400">Price</span>
                      <p className="text-xs font-extrabold text-blue-600 leading-tight">
                        Rs. {p.price.toFixed(2)}
                      </p>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      className="w-7 h-7 rounded-lg bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors"
                      title="Add to cart"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <ShoppingCart size={36} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No items match your query</p>
              <p className="text-xs text-slate-400">Try changing your category or searching for another keyword.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Checkout Cart & Tender Panel */}
      <div className="w-full lg:w-96 bg-white flex flex-col shrink-0 border-l border-slate-200">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Active Order</h3>
              <p className="text-[10px] text-slate-400">
                Cashier: {currentUser?.name?.split(" ")[0] || "Staff"}
              </p>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
            >
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>

        {/* Customer Input */}
        <div className="px-4 py-2 border-b border-slate-100 bg-white">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            CUSTOMER NAME
          </label>
          <input
            type="text"
            value={cartCustomer}
            onChange={(e) => setCartCustomer(e.target.value)}
            placeholder="Walk-in Customer"
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
          />
        </div>

        {/* Cart Itemized List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.map(({ product, qty }) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-2.5 border border-slate-100 hover:border-slate-200 rounded-xl bg-white shadow-2xs"
            >
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs font-bold text-slate-800 truncate">{product.name}</p>
                <p className="text-[11px] text-slate-400">
                  Rs. {product.price.toFixed(2)} × {qty} ={" "}
                  <span className="font-semibold text-slate-700">
                    Rs. {(product.price * qty).toFixed(2)}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => updateCartQty(product.id, qty - 1)}
                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-xs font-bold text-slate-800">{qty}</span>
                <button
                  onClick={() => updateCartQty(product.id, qty + 1)}
                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                >
                  <Plus size={12} />
                </button>
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="w-6 h-6 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center ml-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <ShoppingCart size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-medium text-slate-500">Cart is empty</p>
              <p className="text-[10px] text-slate-400">Click items from catalog or scan barcode to add</p>
            </div>
          )}
        </div>

        {/* Order Financial Summary */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1">
              <Tag size={12} className="text-blue-500" /> Discount (Rs.)
            </span>
            <input
              type="number"
              min="0"
              value={cartDiscount || ""}
              onChange={(e) => setCartDiscount(Number(e.target.value))}
              placeholder="0.00"
              className="w-20 px-2 py-0.5 border border-slate-200 rounded text-right text-xs font-semibold outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-between text-slate-500 text-[11px]">
            <span>VAT / Taxes (2.5%)</span>
            <span>Rs. {tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
            <span>TOTAL DUE</span>
            <span className="text-blue-600 font-mono">Rs. {total.toFixed(2)}</span>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              PAYMENT METHOD
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "Cash", icon: Banknote },
                { id: "Card", icon: CreditCard },
                { id: "LankaQR", icon: QrCode },
              ].map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold transition-all ${
                    paymentMethod === id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={15} />
                  <span>{id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cash Tender & Change calculation */}
          {paymentMethod === "Cash" && (
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase">Tendered:</span>
                <input
                  type="number"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  placeholder={`Rs. ${total}`}
                  className="w-28 px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-bold text-right outline-none focus:border-blue-500"
                />
              </div>

              {/* Quick Bill Tender buttons */}
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
                    onClick={() => setAmountTendered(val.toString())}
                    className="flex-1 py-1 rounded-md bg-white border border-slate-200 hover:border-blue-400 text-[10px] font-semibold text-slate-700"
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tenderedNum > 0 && (
                <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-800">
                  <span>Change to Return:</span>
                  <span>Rs. {changeGiven.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Complete Transaction Button */}
          <button
            disabled={cart.length === 0 || !isTenderSufficient}
            onClick={handleCheckout}
            className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-600/20 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <CheckCircle size={16} />
            <span>Complete Sale (Rs. {total.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {recentBill && (
        <ReceiptModal bill={recentBill} onClose={() => setRecentBill(null)} />
      )}
    </div>
  );
}
