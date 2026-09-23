import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Package,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import ProductModal from "./ProductModal";
import {
  getProducts,
  createProduct,
  updateProductById,
  deleteProductById,
} from "../../services/productService";

export default function ProductsPage() {
  const { categories } = useApp();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All Categories");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // ── Fetch from MongoDB ────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[ProductsPage] Failed to load products:", err);
      setError(err.message || "Failed to load products from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ── Filters ───────────────────────────────────────────────────────────────
  const filtered = products.filter((p) => {
    const nameStr = (p.name || "").toLowerCase();
    const skuStr = (p.sku || p.skuCode || "").toLowerCase();
    const barcodeStr = (p.barcode || "").toLowerCase();
    const sLower = search.toLowerCase();
    const matchSearch =
      nameStr.includes(sLower) || skuStr.includes(sLower) || barcodeStr.includes(sLower);
    const matchCat = catFilter === "All Categories" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + (p.price || 0) * (p.stock || 0),
    0
  );
  const lowStockCount = products.filter(
    (p) => (p.stock ?? 0) <= (p.minStock ?? p.minThreshold ?? 5)
  ).length;

  // ── Save (Create / Update) ────────────────────────────────────────────────
  const handleSaveProduct = async (formData) => {
    try {
      setSaving(true);
      setError(null);

      if (editingProduct) {
        // UPDATE — use MongoDB _id
        const mongoId = editingProduct._id || editingProduct.id;
        await updateProductById(mongoId, formData);
        setSuccessMessage(`"${formData.name}" updated successfully.`);
      } else {
        // CREATE — persist to MongoDB first
        await createProduct(formData);
        setSuccessMessage(`"${formData.name}" added to product catalog.`);
      }

      setTimeout(() => setSuccessMessage(null), 4000);
      setModalOpen(false);
      setEditingProduct(null);

      // Re-fetch to get live data with MongoDB-generated ids/fields
      await loadProducts();
    } catch (err) {
      console.error("[ProductsPage] Save failed:", err);
      setError(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (product) => {
    if (!window.confirm(`Delete product "${product.name}"? This cannot be undone.`)) return;
    try {
      setSaving(true);
      const mongoId = product._id || product.id;
      await deleteProductById(mongoId);
      setSuccessMessage(`"${product.name}" deleted from catalog.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      await loadProducts();
    } catch (err) {
      console.error("[ProductsPage] Delete failed:", err);
      setError(`Delete failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full px-6 py-4 space-y-6 animate-fade-in">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Product Catalog & Master Data
            {loading && <Loader2 size={16} className="animate-spin text-blue-600" />}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure retail products, barcode mapping, pricing, and gross margins
          </p>
        </div>

        {/* Counter cards */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            disabled={loading}
            title="Refresh from database"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

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

      {/* Success Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-fade-in">
          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center justify-between text-rose-800 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadProducts} className="underline hover:text-rose-900 ml-4">
            Retry
          </button>
        </div>
      )}

      {/* Filter and Add Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, SKU, or barcode..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 bg-white outline-none"
          >
            <option>All Categories</option>
            {categories.map((c) => (
              <option key={c.id || c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all ml-auto md:ml-0 cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs md:text-sm font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-4">Product Title</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Barcode / SKU</th>
                <th className="px-5 py-4">Cost Price</th>
                <th className="px-5 py-4">Selling Price</th>
                <th className="px-5 py-4">Stock Level</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Loading product catalog from database...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 py-12">
                    <Package size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">No products found</p>
                    <p className="text-xs text-slate-400">Add products to your catalog to start selling.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const minStock = p.minStock ?? p.minThreshold ?? 5;
                  const isLow = (p.stock ?? 0) <= minStock;
                  const isOut = (p.stock ?? 0) === 0;
                  const margin =
                    p.price > 0 && p.costPrice
                      ? (((p.price - p.costPrice) / p.price) * 100).toFixed(0)
                      : null;
                  const rowKey = p._id || p.id;

                  return (
                    <tr key={rowKey} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                            {p.image && (p.image.startsWith("http") || p.image.startsWith("data:")) ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              p.image || "📦"
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm md:text-base font-semibold text-slate-900 truncate max-w-xs">{p.name}</p>
                            <span className="text-xs text-slate-400 font-mono">
                              {p._id || p.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-xs md:text-sm">
                          {p.category}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs md:text-sm text-slate-700 font-medium">
                        <div>{p.barcode}</div>
                        <div className="text-slate-400 text-xs">{p.sku || p.skuCode}</div>
                      </td>

                      <td className="px-5 py-4 text-slate-700 font-mono text-xs md:text-sm font-medium">
                        Rs. {(p.costPrice || 0).toFixed(2)}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold font-mono text-blue-600 text-sm md:text-base">
                          Rs. {(p.price || 0).toFixed(2)}
                        </p>
                        {margin && (
                          <p className="text-xs text-emerald-600 font-semibold">+{margin}% margin</p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isOut ? "bg-rose-500" : isLow ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                          />
                          <span
                            className={`font-bold text-sm md:text-base ${
                              isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-slate-800"
                            }`}
                          >
                            {p.stock ?? 0} {p.unit}
                          </span>
                        </div>
                        {isLow && !isOut && (
                          <span className="text-xs text-amber-600 font-medium">
                            Alert ≤ {minStock}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setModalOpen(true);
                            }}
                            disabled={saving}
                            className="inline-flex items-center gap-1 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Pencil size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            disabled={saving}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <ProductModal
          editingProduct={editingProduct}
          saving={saving}
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
