import React, { useState } from "react";
import {
  Boxes,
  AlertTriangle,
  PlusCircle,
  ArrowUpRight,
  Search,
  CheckCircle2,
  X,
  Building,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { INITIAL_SUPPLIERS } from "../../data/mockData";

export default function InventoryPage() {
  const { products, lowStockProducts, adjustStock } = useApp();
  const [search, setSearch] = useState("");
  const [restockModalProduct, setRestockModalProduct] = useState(null);
  const [restockQty, setRestockQty] = useState(25);
  const [selectedSupplier, setSelectedSupplier] = useState(INITIAL_SUPPLIERS[0].name);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!restockModalProduct || restockQty <= 0) return;
    adjustStock(restockModalProduct.id, Number(restockQty), `PO Restock - ${selectedSupplier}`);
    setRestockModalProduct(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Inventory & Stock Operations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time warehouse shelves, manage low-stock replenishment, and record purchase deliveries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs">
            <p className="text-xs font-semibold text-slate-400">Low Stock SKUs</p>
            <p className="text-base font-bold text-rose-600 font-mono leading-tight">
              {lowStockProducts.length} Items
            </p>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner if Low Stock items exist */}
      {lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4.5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 text-sm">
                Attention Required: {lowStockProducts.length} Product{lowStockProducts.length > 1 ? "s" : ""} Below Reorder Point
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                The following products need immediate supplier purchase orders to prevent stock-outs:
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                {lowStockProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setRestockModalProduct(p);
                      setRestockQty(p.minStock * 2);
                    }}
                    className="inline-flex items-center gap-1.5 bg-white border border-amber-300 hover:border-amber-500 rounded-xl px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs transition-all"
                  >
                    <span>{p.image} {p.name}</span>
                    <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[10px]">
                      {p.stock} left (Min: {p.minStock})
                    </span>
                    <ArrowUpRight size={12} className="text-amber-600" />
                  </button>
                ))}
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
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500"
          />
        </div>

        <p className="text-xs text-slate-400 font-medium hidden sm:block">
          Showing {filteredProducts.length} tracked items
        </p>
      </div>

      {/* Stock Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">SKU & Item Name</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Supplier</th>
                <th className="px-5 py-3.5">Min Threshold</th>
                <th className="px-5 py-3.5">Current Stock</th>
                <th className="px-5 py-3.5">Health Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isOut = p.stock === 0;
                const isLow = p.stock <= p.minStock;
                const percentage = Math.min(100, Math.round((p.stock / (p.minStock * 2 || 20)) * 100));

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{p.image || "📦"}</span>
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      {p.category}
                    </td>

                    <td className="px-5 py-3.5 text-slate-500">
                      {p.supplier || "EgoTech Central Supply"}
                    </td>

                    <td className="px-5 py-3.5 font-mono text-slate-600">
                      {p.minStock} {p.unit}
                    </td>

                    <td className="px-5 py-3.5 font-bold font-mono">
                      <span className={isLow ? "text-rose-600 text-sm" : "text-slate-800"}>
                        {p.stock} {p.unit}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 w-44">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-medium">
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

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setRestockModalProduct(p);
                          setRestockQty(p.minStock * 2 || 20);
                        }}
                        className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs"
                      >
                        <PlusCircle size={13} />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Delivery Modal */}
      {restockModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} className="text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Receive Stock Delivery</h3>
              </div>
              <button
                onClick={() => setRestockModalProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                <span className="text-2xl">{restockModalProduct.image}</span>
                <div>
                  <p className="font-bold text-slate-800 text-xs">{restockModalProduct.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Current stock: {restockModalProduct.stock} {restockModalProduct.unit}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  QUANTITY RECEIVED ({restockModalProduct.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold font-mono outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  SUPPLIER / VENDOR
                </label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                >
                  {INITIAL_SUPPLIERS.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalProduct(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Confirm & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
