import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutGrid, Package, Tag, Boxes, CreditCard, FileClock,
  Users, BarChart3, Bell, LogOut, Search, UserPlus, Pencil,
  X, Copy, RefreshCw, Lock, Eye, EyeOff, Shield, CheckCircle,
  AlertTriangle, Trash2, ChevronDown, ArrowLeft, KeyRound,
  Building2, UserCheck, UserX, Phone, Mail, Clock, Filter,
  MoreHorizontal, Check, XCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const ROLES = ["Admin", "Manager", "Cashier", "Supervisor", "Inventory Staff"];
const BRANCHES = [
  "Colombo – Head Office",
  "Kandy Branch",
  "Galle Branch",
  "Negombo Branch",
  "Matara Branch",
];

const ROLE_CONFIG = {
  Admin:            { bg: "bg-indigo-50",  text: "text-indigo-700",  ring: "ring-indigo-200",  dot: "bg-indigo-500"  },
  Manager:          { bg: "bg-purple-50",  text: "text-purple-700",  ring: "ring-purple-200",  dot: "bg-purple-500"  },
  Cashier:          { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  Supervisor:       { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200",   dot: "bg-amber-500"   },
  "Inventory Staff":{ bg: "bg-sky-50",     text: "text-sky-700",     ring: "ring-sky-200",     dot: "bg-sky-500"     },
};

const INITIAL_USERS = [
  { id:"EMP-001", name:"Administrator",       email:"admin@egotechworld.com",    phone:"+94 77 123 4567", role:"Admin",           branch:"Colombo – Head Office", status:"Active",   lastLogin:"13 Aug 2026, 08:14 AM", joinDate:"01 Jan 2023" },
  { id:"EMP-002", name:"Sachini Madushani",   email:"sachini@egotechworld.com",  phone:"+94 71 234 5678", role:"Cashier",         branch:"Colombo – Head Office", status:"Active",   lastLogin:"13 Aug 2026, 09:03 AM", joinDate:"15 Mar 2024" },
  { id:"EMP-003", name:"Raveendra Kumara",    email:"raveendra@egotechworld.com",phone:"+94 75 345 6789", role:"Cashier",         branch:"Colombo – Head Office", status:"Active",   lastLogin:"13 Aug 2026, 09:15 AM", joinDate:"10 Jun 2024" },
  { id:"EMP-004", name:"Malith Abeysekara",   email:"malith@egotechworld.com",   phone:"+94 76 456 7890", role:"Cashier",         branch:"Colombo – Head Office", status:"Active",   lastLogin:"12 Aug 2026, 08:45 AM", joinDate:"22 Aug 2024" },
  { id:"EMP-005", name:"Priyanka Jayasinghe", email:"priyanka@egotechworld.com", phone:"+94 78 567 8901", role:"Manager",         branch:"Kandy Branch",          status:"Active",   lastLogin:"13 Aug 2026, 10:30 AM", joinDate:"05 Apr 2023" },
  { id:"EMP-006", name:"Nuwan Dissanayake",   email:"nuwan@egotechworld.com",    phone:"+94 70 678 9012", role:"Supervisor",      branch:"Kandy Branch",          status:"Active",   lastLogin:"12 Aug 2026, 07:00 PM", joinDate:"14 Feb 2023" },
  { id:"EMP-007", name:"Dilsha Fernando",     email:"dilsha@egotechworld.com",   phone:"+94 72 789 0123", role:"Cashier",         branch:"Kandy Branch",          status:"Inactive", lastLogin:"01 Jul 2026, 02:11 PM", joinDate:"30 Nov 2023" },
  { id:"EMP-008", name:"Sithara Rodrigo",     email:"sithara@egotechworld.com",  phone:"+94 77 890 1234", role:"Inventory Staff", branch:"Galle Branch",          status:"Active",   lastLogin:"13 Aug 2026, 07:55 AM", joinDate:"17 May 2024" },
  { id:"EMP-009", name:"Gayan Wickramasinghe",email:"gayan@egotechworld.com",    phone:"+94 74 901 2345", role:"Cashier",         branch:"Galle Branch",          status:"Active",   lastLogin:"13 Aug 2026, 08:40 AM", joinDate:"09 Oct 2024" },
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function genEmpId(users) {
  const nums = users.map((u) => parseInt(u.id.split("-")[1], 10)).filter(Boolean);
  return `EMP-${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
}

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function useLocalStorage(key, defaultVal) {
  const [val, setVal] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultVal;
    } catch { return defaultVal; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL UI ATOMS
// ─────────────────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG["Cashier"];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ring-inset ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const active = status === "Active";
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${active ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-rose-50 text-rose-600 ring-1 ring-rose-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500 animate-pulse-soft" : "bg-rose-500"}`} />
      {status}
    </span>
  );
}

function Avatar({ name, size = "md", className = "" }) {
  const sizes = { sm: "w-7 h-7 text-[11px]", md: "w-9 h-9 text-sm", lg: "w-16 h-16 text-xl" };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold ring-2 ring-white shadow-sm shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = "blue" }) {
  const colors = {
    blue:   { ring: "ring-blue-100",   bg: "bg-blue-50",   text: "text-blue-600",   num: "text-slate-800" },
    green:  { ring: "ring-emerald-100",bg: "bg-emerald-50",text: "text-emerald-600",num: "text-emerald-700" },
    red:    { ring: "ring-rose-100",   bg: "bg-rose-50",   text: "text-rose-600",   num: "text-rose-700" },
    purple: { ring: "ring-purple-100", bg: "bg-purple-50", text: "text-purple-600", num: "text-slate-800" },
  };
  const c = colors[color];
  return (
    <div className={`flex items-center gap-3 bg-white border border-slate-200 ring-1 ${c.ring} rounded-2xl px-5 py-3.5 shadow-xs hover:shadow-sm transition-shadow`}>
      <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.text} flex items-center justify-center shrink-0`}>
        <Icon size={18} />
      </div>
      <div>
        <p className={`text-xl font-bold leading-none ${c.num}`}>{value}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: LayoutGrid,  label: "Dashboard",       tab: "dashboard" },
  { icon: Package,     label: "Products",         tab: "products"  },
  { icon: Tag,         label: "Categories",       tab: "categories"},
  { icon: Boxes,       label: "Inventory",        tab: "inventory", badge: 4 },
  { icon: CreditCard,  label: "Billing & Payment",tab: "pos"       },
  { icon: FileClock,   label: "Bill History",     tab: "bills"     },
  { icon: Users,       label: "User Management",  tab: "users"     },
  { icon: BarChart3,   label: "Reports",          tab: "reports"   },
];

function Sidebar({ activeTab, setActiveTab, currentUser, onLogout, lowNotif = 4 }) {
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200 h-full shrink-0 z-20">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center text-xs font-bold shadow-sm shadow-blue-500/30">
          ET
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-800 tracking-tight">EGOTECH</p>
          <p className="text-xs font-semibold text-blue-600">WORLD SUPERMART</p>
        </div>
      </div>

      {/* Nav */}
      <p className="px-5 pt-5 pb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Main Menu</p>
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, tab, badge }) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              id={`nav-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={16} className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"} />
                {label}
              </span>
              {badge && !isActive && (
                <span className="text-[10px] bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
             onClick={() => setActiveTab("profile")}>
          <Avatar name={currentUser?.name || "Admin"} size="sm" />
          <div className="leading-tight flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">{currentUser?.name || "Administrator"}</p>
            <p className="text-[11px] text-slate-400">{currentUser?.role || "Admin"} · My Profile</p>
          </div>
          <Bell size={13} className="text-rose-500 shrink-0" />
        </div>
        <button
          id="sidebar-logout"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPBAR
// ─────────────────────────────────────────────────────────────────────────────
function Topbar({ activeTab, currentUser }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const tabNames = {
    dashboard:"Dashboard Overview", products:"Product Catalog", categories:"Departments & Categories",
    inventory:"Inventory Control",  pos:"POS Register",        bills:"Bill History & Sales",
    users:"Authentication & User Management", reports:"Sales Reports", profile:"My Profile",
  };

  const dateStr = now.toLocaleDateString("en-GB", { weekday:"long", day:"2-digit", month:"long", year:"numeric" });

  return (
    <header className="h-14 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 text-xs font-medium">EGOTECH WORLD</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-semibold text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
          {tabNames[activeTab] || "Management"}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <Clock size={12} />
          {dateStr}
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 ring-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
          {currentUser?.branch?.split("–")[0]?.trim() || "Colombo"}
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, users }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPersonas = [
    { label: "Admin",     role: "Admin",           emp: users.find(u => u.role === "Admin")           },
    { label: "Manager",   role: "Manager",         emp: users.find(u => u.role === "Manager")         },
    { label: "Cashier",   role: "Cashier",         emp: users.find(u => u.role === "Cashier")         },
    { label: "Inventory", role: "Inventory Staff", emp: users.find(u => u.role === "Inventory Staff") },
  ];

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (!id.trim() || !password.trim()) {
      setError("Please enter your Employee ID and password.");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      const user = users.find(
        u => u.id.toLowerCase() === id.trim().toLowerCase() ||
             u.email.toLowerCase() === id.trim().toLowerCase()
      );
      if (!user) {
        if (password.length >= 4) {
          onLogin({ id: "EMP-001", name: "Administrator", role: "Admin", branch: "Colombo – Head Office", email: "admin@egotechworld.com", phone: "+94 77 123 4567", status: "Active" });
        } else {
          setError("Invalid Employee ID or password.");
        }
      } else if (user.status === "Inactive") {
        setError("This account is deactivated. Contact your administrator.");
      } else {
        onLogin(user);
      }
      setLoading(false);
    }, 500);
  };

  const quickLogin = (emp) => {
    if (!emp) return;
    setId(emp.id);
    setPassword("admin123");
    setError("");
    setTimeout(() => onLogin(emp), 100);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex flex-col items-center justify-center px-4 py-10">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center mb-8 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center text-xl font-extrabold shadow-2xl mb-4">
          ET
        </div>
        <h1 className="text-white text-2xl font-extrabold tracking-tight">EGOTECH WORLD</h1>
        <p className="text-blue-200 text-sm mt-1">Supermart POS & Enterprise System</p>
      </div>

      <div className="relative w-full max-w-sm animate-slide-in">
        {/* Quick Login Personas */}
        <div className="mb-4">
          <p className="text-blue-200/60 text-[11px] font-semibold text-center mb-2 tracking-wide uppercase">Quick Demo Login</p>
          <div className="grid grid-cols-4 gap-2">
            {quickPersonas.map(({ label, emp }) => (
              <button
                key={label}
                id={`quick-login-${label.toLowerCase()}`}
                onClick={() => quickLogin(emp)}
                className="flex flex-col items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-2.5 px-1 text-white transition-all duration-150 hover:scale-105 active:scale-95"
              >
                <Avatar name={emp?.name || label} size="sm" className="ring-white/30" />
                <span className="text-[10px] font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Card */}
        <form onSubmit={handleLogin} className="bg-white rounded-3xl shadow-2xl p-7">
          <p className="font-bold text-slate-800 text-lg">Welcome back</p>
          <p className="text-xs text-slate-400 mb-6">Sign in with your employee credentials</p>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Username / Employee ID</label>
              <input
                id="login-id"
                value={id}
                onChange={e => setId(e.target.value)}
                placeholder="e.g. EMP-001 or admin@egotechworld.com"
                className="mt-1.5 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Password</label>
              <div className="relative mt-1.5">
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5 text-rose-600 text-xs font-medium animate-fade-in">
                <XCircle size={14} />
                {error}
              </div>
            )}

            <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-blue-600 w-4 h-4 rounded" />
              Remember this device for 30 days
            </label>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold py-3 rounded-xl shadow-sm shadow-blue-500/20 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Shield size={15} />
              )}
              {loading ? "Signing in..." : "Log In to System"}
            </button>
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-5">
            Demo: any Employee ID · password <span className="font-mono font-semibold text-slate-600">admin123</span>
          </p>
        </form>
      </div>

      <p className="relative text-blue-200/50 text-[11px] mt-8">
        © 2026 EgoTech World (Pvt) Ltd. All rights reserved.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE / EDIT USER MODAL
// ─────────────────────────────────────────────────────────────────────────────
function UserModal({ existingUsers, editingUser, onClose, onSave }) {
  const isEdit = !!editingUser;
  const [form, setForm] = useState(
    editingUser || { id: genEmpId(existingUsers), name: "", email: "", phone: "", role: "Cashier", branch: BRANCHES[0], status: "Active" }
  );
  const [password, setPassword] = useState(genPassword());
  const [showPw, setShowPw] = useState(false);
  const [requireChange, setRequireChange] = useState(true);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCopy = () => {
    navigator.clipboard?.writeText(password).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      onSave({ ...form, lastLogin: isEdit ? form.lastLogin : "Never logged in", joinDate: form.joinDate || new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) });
      setSaving(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">{isEdit ? "Edit Employee" : "Create New Employee"}</p>
              <p className="text-xs text-slate-400 mt-0.5">{isEdit ? `Editing ${form.id}` : "Employee ID will be auto-assigned"}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
            {/* Auto-ID chip */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-widest text-blue-600 uppercase">
                {isEdit ? "Employee ID" : "Auto-Assigned ID"}
              </span>
              <span className="text-sm font-mono font-bold text-blue-700">{form.id}</span>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Full Name *</label>
              <input
                value={form.name}
                onChange={e => update("name", e.target.value)}
                placeholder="e.g. Kavindu Perera"
                className={`mt-1.5 w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all ${errors.name ? "border-rose-400 bg-rose-50" : "border-slate-200"}`}
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><XCircle size={12}/>{errors.name}</p>}
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Email Address *</label>
                <input
                  value={form.email}
                  onChange={e => update("email", e.target.value)}
                  placeholder="name@egotechworld.com"
                  className={`mt-1.5 w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all ${errors.email ? "border-rose-400 bg-rose-50" : "border-slate-200"}`}
                />
                {errors.email && <p className="text-xs text-rose-500 mt-1"><XCircle size={12} className="inline mr-1"/>{errors.email}</p>}
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                <input
                  value={form.phone || ""}
                  onChange={e => update("phone", e.target.value)}
                  placeholder="+94 77 000 0000"
                  className="mt-1.5 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Role & Access Level *</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {ROLES.map(r => {
                  const cfg = ROLE_CONFIG[r];
                  const isSelected = form.role === r;
                  return (
                    <label key={r}
                      className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 text-sm cursor-pointer transition-all duration-150 ${
                        isSelected ? `border-blue-500 ${cfg.bg} ${cfg.text} ring-1 ring-blue-300` : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}>
                      <input type="radio" name="role" checked={isSelected} onChange={() => update("role", r)} className="sr-only" />
                      <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span className="font-medium text-xs">{r}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Branch */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Branch / Location</label>
              <div className="relative mt-1.5">
                <Building2 size={14} className="absolute left-3 top-3 text-slate-400" />
                <select
                  value={form.branch}
                  onChange={e => update("branch", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none"
                >
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Status (edit only) */}
            {isEdit && (
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Account Status</label>
                <div className="flex gap-3 mt-2">
                  {["Active", "Inactive"].map(s => (
                    <label key={s}
                      className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-sm cursor-pointer flex-1 justify-center transition-all ${
                        form.status === s
                          ? (s === "Active" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-rose-400 bg-rose-50 text-rose-700")
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}>
                      <input type="radio" name="status" checked={form.status === s} onChange={() => update("status", s)} className="sr-only" />
                      {s === "Active" ? <UserCheck size={14} /> : <UserX size={14} />}
                      <span className="font-semibold text-xs">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Temp Password (create only) */}
            {!isEdit && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound size={14} className="text-slate-500" />
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Temporary Password</label>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      readOnly
                      type={showPw ? "text" : "password"}
                      value={password}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 pr-9 text-sm bg-white font-mono outline-none"
                    />
                    <button type="button" onClick={() => setShowPw(s => !s)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  <button type="button" onClick={handleCopy}
                    className={`flex items-center gap-1.5 text-xs font-semibold border rounded-xl px-3 py-2 transition-all ${copied ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}>
                    {copied ? <Check size={13}/> : <Copy size={13}/>}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button type="button" onClick={() => setPassword(genPassword())}
                    className="flex items-center gap-1.5 text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-100 transition-all">
                    <RefreshCw size={13}/> Regen
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Share this password securely with the employee.</p>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={requireChange} onChange={e => setRequireChange(e.target.checked)}
                    className="mt-0.5 accent-blue-600 w-4 h-4 rounded" />
                  <span className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Require password change on first login</span>
                    <br/>
                    <span className="text-slate-400">User must set a new password before accessing the system.</span>
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-white transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all disabled:opacity-70">
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : <UserPlus size={15}/>}
              {saving ? "Saving..." : (isEdit ? "Save Changes" : "Create Employee")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRMATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
function DeleteModal({ user, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center animate-slide-in border border-slate-100">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24}/>
        </div>
        <p className="font-bold text-slate-800 text-lg">Delete Employee?</p>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-700">{user?.name}</span> ({user?.id})? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT PAGE
// ─────────────────────────────────────────────────────────────────────────────
function UserManagementPage({ users, setUsers, onOpenProfile }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone || "").includes(q);
    const matchRole   = roleFilter === "All Roles" || u.role === roleFilter;
    const matchStatus = statusFilter === "All Status" || u.status === statusFilter;
    const matchBranch = branchFilter === "All Branches" || u.branch === branchFilter;
    return matchSearch && matchRole && matchStatus && matchBranch;
  }), [users, search, roleFilter, statusFilter, branchFilter]);

  const activeCount   = users.filter(u => u.status === "Active").length;
  const inactiveCount = users.length - activeCount;
  const byRole = ROLES.reduce((acc, r) => { acc[r] = users.filter(u => u.role === r).length; return acc; }, {});

  const handleSave = (user) => {
    setUsers(prev => {
      const exists = prev.some(u => u.id === user.id);
      return exists ? prev.map(u => u.id === user.id ? user : u) : [user, ...prev];
    });
    setModalOpen(false);
    setEditingUser(null);
    showSuccess(editingUser ? `${user.name}'s profile updated.` : `${user.name} added successfully.`);
  };

  const handleToggleStatus = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const next = u.status === "Active" ? "Inactive" : "Active";
      showSuccess(`${u.name} set to ${next}.`);
      return { ...u, status: next };
    }));
  };

  const handleDelete = () => {
    setUsers(prev => prev.filter(u => u.id !== deleteTarget?.id));
    showSuccess(`${deleteTarget?.name} removed from the system.`);
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Authentication &amp; User Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage employee accounts, roles, branch assignments, and access control</p>
        </div>
        <button
          id="add-user-btn"
          onClick={() => { setEditingUser(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 self-start sm:self-auto"
        >
          <UserPlus size={16}/> Add New Employee
        </button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-3 rounded-2xl animate-fade-in">
          <CheckCircle size={16}/> {successMsg}
        </div>
      )}

      {/* Stats Row */}
      <div className="flex flex-wrap gap-3">
        <StatCard icon={Users}    label="Total Employees" value={users.length}   color="blue"   />
        <StatCard icon={UserCheck} label="Active"          value={activeCount}    color="green"  />
        <StatCard icon={UserX}    label="Inactive"         value={inactiveCount}  color="red"    />
        <StatCard icon={Shield}   label="Admins"           value={byRole["Admin"] || 0} color="purple" />
      </div>

      {/* Role distribution mini-pills */}
      <div className="flex flex-wrap gap-2">
        {ROLES.map(r => (
          <button key={r} onClick={() => setRoleFilter(roleFilter === r ? "All Roles" : r)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              roleFilter === r ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${ROLE_CONFIG[r].dot}`} />
            {r} <span className="opacity-70">({byRole[r] || 0})</span>
          </button>
        ))}
        {roleFilter !== "All Roles" && (
          <button onClick={() => setRoleFilter("All Roles")} className="text-xs text-slate-400 hover:text-slate-600 underline">Clear</button>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3.5 top-3 text-slate-400"/>
            <input
              id="user-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID, email, or phone..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                <X size={14}/>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter size={13} className="text-slate-400"/>
            <select id="role-filter" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none pr-7">
              <option>All Roles</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
            <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none pr-7">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <select id="branch-filter" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none pr-7">
              <option>All Branches</option>
              {BRANCHES.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>

          <span className="text-xs text-slate-400 ml-auto font-medium">
            {filtered.length} of {users.length} employees
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70 border-b border-slate-100">
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Branch</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Login</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => onOpenProfile(u)} title="View profile">
                        <Avatar name={u.name} size="sm" className="hover:ring-blue-400 transition-all" />
                      </button>
                      <div>
                        <button onClick={() => onOpenProfile(u)}
                          className="font-semibold text-slate-800 hover:text-blue-600 text-sm transition-colors text-left">
                          {u.name}
                        </button>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-slate-400">{u.id}</span>
                          <span className="text-slate-200">·</span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[160px]">{u.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><RoleBadge role={u.role}/></td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Building2 size={12} className="text-slate-400"/>
                      {u.branch}
                    </span>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={u.status}/></td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={11}/>{u.lastLogin}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onOpenProfile(u)} title="View Profile"
                        className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" id={`view-profile-${u.id}`}>
                        <Users size={14}/>
                      </button>
                      <button onClick={() => { setEditingUser(u); setModalOpen(true); }} title="Edit"
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" id={`edit-user-${u.id}`}>
                        <Pencil size={14}/>
                      </button>
                      <button onClick={() => handleToggleStatus(u.id)} title={u.status === "Active" ? "Deactivate" : "Activate"}
                        className={`p-1.5 rounded-lg transition-colors ${u.status === "Active" ? "hover:bg-amber-100 text-amber-600" : "hover:bg-emerald-100 text-emerald-600"}`}
                        id={`toggle-status-${u.id}`}>
                        {u.status === "Active" ? <UserX size={14}/> : <UserCheck size={14}/>}
                      </button>
                      <button onClick={() => setDeleteTarget(u)} title="Delete"
                        className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 transition-colors" id={`delete-user-${u.id}`}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <Users size={32} className="mx-auto mb-3 opacity-30"/>
                    <p className="text-sm font-medium">No employees match your filters.</p>
                    <p className="text-xs mt-1">Try adjusting your search or filter criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">Showing {filtered.length} employees · Last updated just now</p>
          <button onClick={() => { setSearch(""); setRoleFilter("All Roles"); setStatusFilter("All Status"); setBranchFilter("All Branches"); }}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold">Reset Filters</button>
        </div>
      </div>

      {modalOpen && <UserModal existingUsers={users} editingUser={editingUser} onClose={() => { setModalOpen(false); setEditingUser(null); }} onSave={handleSave}/>}
      {deleteTarget && <DeleteModal user={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete}/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE PAGE
// ─────────────────────────────────────────────────────────────────────────────
function ProfilePage({ user, onBack, onUpdateUser }) {
  const [form, setForm] = useState(user);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwMsg, setPwMsg] = useState({ text: "", type: "" });
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      if (onUpdateUser) onUpdateUser(form);
      setSaved(true);
      setSaving(false);
      setTimeout(() => setSaved(false), 2500);
    }, 400);
  };

  const handlePwUpdate = (e) => {
    e.preventDefault();
    if (pw.next.length < 8) { setPwMsg({ text: "New password must be at least 8 characters.", type: "error" }); return; }
    if (pw.next !== pw.confirm) { setPwMsg({ text: "New passwords do not match.", type: "error" }); return; }
    setPwMsg({ text: "Password updated successfully!", type: "success" });
    setPw({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwMsg({ text: "", type: "" }), 3000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl transition-colors hover:bg-blue-100">
        <ArrowLeft size={14}/> Back to User Directory
      </button>

      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }}/>
        </div>
        <div className="px-6 -mt-10 pb-6">
          <div className="flex items-end gap-4 mb-4">
            <Avatar name={form.name} size="lg" className="ring-4 ring-white shadow-lg" />
            <div className="pb-1">
              <h2 className="text-xl font-extrabold text-slate-800 leading-tight">{form.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge role={form.role}/>
                <StatusBadge status={form.status}/>
              </div>
            </div>
          </div>

          {/* Info strips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {[
              { icon: Shield,    label: "Employee ID", val: form.id },
              { icon: Building2, label: "Branch",      val: form.branch.split("–")[0].trim() },
              { icon: Mail,      label: "Email",       val: form.email },
              { icon: Phone,     label: "Phone",       val: form.phone || "Not set" },
              { icon: Clock,     label: "Last Login",  val: form.lastLogin || "N/A" },
              { icon: UserCheck, label: "Joined",      val: form.joinDate || "N/A" },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-start gap-2 bg-slate-50 rounded-2xl px-3.5 py-3">
                <Icon size={13} className="text-slate-400 mt-0.5 shrink-0"/>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate">{val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Edit Profile Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                <input value={form.name} onChange={e => update("name", e.target.value)}
                  className="mt-1.5 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"/>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                <input value={form.email} onChange={e => update("email", e.target.value)}
                  className="mt-1.5 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"/>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                <input value={form.phone || ""} onChange={e => update("phone", e.target.value)} placeholder="+94 77 123 4567"
                  className="mt-1.5 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"/>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Employee ID</label>
                <input readOnly value={form.id}
                  className="mt-1.5 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 text-slate-400 font-mono"/>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Role</label>
                <select value={form.role} onChange={e => update("role", e.target.value)}
                  className="mt-1.5 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Branch</label>
                <select value={form.branch} onChange={e => update("branch", e.target.value)}
                  className="mt-1.5 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-70">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Check size={15}/>}
                {saving ? "Saving..." : (saved ? "Saved ✓" : "Save Profile")}
              </button>
              {saved && <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1"><CheckCircle size={14}/> Changes saved successfully</span>}
            </div>
          </form>
        </div>
      </div>

      {/* Password Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center">
            <Lock size={16}/>
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">Change Password</p>
            <p className="text-xs text-slate-400">Use a strong password with at least 8 characters</p>
          </div>
        </div>

        {pwMsg.text && (
          <div className={`mt-4 flex items-center gap-2 text-xs font-medium px-4 py-3 rounded-xl animate-fade-in ${pwMsg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-600"}`}>
            {pwMsg.type === "success" ? <CheckCircle size={14}/> : <XCircle size={14}/>}
            {pwMsg.text}
          </div>
        )}

        <form onSubmit={handlePwUpdate} className="mt-5 space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Current Password</label>
            <div className="relative mt-1.5">
              <input type={showCur ? "text" : "password"} value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                placeholder="Enter current password"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"/>
              <button type="button" onClick={() => setShowCur(s => !s)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                {showCur ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">New Password</label>
              <div className="relative mt-1.5">
                <input type={showNew ? "text" : "password"} value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"/>
                <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                  {showNew ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {pw.next.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {[4, 6, 8, 10].map(len => (
                    <span key={len} className={`h-1 flex-1 rounded-full transition-all ${pw.next.length >= len ? (len <= 5 ? "bg-rose-400" : len <= 7 ? "bg-amber-400" : "bg-emerald-500") : "bg-slate-200"}`}/>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Confirm New Password</label>
              <input type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat new password"
                className="mt-1.5 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"/>
            </div>
          </div>
          <button type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm">
            <KeyRound size={14}/> Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER PAGE (for other nav items)
// ─────────────────────────────────────────────────────────────────────────────
function PlaceholderPage({ tab }) {
  const labels = {
    dashboard: { title: "Dashboard Overview", desc: "Sales KPIs, charts and recent activity" },
    products:  { title: "Product Catalog",    desc: "Manage SKUs, pricing and barcode mapping" },
    categories:{ title: "Departments",        desc: "Configure supermarket aisle categories" },
    inventory: { title: "Inventory Control",  desc: "Real-time stock levels and reorder alerts" },
    pos:       { title: "POS Register",       desc: "Fast checkout, payment and receipt printing" },
    bills:     { title: "Bill History",       desc: "Sales ledger, refunds and invoice reprints" },
    reports:   { title: "Sales Reports",      desc: "Revenue analytics and cashier performance" },
  };
  const info = labels[tab] || { title: tab, desc: "" };
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-12 animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-400 flex items-center justify-center mb-6 shadow-inner">
        <LayoutGrid size={36}/>
      </div>
      <h2 className="text-2xl font-extrabold text-slate-700 mb-2">{info.title}</h2>
      <p className="text-slate-400 text-sm max-w-sm">{info.desc}</p>
      <p className="text-xs text-slate-300 mt-6 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
        This module is part of the full EgoTech World ERP system
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
export default function AuthUserManagement() {
  const [users, setUsers] = useLocalStorage("egotech_users_v2", INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [profileUser, setProfileUser] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setActiveTab("users");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProfileUser(null);
    setActiveTab("users");
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} users={users}/>;
  }

  const renderContent = () => {
    if (activeTab === "profile" || (activeTab !== "users" && profileUser)) {
      if (profileUser) {
        return <ProfilePage user={profileUser} onBack={() => { setProfileUser(null); setActiveTab("users"); }} onUpdateUser={handleUpdateUser}/>;
      }
    }
    if (activeTab === "users") {
      return (
        <UserManagementPage
          users={users}
          setUsers={setUsers}
          onOpenProfile={(u) => { setProfileUser(u); setActiveTab("profile"); }}
        />
      );
    }
    if (activeTab === "profile") {
      return <ProfilePage user={currentUser} onBack={() => setActiveTab("users")} onUpdateUser={handleUpdateUser}/>;
    }
    return <PlaceholderPage tab={activeTab}/>;
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => { setActiveTab(tab); setProfileUser(null); }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar activeTab={activeTab} currentUser={currentUser}/>
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
