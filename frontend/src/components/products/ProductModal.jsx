import React, { useState } from "react";
import { X, Package, Barcode, Tag } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function ProductModal({ editingProduct, onClose, onSave }) {
  const { categories, products } = useApp();
  const isEdit = !!editingProduct;

  const [form, setForm] = useState(
    editingProduct || {
      name: "",
      category: categories[0]?.name || "Groceries & Staples",
      barcode: `89012345${String(products.length + 1).padStart(4, "0")}`,
      sku: `SKU-${String(products.length + 1).padStart(3, "0")}`,
      costPrice: "",
      price: "",
      stock: 20,
      minStock: 10,
      unit: "pcs",
      image: "📦",
    }
  );

  const [errors, setErrors] = useState({});

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const cost = Number(form.costPrice) || 0;
  const sell = Number(form.price) || 0;
  const margin = sell > 0 ? (((sell - cost) / sell) * 100).toFixed(1) : 0;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (!form.price || Number(form.price) <= 0) errs.price = "Valid selling price required";
    if (!form.barcode.trim()) errs.barcode = "Barcode is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...form,
      costPrice: Number(form.costPrice) || 0,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      minStock: Number(form.minStock) || 5,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEdit ? "Edit Product Details" : "Add Product to Inventory"}
              </h3>
              <p className="text-xs text-slate-500">
                {isEdit ? `Updating ${form.sku}` : "Define SKU, retail price, and stock levels"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Product Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                PRODUCT TITLE *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Dilmah Premium Ceylon Tea 200g"
                className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                  errors.name ? "border-rose-400" : "border-slate-200"
                }`}
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>

            {/* Category & Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  CATEGORY
                </label>
                <select
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm bg-white outline-none focus:border-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  UNIT TYPE
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => update("unit", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm bg-white outline-none focus:border-blue-500"
                >
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="pack">Pack</option>
                  <option value="bottle">Bottle</option>
                  <option value="box">Box</option>
                  <option value="can">Can</option>
                </select>
              </div>
            </div>

            {/* Barcode & SKU */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  BARCODE NUMBER *
                </label>
                <input
                  type="text"
                  value={form.barcode}
                  onChange={(e) => update("barcode", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-mono outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  SKU CODE
                </label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => update("sku", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-mono outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Cost & Selling Price with live Margin */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  COST PRICE (RS.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.costPrice}
                  onChange={(e) => update("costPrice", e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  SELLING PRICE (RS.) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="0.00"
                  className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-500 ${
                    errors.price ? "border-rose-400" : "border-slate-200"
                  }`}
                />
              </div>
            </div>

            {/* Margin display */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Gross Profit Margin:</span>
              <span className={`font-bold font-mono ${Number(margin) >= 15 ? "text-emerald-600" : "text-amber-600"}`}>
                {margin}%
              </span>
            </div>

            {/* Stock Levels */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  CURRENT STOCK QTY
                </label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => update("stock", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  LOW STOCK ALERT AT
                </label>
                <input
                  type="number"
                  value={form.minStock}
                  onChange={(e) => update("minStock", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-500/20"
            >
              <Package size={15} />
              <span>{isEdit ? "Update Product" : "Save Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
