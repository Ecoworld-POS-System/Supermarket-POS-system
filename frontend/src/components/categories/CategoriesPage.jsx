import React, { useState } from "react";
import { Tag, Plus, Layers, Package, X } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function CategoriesPage() {
  const { categories, addCategory, products } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCategory({
      name: name.trim(),
      code: (code || name.slice(0, 4)).toUpperCase(),
      color: "from-blue-500 to-indigo-600",
    });
    setName("");
    setCode("");
    setModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Supermarket Departments & Categories</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize inventory aisles, sales reporting groups, and catalog tags
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Category</span>
        </button>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((c) => {
          const catProducts = products.filter((p) => p.category === c.name);
          const totalStock = catProducts.reduce((sum, p) => sum + p.stock, 0);
          const totalValue = catProducts.reduce((sum, p) => sum + p.price * p.stock, 0);

          return (
            <div
              key={c.id}
              className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <Tag size={18} />
                </div>
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                  {c.code || c.id}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Department aisle code: {c.code}</p>

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
                <span className="font-bold text-blue-600 font-mono">
                  Rs. {totalValue.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Department</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  CATEGORY NAME *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Frozen Foods"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  DEPARTMENT CODE
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. FROZ"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-mono outline-none focus:border-blue-500 uppercase"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
