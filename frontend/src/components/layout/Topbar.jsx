import React, { useState, useEffect } from "react";
import {
  MapPin,
  ChevronDown,
  UserCheck,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { BRANCHES } from "../../data/mockData";

export default function Topbar({ activeTab, setActiveTab }) {
  const { currentUser, switchUser, users, activeBranch, setActiveBranch, cart } = useApp();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };
    updateTime();
  }, []);

  const tabNames = {
    dashboard: "Executive Dashboard",
    pos: "Point of Sale (POS)",
    bills: "Bill History & Sales",
    products: "Product Catalog",
    categories: "Supermart Categories",
    inventory: "Inventory & Stock Control",
    users: "User & Staff Management",
    reports: "Sales & Financial Reports",
    profile: "User Profile & Security",
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 z-10">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-slate-700">EGOTECH WORLD</span>
        <span className="text-slate-300">/</span>
        <span className="font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg text-xs">
          {tabNames[activeTab] || "Management"}
        </span>
      </div>

      {/* Right side tools */}
      <div className="flex items-center gap-4">
        {/* Branch Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
          <MapPin size={14} className="text-blue-600" />
          <span className="font-medium text-slate-700 hidden sm:inline">Branch:</span>
          <select
            value={activeBranch}
            onChange={(e) => setActiveBranch(e.target.value)}
            className="bg-transparent border-none text-xs font-semibold text-slate-800 outline-none cursor-pointer pr-1"
          >
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Quick User Role Switcher for easy demoing */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
          <UserCheck size={14} className="text-emerald-600" />
          <span className="font-medium text-slate-700">Switch User:</span>
          <select
            value={currentUser?.id || ""}
            onChange={(e) => switchUser(e.target.value)}
            className="bg-transparent border-none text-xs font-semibold text-slate-800 outline-none cursor-pointer"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Cart button if not on POS page */}
        {activeTab !== "pos" && (
          <button
            onClick={() => setActiveTab("pos")}
            className="relative flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
          >
            <ShoppingCart size={15} />
            <span className="hidden sm:inline">POS Register</span>
            {totalCartCount > 0 && (
              <span className="bg-blue-600 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                {totalCartCount}
              </span>
            )}
          </button>
        )}

        {/* Date Display */}
        <div className="text-xs text-slate-400 font-medium hidden md:block">
          {currentDate}
        </div>
      </div>
    </header>
  );
}
