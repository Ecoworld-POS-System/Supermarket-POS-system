import React, { useState } from "react";
import {
  Search,
  Package,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Barcode,
  Layers,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import ProductModal from "./ProductModal";

export default function ProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct, lowStockCount } = useApp();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All Categories");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);
    const matchCat = catFilter === "All Categories" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const handleSaveProduct = (data) => {
    if (editingProduct) {
      updateProduct(data);
    } else {
      addProduct(data);
    }
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete product "${name}"?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Product Catalog & Master Data</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure retail products, barcode mapping, pricing, and gross margins
          </p>
        </div>

        {/* Counter cards */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs">
            <p className="text-xs font-semibold text-slate-400">Total Items</p>
            <p className="text-base font-bold text-slate-900 leading-tight">{products.length}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs">
            <p className="text-xs font-semibold text-slate-400">Low Stock</p>
            <p className="text-base font-bold text-rose-600 leading-tight">{lowStockCount}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs hidden md:block">
            <p className="text-xs font-semibold text-slate-400">Retail Value</p>
            <p className="text-base font-extrabold text-blue-600 font-mono leading-tight">
              Rs. {totalInventoryValue.toLocaleString("en-US", { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Add Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, SKU, or barcode..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white outline-none"
          >
            <option>All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all ml-auto md:ml-0"
          >
            <Plus size={15} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Product Title</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Barcode / SKU</th>
                <th className="px-5 py-3.5">Cost Price</th>
                <th className="px-5 py-3.5">Selling Price</th>
                <th className="px-5 py-3.5">Stock Level</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const isLow = p.stock <= p.minStock;
                const isOut = p.stock === 0;
                const margin =
                  p.price > 0 && p.costPrice
                    ? (((p.price - p.costPrice) / p.price) * 100).toFixed(0)
                    : null;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
                          {p.image || "📦"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-xs">{p.name}</p>
                          <span className="text-[11px] text-slate-400 font-mono">{p.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg text-[11px]">
                        {p.category}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                      <div>{p.barcode}</div>
                      <div className="text-slate-400 text-[10px]">{p.sku}</div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 font-mono">
                      Rs. {p.costPrice ? p.costPrice.toFixed(2) : "0.00"}
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold font-mono text-blue-600 text-xs">
                        Rs. {p.price.toFixed(2)}
                      </p>
                      {margin && (
                        <p className="text-[10px] text-emerald-600 font-medium">+{margin}% margin</p>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOut ? "bg-rose-500" : isLow ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                        />
                        <span
                          className={`font-semibold ${
                            isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-slate-700"
                          }`}
                        >
                          {p.stock} {p.unit}
                        </span>
                      </div>
                      {isLow && !isOut && (
                        <span className="text-[10px] text-amber-600 font-medium">
                          Alert ≤ {p.minStock}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Pencil size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 py-12">
                    <Package size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">No products found</p>
                    <p className="text-xs text-slate-400">Add products to your catalog to start selling.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <ProductModal
          editingProduct={editingProduct}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}
