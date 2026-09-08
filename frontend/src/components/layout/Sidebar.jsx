import React from "react";
import {
  LayoutGrid,
  Package,
  Tag,
  Boxes,
  CreditCard,
  FileClock,
  Users,
  BarChart3,
  Bell,
  LogOut,
  RotateCcw,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function Sidebar({ activeTab, setActiveTab }) {
  const { currentUser, logout, lowStockCount, resetToDefaultData } = useApp();

  // Role permissions:
  // Admin: all modules
  // Manager: all modules
  // Cashier: Billing & Payment, Bill History, Dashboard
  // Supervisor: Dashboard, Products, Categories, Inventory, Billing & Payment, Bill History
  // Inventory Staff: Dashboard, Products, Categories, Inventory, Reports

  const userRole = currentUser?.role || "Admin";

  const allItems = [
    { id: "dashboard", icon: LayoutGrid, label: "Dashboard", allowedRoles: ["Admin", "Manager", "Cashier", "Supervisor", "Inventory Staff"] },
    { id: "pos", icon: CreditCard, label: "Billing & Payment", allowedRoles: ["Admin", "Manager", "Cashier", "Supervisor"] },
    { id: "bills", icon: FileClock, label: "Bill History", allowedRoles: ["Admin", "Manager", "Cashier", "Supervisor"] },
    { id: "products", icon: Package, label: "Products", allowedRoles: ["Admin", "Manager", "Supervisor", "Inventory Staff"] },
    { id: "categories", icon: Tag, label: "Categories", allowedRoles: ["Admin", "Manager", "Supervisor", "Inventory Staff"] },
    { id: "inventory", icon: Boxes, label: "Inventory", badge: lowStockCount > 0 ? lowStockCount : null, allowedRoles: ["Admin", "Manager", "Supervisor", "Inventory Staff"] },
    { id: "users", icon: Users, label: "User Management", allowedRoles: ["Admin", "Manager"] },
    { id: "reports", icon: BarChart3, label: "Reports", allowedRoles: ["Admin", "Manager", "Supervisor", "Inventory Staff"] },
  ];

  const items = allItems.filter((item) => item.allowedRoles.includes(userRole));

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm shadow-blue-500/20">
          ET
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-800 tracking-tight">EGOTECH</p>
          <p className="text-xs font-bold text-blue-600 tracking-wider">WORLD SUPERMART</p>
        </div>
      </div>

      {/* Navigation Header */}
      <p className="px-5 pt-4 pb-2 text-[11px] font-semibold tracking-wider text-slate-400">
        MAIN MENU
      </p>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {items.map(({ id, icon: Icon, label, badge }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}
                />
                <span>{label}</span>
              </span>
              {badge ? (
                <span
                  className={`text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                    isActive ? "bg-white text-blue-600" : "bg-rose-500 text-white"
                  }`}
                  title={`${badge} items with low stock`}
                >
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Demo Reset Helper Button */}
      <div className="px-4 py-2">
        <button
          onClick={() => {
            if (window.confirm("Reset all data to default mock records?")) {
              resetToDefaultData();
            }
          }}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Reset database to demo seeds"
        >
          <RotateCcw size={12} />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div
          onClick={() => setActiveTab("profile")}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
            {initials}
          </div>
          <div className="leading-tight text-sm min-w-0 flex-1">
            <p className="font-semibold text-slate-800 truncate">{currentUser?.name || "Administrator"}</p>
            <p className="text-[11px] text-slate-500 truncate">
              {currentUser?.role || "Admin"} • My Profile
            </p>
          </div>
          <Bell size={14} className="text-slate-400 hover:text-slate-600" />
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 mt-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>
    </aside>
  );
}
