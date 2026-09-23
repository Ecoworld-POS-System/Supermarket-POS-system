import React, { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function LoginPage() {
  const { login, users } = useApp();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (!id.trim() || !password.trim()) {
      setError("Please enter your Employee ID and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    setTimeout(() => {
      const result = login(id, password);
      setIsLoading(false);
      if (!result?.success) {
        setError(result?.message || "Invalid credentials. Please try again.");
      }
    }, 300);
  };

  const handleQuickLogin = (user) => {
    if (!user) return;
    setId(user.id || "");
    setPassword("admin123");
    setError("");
  };

  const quickUsers = [
    { label: "Admin", emp: users?.find((u) => u.role === "Admin") || users?.[0] },
    { label: "Cashier", emp: users?.find((u) => u.role === "Cashier") || users?.[1] },
    { label: "Manager", emp: users?.find((u) => u.role === "Manager") || users?.[2] || users?.[0] },
    { label: "Inventory", emp: users?.find((u) => u.role === "Inventory Staff") || users?.[3] || users?.[0] },
  ].filter((item) => item.emp);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 selection:bg-[#4A80B4] selection:text-white">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#4A80B4] text-white flex items-center justify-center text-lg font-black shadow-md shadow-blue-900/10 mb-2.5">
          ET
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-wider">
          EGOTECH WORLD
        </h1>
        <p className="text-slate-500 text-xs font-semibold tracking-wide mt-0.5">
          Supermart Point of Sale & ERP System
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl shadow-slate-200/70 p-8 border border-slate-200/80">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access register terminal, stock inventory, and branch operations
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">
              EMPLOYEE ID / USERNAME
            </label>
            <div className="relative">
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. EMP-001 or admin"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#4A80B4]/20 focus:border-[#4A80B4] transition-all bg-white"
                required
                autoFocus
              />
              <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#4A80B4]/20 focus:border-[#4A80B4] transition-all bg-white"
                required
              />
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded text-[#4A80B4] focus:ring-[#4A80B4] border-slate-300 cursor-pointer"
              />
              <span>Remember this station</span>
            </label>
            <span className="text-[#4A80B4] hover:underline cursor-pointer font-medium">
              Need help?
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4A80B4] hover:bg-[#3B6D9E] text-white text-sm font-bold py-3 rounded-xl shadow-md shadow-[#4A80B4]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer active:scale-98"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Sign In to Terminal"
            )}
          </button>
        </form>

        {/* Quick Demo Sign-ins */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
            Quick-fill Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            {quickUsers.map(({ label, emp }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleQuickLogin(emp)}
                className="flex items-center gap-2 px-3 py-2 border border-slate-200 hover:border-[#4A80B4]/60 hover:bg-blue-50/40 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-700 group-hover:text-[#4A80B4] flex items-center justify-center text-[10px] font-bold shrink-0">
                  {label[0]}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 leading-none">{label}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {emp?.name ? emp.name.split(" ")[0] : emp?.id}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-slate-400 text-xs mt-8 text-center">
        © 2026 EgoTechWorld (Pvt) Ltd. All rights reserved. • Enterprise POS Terminal v2.4
      </p>
    </div>
  );
}