import React, { useState, useEffect } from "react";
import { Tag, Plus, X, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import ModalPortal from "../layout/ModalPortal";

export default function CategoriesPage() {
  const { categories: globalCategories, addCategory, deleteCategory, products = [] } = useApp();
  const [localCategories, setLocalCategories] = useState(globalCategories || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  // Keep local categories in sync with global context
  useEffect(() => {
    if (globalCategories) {
      setLocalCategories(globalCategories);
    }
  }, [globalCategories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCat = {
      id: `CAT-${Date.now()}`,
      name: name.trim(),
      code: (code || name.slice(0, 4)).toUpperCase(),
      color: "from-blue-500 to-indigo-600",
    };

    if (typeof addCategory === "function") {
      addCategory(newCat);
    }
    setLocalCategories((prev) => [...prev, newCat]);

    setName("");
    setCode("");
    setModalOpen(false);
  };

  const handleDeleteCategory = (cat) => {
    if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      // 1. Call context function if exists
      if (typeof deleteCategory === "function") {
        deleteCategory(cat.id || cat._id || cat.name);
      }

      // 2. Immediately remove from local state
      setLocalCategories((prev) =>
        prev.filter((item) => (item.id || item._id || item.name) !== (cat.id || cat._id || cat.name))
      );
    }
  };

  return (
    <div className="w-full px-6 py-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Supermarket Departments & Categories
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize inventory aisles, sales reporting groups, and catalog tags
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#4A80B4] hover:bg-[#3B6D9E] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all self-start sm:self-auto cursor-pointer active:scale-98"
        >
          <Plus size={15} />
          <span>New Category</span>
        </button>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {localCategories.map((c) => {
          const catProducts = products.filter((p) => p.category === c.name);
          const totalStock = catProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
          const totalValue = catProducts.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
          const catKey = c.id || c._id || c.name;

          return (
            <div
              key={catKey}
              className="bg-white border border-slate-200 hover:border-[#4A80B4] rounded-2xl p-5 shadow-xs transition-all hover:shadow-md group relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-[#4A80B4] text-[#4A80B4] group-hover:text-white flex items-center justify-center transition-colors">
                  <Tag size={18} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    {c.code || c.id || "GEN"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(c);
                    }}
                    title={`Delete ${c.name}`}
                    className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Department aisle code: {c.code || "N/A"}</p>

              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">SKUs</span>
                  <p className="font-bold text-slate-800 text-sm">{catProducts.length} items</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Stock Qty</span>
                  <p className="font-bold text-slate-800 text-sm">{totalStock} units</p>
                </div>
              </div>

              <div className="mt-3 pt-2 bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Department Value:</span>
                <span className="font-bold text-[#4A80B4] font-mono">
                  Rs. {totalValue.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {modalOpen && (
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
            onClick={() => setModalOpen(false)}
          >
            <div
              style={{ backgroundColor: "#ffffff" }}
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#4A80B4] flex items-center justify-center">
                    <Tag size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Add New Department</h3>
                    <p className="text-[11px] text-slate-400">Classify products into sales aisle</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    CATEGORY NAME *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Frozen Foods"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#4A80B4] focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    DEPARTMENT CODE
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. FROZ"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-800 placeholder-slate-400 outline-none focus:border-[#4A80B4] focus:ring-2 focus:ring-blue-100 transition-all uppercase bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#4A80B4] hover:bg-[#3B6D9E] text-white shadow-xs transition-all cursor-pointer active:scale-98"
                  >
                    Create Category
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