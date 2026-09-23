import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  PlusCircle,
  ArrowUpRight,
  Search,
  X,
  RefreshCw,
  Loader2,
  CheckCircle,
  Package,
} from "lucide-react";
import {
  fetchInventory,
  fetchLowStockAlerts,
  restockProduct,
} from "../../services/inventoryService";
import { INITIAL_SUPPLIERS } from "../../data/mockData";
import { useApp } from "../../context/AppContext";
import ModalPortal from "../layout/ModalPortal";

export default function InventoryPage() {
  const { fetchProducts } = useApp() || {};
  const [inventory, setInventory] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restockLoading, setRestockLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [search, setSearch] = useState("");
  const [restockModalProduct, setRestockModalProduct] = useState(null);
  const [restockQty, setRestockQty] = useState(25);
  const [selectedSupplier, setSelectedSupplier] = useState(
    INITIAL_SUPPLIERS[0]?.name || "EgoTech Central Supply"
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invData, alertData] = await Promise.all([
        fetchInventory(),
        fetchLowStockAlerts(),
      ]);
      setInventory(Array.isArray(invData) ? invData : []);
      setLowStockAlerts(Array.isArray(alertData) ? alertData : []);
      if (fetchProducts) {
        await fetchProducts();
      }
    } catch (err) {
      console.error("Error loading inventory:", err);
      setError(err.message || "Failed to load inventory data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = inventory.filter((p) => {
    const nameStr = p.name || "";
    const skuStr = p.sku || p.skuCode || "";
    const catStr = p.category || "";
    const searchLower = search.toLowerCase();
    return (
      nameStr.toLowerCase().includes(searchLower) ||
      skuStr.toLowerCase().includes(searchLower) ||
      catStr.toLowerCase().includes(searchLower)
    );
  });

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockModalProduct || restockQty <= 0) return;

    try {
      setRestockLoading(true);
      const targetId = restockModalProduct.id || restockModalProduct._id;
      await restockProduct(targetId, Number(restockQty));
      
      setSuccessMessage(`Successfully added ${restockQty} units to ${restockModalProduct.name}!`);
      setTimeout(() => setSuccessMessage(null), 4000);

      setRestockModalProduct(null);
      await loadData();
    } catch (err) {
      console.error("Restock error:", err);
      alert(`Restock failed: ${err.message}`);
    } finally {
      setRestockLoading(false);
    }
  };

  const renderProductImage = (imgSrc, altText = "Product", sizeClasses = "w-10 h-10") => {
    const isUrl = typeof imgSrc === "string" && (imgSrc.startsWith("http") || imgSrc.startsWith("/"));
    
    if (isUrl) {
      return (
        <div className={`${sizeClasses} rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-xs`}>
          <img
            src={imgSrc}
            alt={altText}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.parentElement.innerHTML = '<span class="text-slate-400 font-bold text-xs">📦</span>';
            }}
          />
        </div>
      );
    }

    return (
      <div className={`${sizeClasses} rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center text-lg shadow-xs`}>
        {imgSrc || <Package size={18} className="text-slate-400" />}
      </div>
    );
  };

  return (
    <div className="w-full px-6 py-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Inventory & Stock Operations
            {loading && <Loader2 size={16} className="animate-spin text-[#4A80B4]" />}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time warehouse shelves, manage low-stock replenishment, and record purchase deliveries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-[#4A80B4] hover:border-[#4A80B4]/40 transition-colors shadow-xs cursor-pointer"
            title="Refresh inventory"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs">
            <p className="text-xs font-semibold text-slate-400">Low Stock SKUs</p>
            <p className="text-base font-bold text-rose-600 font-mono leading-tight">
              {lowStockAlerts.length} Items
            </p>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-fade-in">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between text-rose-800 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadData} className="underline hover:text-rose-900 cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Critical Alert Banner if Low Stock items exist */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4.5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 text-sm">
                Attention Required: {lowStockAlerts.length} Product{lowStockAlerts.length > 1 ? "s" : ""} Below Reorder Point
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                The following products need immediate supplier purchase orders to prevent stock-outs:
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                {lowStockAlerts.map((p) => {
                  const minThresh = p.minStock ?? p.minThreshold ?? 5;
                  const itemKey = p.id || p._id;
                  const itemImage = p.image || p.imageUrl || p.imageURL;
                  return (
                    <button
                      key={itemKey}
                      onClick={() => {
                        setRestockModalProduct(p);
                        setRestockQty(minThresh * 2 || 20);
                      }}
                      className="inline-flex items-center gap-2 bg-white border border-amber-300 hover:border-amber-500 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-amber-900 shadow-xs transition-all cursor-pointer"
                    >
                      {renderProductImage(itemImage, p.name, "w-6 h-6")}
                      <span className="font-bold">{p.name}</span>
                      <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-mono">
                        {p.stock} left (Min: {minThresh})
                      </span>
                      <ArrowUpRight size={12} className="text-amber-600" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory items by name, category, SKU..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#4A80B4] focus:ring-2 focus:ring-[#4A80B4]/20"
          />
        </div>

        <p className="text-xs text-slate-400 font-medium hidden sm:block">
          Showing {filteredProducts.length} tracked items
        </p>
      </div>

      {/* Stock Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-4">SKU & Item Name</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Supplier</th>
                <th className="px-5 py-4">Min Threshold</th>
                <th className="px-5 py-4">Current Stock</th>
                <th className="px-5 py-4">Health Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && inventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#4A80B4]" />
                    <span>Loading real-time inventory from database...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No products found matching "{search}".
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const minThresh = p.minStock ?? p.minThreshold ?? 5;
                  const unit = p.unit || "pcs";
                  const stock = p.stock ?? 0;
                  const isOut = stock === 0;
                  const isLow = stock <= minThresh;
                  const percentage = Math.min(100, Math.round((stock / (minThresh * 2 || 20)) * 100));
                  const itemKey = p.id || p._id;
                  const itemImage = p.image || p.imageUrl || p.imageURL;

                  return (
                    <tr key={itemKey} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {renderProductImage(itemImage, p.name, "w-10 h-10")}
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-snug">{p.name}</p>
                            <span className="text-xs text-slate-400 font-mono tracking-tight">
                              SKU: {p.sku || p.skuCode || itemKey}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 border border-slate-200/60">
                          {p.category || "General"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs font-medium text-slate-600">
                        {p.supplier || "EgoTech Central Supply"}
                      </td>

                      <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-700">
                        {minThresh} {unit}
                      </td>

                      <td className="px-5 py-4 font-bold font-mono text-sm">
                        <span className={isLow ? "text-rose-600" : "text-slate-800"}>
                          {stock} {unit}
                        </span>
                      </td>

                      <td className="px-5 py-4 w-44">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className={isLow ? "text-rose-600" : "text-emerald-600"}>
                              {isOut ? "Depleted" : isLow ? "Critical" : "Adequate"}
                            </span>
                            <span className="text-slate-400">{percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isOut ? "bg-rose-500" : isLow ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => {
                            setRestockModalProduct(p);
                            setRestockQty(minThresh * 2 || 20);
                          }}
                          className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-[#4A80B4] text-[#2B527E] hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <PlusCircle size={14} />
                          <span>Restock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receive Stock Delivery Modal with Frosted Glassmorphism Portal */}
      {restockModalProduct && (
        <ModalPortal>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            onClick={() => setRestockModalProduct(null)}
          >
            <div
              style={{ backgroundColor: "#ffffff" }}
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#4A80B4] flex items-center justify-center shadow-xs">
                    <PlusCircle size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Receive Stock Delivery</h3>
                </div>
                <button
                  onClick={() => setRestockModalProduct(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRestockSubmit} className="p-6 space-y-4">
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-center gap-3">
                  {renderProductImage(
                    restockModalProduct.image || restockModalProduct.imageUrl || restockModalProduct.imageURL,
                    restockModalProduct.name,
                    "w-12 h-12"
                  )}
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{restockModalProduct.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Current stock: {restockModalProduct.stock ?? 0} {restockModalProduct.unit || "pcs"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    QUANTITY RECEIVED ({restockModalProduct.unit || "pcs"}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold font-mono outline-none focus:border-[#4A80B4] focus:ring-2 focus:ring-[#4A80B4]/20 transition-all bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    SUPPLIER / VENDOR
                  </label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#4A80B4] focus:ring-2 focus:ring-[#4A80B4]/20 transition-all bg-white cursor-pointer"
                  >
                    {INITIAL_SUPPLIERS.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setRestockModalProduct(null)}
                    disabled={restockLoading}
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={restockLoading}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#4A80B4] hover:bg-[#3B6D9E] text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
                  >
                    {restockLoading && <Loader2 size={14} className="animate-spin" />}
                    <span>{restockLoading ? "Restocking..." : "Confirm & Update Stock"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
