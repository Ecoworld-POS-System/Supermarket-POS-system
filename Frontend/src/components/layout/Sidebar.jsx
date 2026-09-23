import React from "react";
import * as Icons from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function Sidebar({ activeTab, setActiveTab }) {
  const { currentUser, logout, lowStockCount = 0, resetToDefaultData } = useApp() || {};

  const userRole = currentUser?.role ?? "Admin";

  const getIcon = (name) => Icons[name] || Icons.HelpCircle || (() => null);

  // Logical retail workflow order: Setup -> Stock -> POS Transaction -> Auditing
  const allItems = [
    { id: "dashboard", icon: getIcon("LayoutGrid") || getIcon("LayoutDashboard"), label: "Dashboard", allowedRoles: ["Admin", "Manager", "Cashier", "Supervisor", "Inventory Staff"] },
    
    // Inventory & Catalog Management
    { id: "categories", icon: getIcon("Tag"), label: "Categories", allowedRoles: ["Admin", "Manager", "Supervisor", "Inventory Staff"] },
    { id: "products", icon: getIcon("Package"), label: "Products", allowedRoles: ["Admin", "Manager", "Supervisor", "Inventory Staff"] },
    { id: "inventory", icon: getIcon("Boxes") || getIcon("Archive"), label: "Inventory", badge: lowStockCount > 0 ? lowStockCount : null, allowedRoles: ["Admin", "Manager", "Supervisor", "Inventory Staff"] },
    
    // Sales & Checkout Operations
    { id: "pos", icon: getIcon("CreditCard"), label: "Billing & Payment", allowedRoles: ["Admin", "Manager", "Cashier", "Supervisor"] },
    { id: "bills", icon: getIcon("FileClock") || getIcon("History"), label: "Bill History", allowedRoles: ["Admin", "Manager", "Cashier", "Supervisor"] },
    
    // Analytics & Admin Control
    { id: "reports", icon: getIcon("BarChart3") || getIcon("BarChart"), label: "Reports", allowedRoles: ["Admin", "Manager", "Supervisor", "Inventory Staff"] },
    { id: "users", icon: getIcon("Users"), label: "User Management", allowedRoles: ["Admin", "Manager"] },
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

  const BellIcon = getIcon("Bell");
  const LogOutIcon = getIcon("LogOut");
  const RotateCcwIcon = getIcon("RotateCcw");

  return (
    <aside
      style={{ backgroundColor: "#4A80B4" }}
      className="w-64 border-r border-blue-400/30 h-screen flex flex-col justify-between shrink-0 select-none text-white shadow-xl overflow-hidden pb-4"
    >
      {/* Top Header & Navigation */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-white/15 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white text-[#4A80B4] flex items-center justify-center text-sm font-black shadow-md">
            ET
          </div>
          <div className="leading-tight">
            <p className="text-sm font-black text-white tracking-wider">EGOTECH</p>
            <p className="text-[10px] font-bold text-blue-100 tracking-widest uppercase">
              WORLD SUPERMART
            </p>
          </div>
        </div>

        <p className="px-6 pt-5 pb-2 text-[10px] font-extrabold tracking-widest text-blue-200 uppercase shrink-0">
          MAIN MENU
        </p>

        {/* Navigation list with balanced spacing & logical order */}
        <nav className="flex-1 px-3.5 space-y-1.5 overflow-y-auto py-1">
          {items.map(({ id, icon: IconComponent, label, badge }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab && setActiveTab(id)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-[#4A80B4] font-bold shadow-md shadow-black/10 scale-[1.01]"
                    : "text-white/90 hover:bg-white/15 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3.5">
                  <IconComponent
                    size={18}
                    className={isActive ? "text-[#4A80B4]" : "text-white/90"}
                  />
                  <span>{label}</span>
                </span>
                {badge ? (
                  <span
                    className={`text-[10px] font-black rounded-full px-2 py-0.5 min-w-5 h-5 flex items-center justify-center ${
                      isActive ? "bg-rose-500 text-white" : "bg-white text-[#4A80B4]"
                    }`}
                  >
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Action & Profile Section */}
      <div className="px-3.5 pt-3 space-y-2.5 shrink-0 border-t border-white/20">
        {/* Reset Demo Data Button */}
        {resetToDefaultData && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset all data to default mock records?")) {
                resetToDefaultData();
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-[#4A80B4] bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md cursor-pointer active:scale-98"
            title="Reset database to demo seeds"
          >
            <RotateCcwIcon size={14} className="text-[#4A80B4]" />
            <span className="tracking-wide">Reset Demo Data</span>
          </button>
        )}

        {/* User Profile Card */}
        <div
          onClick={() => setActiveTab && setActiveTab("profile")}
          className="flex items-center gap-3 p-2.5 rounded-xl bg-white text-slate-800 shadow-md cursor-pointer hover:bg-slate-50 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-[#4A80B4] text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
            {initials}
          </div>
          <div className="leading-tight text-xs min-w-0 flex-1">
            <p className="font-extrabold text-slate-900 truncate">
              {currentUser?.name || "Administrator"}
            </p>
            <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5">
              {currentUser?.role || "Admin"} • My Profile
            </p>
          </div>
          <BellIcon size={15} className="text-slate-400 hover:text-slate-700 shrink-0" />
        </div>

        {/* Logout Button */}
        {logout && (
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <LogOutIcon size={14} />
            <span>Log Out</span>
          </button>
        )}
      </div>
    </aside>
  );
}