import React, { useState, useRef } from "react";
import { X, Package, Loader2, Image as ImageIcon, Link, Upload } from "lucide-react";
import { useApp } from "../../context/AppContext";
import ModalPortal from "../layout/ModalPortal";

export default function ProductModal({ editingProduct, onClose, onSave, saving = false }) {
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
      image: "",
    }
  );

  const [errors, setErrors] = useState({});
  const [imageTab, setImageTab] = useState("url");
  const fileInputRef = useRef(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || saving) return;
    await onSave({
      ...form,
      costPrice: Number(form.costPrice) || 0,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      minStock: Number(form.minStock) || 5,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("image", reader.result);
    reader.readAsDataURL(file);
  };

  const isRealImage = (src) => {
    if (!src) return false;
    return src.startsWith("http") || src.startsWith("https") || src.startsWith("data:");
  };

  // shared input class
  const inp = "w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#4A80B4]/20 focus:border-[#4A80B4] bg-white";
  const lbl = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5";

  return (
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
        onClick={onClose}
      >
        {/* ── Modal Card Container ── */}
        <div
          style={{ backgroundColor: "#ffffff" }}
          className="rounded-2xl shadow-2xl border border-slate-100 w-full max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Fixed Header ── */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0 bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#4A80B4] border border-[#4A80B4]/20 flex items-center justify-center shadow-xs">
                <Package size={16} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">
                  {isEdit ? "Edit Product Details" : "Add New Product"}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isEdit ? `Updating ${form.sku}` : "Fill in all required fields"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Scrollable Form Body ── */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {/* Product Image */}
              <div>
                <label className={lbl}>PRODUCT IMAGE</label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 flex items-center justify-center bg-white overflow-hidden shrink-0">
                    {isRealImage(form.image) ? (
                      <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <ImageIcon size={18} className="text-slate-300" />
                        <span className="text-[9px] text-slate-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg w-fit">
                      <button
                        type="button"
                        onClick={() => setImageTab("url")}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          imageTab === "url" ? "bg-white text-[#4A80B4] shadow-xs" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <Link size={10} /> Image URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageTab("file")}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          imageTab === "file" ? "bg-white text-[#4A80B4] shadow-xs" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <Upload size={10} /> Upload File
                      </button>
                    </div>

                    {imageTab === "url" && (
                      <input
                        type="url"
                        value={form.image?.startsWith("data:") ? "" : (form.image || "")}
                        onChange={(e) => update("image", e.target.value)}
                        placeholder="https://example.com/product.jpg"
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-[12px] outline-none focus:border-[#4A80B4] bg-white placeholder-slate-400"
                      />
                    )}

                    {imageTab === "file" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          id="product-image-file-input"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#4A80B4] transition-colors cursor-pointer"
                        >
                          <Upload size={12} /> Choose Image File
                        </button>
                        {form.image?.startsWith("data:") && (
                          <span className="text-[11px] text-emerald-600 font-medium">✓ Loaded</span>
                        )}
                      </div>
                    )}

                    {isRealImage(form.image) && (
                      <button
                        type="button"
                        onClick={() => update("image", "")}
                        className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className={lbl}>PRODUCT NAME *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Dilmah Premium Ceylon Tea 200g"
                  className={`${inp} ${errors.name ? "border-rose-400" : ""}`}
                />
                {errors.name && <p className="text-[11px] text-rose-500 mt-0.5">{errors.name}</p>}
              </div>

              {/* Barcode + SKU */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={lbl}>BARCODE *</label>
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={(e) => update("barcode", e.target.value)}
                    className={`${inp} font-mono ${errors.barcode ? "border-rose-400" : ""}`}
                  />
                  {errors.barcode && <p className="text-[11px] text-rose-500 mt-0.5">{errors.barcode}</p>}
                </div>
                <div>
                  <label className={lbl}>SKU CODE</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => update("sku", e.target.value)}
                    className={`${inp} font-mono`}
                  />
                </div>
              </div>

              {/* Category + Unit */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={lbl}>CATEGORY</label>
                  <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inp}>
                    {categories.map((c) => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lbl}>UNIT</label>
                  <select value={form.unit} onChange={(e) => update("unit", e.target.value)} className={inp}>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="pack">Pack</option>
                    <option value="bottle">Bottle</option>
                    <option value="box">Box</option>
                    <option value="can">Can</option>
                  </select>
                </div>
              </div>

              {/* Cost + Selling Price */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={lbl}>COST PRICE (RS.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(e) => update("costPrice", e.target.value)}
                    placeholder="0.00"
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>SELLING PRICE (RS.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    placeholder="0.00"
                    className={`${inp} ${errors.price ? "border-rose-400" : ""}`}
                  />
                  {errors.price && <p className="text-[11px] text-rose-500 mt-0.5">{errors.price}</p>}
                </div>
              </div>

              {/* Margin chip + Stock + Low stock */}
              <div className="grid grid-cols-3 gap-2 items-end">
                <div className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">Margin</span>
                  <span className={`text-xs font-bold font-mono ${Number(margin) >= 15 ? "text-emerald-600" : "text-amber-600"}`}>
                    {margin}%
                  </span>
                </div>
                <div>
                  <label className={lbl}>STOCK QTY</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => update("stock", e.target.value)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>LOW STOCK AT</label>
                  <input
                    type="number"
                    value={form.minStock}
                    onChange={(e) => update("minStock", e.target.value)}
                    className={inp}
                  />
                </div>
              </div>
            </div>

            {/* ── Fixed Footer ── */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="bg-white hover:bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-xl transition-colors text-sm border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 bg-[#4A80B4] hover:bg-[#3B6D9E] text-white font-bold px-5 py-2 rounded-xl shadow-xs transition-colors disabled:opacity-60 text-sm cursor-pointer active:scale-98"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <span>✓</span>}
                <span>{saving ? "Saving…" : isEdit ? "Update Product" : "Save Product"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}