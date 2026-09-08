import React, { useState } from "react";
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
  Search,
  UserPlus,
  Pencil,
  X,
  Copy,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data — mirrors the "Authentication and User Management" screen design
// ---------------------------------------------------------------------------
const ROLES = ["Admin", "Manager", "Cashier", "Supervisor", "Inventory Staff"];
const BRANCHES = [
  "Colombo – Head Office",
  "Kandy Branch",
  "Galle Branch",
  "Negombo Branch",
  "Matara Branch",
];

const roleStyles = {
  Admin: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
  Manager: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  Cashier: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  Supervisor: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  "Inventory Staff": "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
};

const initialUsers = [
  { id: "EMP-001", name: "Administrator", email: "admin@egotechworld.com", role: "Admin", branch: "Colombo – Head Office", status: "Active", lastLogin: "13 Aug 2026, 08:14 AM" },
  { id: "EMP-002", name: "Sachini Madushani", email: "sachini@egotechworld.com", role: "Cashier", branch: "Colombo – Head Office", status: "Active", lastLogin: "13 Aug 2026, 09:03 AM" },
  { id: "EMP-003", name: "Raveendra Kumara", email: "raveendra@egotechworld.com", role: "Cashier", branch: "Colombo – Head Office", status: "Active", lastLogin: "13 Aug 2026, 09:15 AM" },
  { id: "EMP-004", name: "Malith Abeysekara", email: "malith@egotechworld.com", role: "Cashier", branch: "Colombo – Head Office", status: "Active", lastLogin: "12 Aug 2026, 08:45 AM" },
  { id: "EMP-005", name: "Priyanka Jayasinghe", email: "priyanka@egotechworld.com", role: "Manager", branch: "Kandy Branch", status: "Active", lastLogin: "13 Aug 2026, 10:30 AM" },
  { id: "EMP-006", name: "Nuwan Dissanayake", email: "nuwan@egotechworld.com", role: "Supervisor", branch: "Kandy Branch", status: "Active", lastLogin: "12 Aug 2026, 07:00 PM" },
  { id: "EMP-007", name: "Dilsha Fernando", email: "dilsha@egotechworld.com", role: "Cashier", branch: "Kandy Branch", status: "Inactive", lastLogin: "01 Jul 2026, 02:11 PM" },
  { id: "EMP-008", name: "Sithara Rodrigo", email: "sithara@egotechworld.com", role: "Inventory Staff", branch: "Galle Branch", status: "Active", lastLogin: "13 Aug 2026, 07:55 AM" },
  { id: "EMP-009", name: "Gayan Wickramasinghe", email: "gayan@egotechworld.com", role: "Cashier", branch: "Galle Branch", status: "Active", lastLogin: "13 Aug 2026, 08:40 AM" },
];

function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
function genEmpId(existing) {
  const nums = existing.map((u) => parseInt(u.id.split("-")[1], 10));
  const next = Math.max(0, ...nums) + 1;
  return `EMP-${String(next).padStart(3, "0")}`;
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
function Sidebar({ active }) {
  const items = [
    { icon: LayoutGrid, label: "Dashboard" },
    { icon: Package, label: "Products" },
    { icon: Tag, label: "Categories" },
    { icon: Boxes, label: "Inventory", badge: 4 },
    { icon: CreditCard, label: "Billing & Payment" },
    { icon: FileClock, label: "Bill History" },
    { icon: Users, label: "User Management" },
    { icon: BarChart3, label: "Reports" },
  ];
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200 h-full shrink-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
          ET
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-800">EGOTECH</p>
          <p className="text-sm font-semibold text-blue-600 -mt-0.5">WORLD</p>
        </div>
      </div>

      <p className="px-5 pt-5 pb-2 text-[11px] font-medium tracking-wide text-slate-400">
        MAIN MENU
      </p>
      <nav className="flex-1 px-3 space-y-0.5">
        {items.map(({ icon: Icon, label, badge }) => {
          const isActive = label === active;
          return (
            <button
              key={label}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                {label}
              </span>
              {badge ? (
                <span className="text-[11px] bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">
            AD
          </div>
          <div className="leading-tight text-sm">
            <p className="font-medium text-slate-800">Administrator</p>
            <p className="text-xs text-slate-400">Admin · My Profile</p>
          </div>
          <Bell size={14} className="ml-auto text-rose-500" />
        </div>
        <button className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-sm text-slate-500 hover:bg-slate-50 rounded-lg">
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );
}

function Topbar({ crumb, page }) {
  return (
    <div className="flex items-center justify-between px-6 h-14 border-b border-slate-100 bg-white">
      <p className="text-xs text-slate-400">
        {crumb} <span className="text-slate-300">/</span>{" "}
        <span className="text-slate-600 font-medium">{page}</span>
      </p>
      <p className="text-xs text-slate-400">Wednesday, 13 August 2026</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status pill
// ---------------------------------------------------------------------------
function StatusDot({ status }) {
  const active = status === "Active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
        active ? "text-emerald-600" : "text-rose-500"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"}`} />
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Create / Edit User Modal
// ---------------------------------------------------------------------------
function UserModal({ existingUsers, editingUser, onClose, onSave }) {
  const isEdit = !!editingUser;
  const [form, setForm] = useState(
    editingUser || {
      id: genEmpId(existingUsers),
      name: "",
      email: "",
      phone: "",
      role: "Cashier",
      branch: BRANCHES[0],
      status: "Active",
    }
  );
  const [password, setPassword] = useState(genPassword());
  const [showPw, setShowPw] = useState(false);
  const [requireChange, setRequireChange] = useState(true);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCopy = () => {
    navigator.clipboard?.writeText(password).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ ...form, lastLogin: isEdit ? form.lastLogin : "Never logged in" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus size={17} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                {isEdit ? "Edit User" : "Create New User"}
              </p>
              <p className="text-xs text-slate-400">
                {isEdit ? `Editing ${form.id}` : "Employee ID will be auto-assigned"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="bg-blue-50 rounded-lg px-4 py-2.5 flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wide text-blue-700">
              {isEdit ? "EMPLOYEE ID" : "AUTO-GENERATED EMPLOYEE ID"}
            </span>
            <span className="text-sm font-semibold text-blue-700">{form.id}</span>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500">FULL NAME *</label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Kavindu Perera"
              className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${
                errors.name ? "border-rose-400" : "border-slate-200"
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500">EMAIL ADDRESS *</label>
              <input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="name@egotechworld.com"
                className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${
                  errors.email ? "border-rose-400" : "border-slate-200"
                }`}
              />
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500">PHONE NUMBER</label>
              <input
                value={form.phone || ""}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+94 77 000 0000"
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500">ROLE *</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
                    form.role === r
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={form.role === r}
                    onChange={() => update("role", r)}
                    className="accent-blue-600"
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500">BRANCH / LOCATION</label>
            <select
              value={form.branch}
              onChange={(e) => update("branch", e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
            >
              {BRANCHES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>

          {!isEdit && (
            <div>
              <label className="text-[11px] font-medium text-slate-500">TEMPORARY PASSWORD</label>
              <div className="mt-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    readOnly
                    type={showPw ? "text" : "password"}
                    value={password}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-9 text-sm bg-slate-50 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-2 text-slate-600 hover:bg-slate-50"
                >
                  <Copy size={13} /> {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => setPassword(genPassword())}
                  className="flex items-center gap-1 text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-2 text-slate-600 hover:bg-slate-50"
                >
                  <RefreshCw size={13} /> New
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Share this password securely with the employee.
              </p>

              <label className="flex items-start gap-2 mt-3 bg-slate-50 rounded-lg px-3 py-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireChange}
                  onChange={(e) => setRequireChange(e.target.checked)}
                  className="mt-0.5 accent-blue-600"
                />
                <span className="text-xs">
                  <span className="font-medium text-slate-700">
                    Require Password Change on First Login
                  </span>
                  <br />
                  <span className="text-slate-400">
                    The user must set a new password before accessing the system.
                  </span>
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <UserPlus size={15} /> {isEdit ? "Save Changes" : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// User Management page
// ---------------------------------------------------------------------------
function UserManagementPage({ onOpenProfile }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All Roles" || u.role === roleFilter;
    const matchesStatus = statusFilter === "All Status" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeCount = users.filter((u) => u.status === "Active").length;
  const inactiveCount = users.length - activeCount;

  const handleSave = (user) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      return exists ? prev.map((u) => (u.id === user.id ? user : u)) : [...prev, user];
    });
    setModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
            <Users size={16} className="text-slate-400" />
            <div>
              <p className="text-lg font-semibold text-slate-800 leading-none">{users.length}</p>
              <p className="text-[11px] text-slate-400">Total Users</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <div>
              <p className="text-lg font-semibold text-slate-800 leading-none">{activeCount}</p>
              <p className="text-[11px] text-slate-400">Active</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <div>
              <p className="text-lg font-semibold text-slate-800 leading-none">{inactiveCount}</p>
              <p className="text-[11px] text-slate-400">Inactive</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <UserPlus size={15} /> Add New User
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, Employee ID, or email..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none"
          >
            <option>All Roles</option>
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <span className="text-xs text-slate-400 ml-auto">
            {filtered.length} of {users.length} users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] text-slate-400 border-b border-slate-100">
                <th className="px-5 py-3 font-medium">EMPLOYEE ID</th>
                <th className="px-5 py-3 font-medium">NAME</th>
                <th className="px-5 py-3 font-medium">ROLE</th>
                <th className="px-5 py-3 font-medium">BRANCH / COUNTER</th>
                <th className="px-5 py-3 font-medium">STATUS</th>
                <th className="px-5 py-3 font-medium">LAST LOGIN</th>
                <th className="px-5 py-3 font-medium text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-5 py-3 text-slate-400">{u.id}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => onOpenProfile(u)}
                        className="w-7 h-7 rounded-full bg-slate-700 text-white text-[11px] font-semibold flex items-center justify-center shrink-0"
                        title="View profile"
                      >
                        {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </button>
                      <div className="leading-tight">
                        <button
                          onClick={() => onOpenProfile(u)}
                          className="font-medium text-slate-800 hover:text-blue-600 text-left"
                        >
                          {u.name}
                        </button>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleStyles[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{u.branch}</td>
                  <td className="px-5 py-3">
                    <StatusDot status={u.status} />
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{u.lastLogin}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 hover:bg-slate-50"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 text-sm py-10">
                    No users match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <UserModal
          existingUsers={users}
          editingUser={editingUser}
          onClose={() => {
            setModalOpen(false);
            setEditingUser(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile page
// ---------------------------------------------------------------------------
function ProfilePage({ user, onBack }) {
  const [form, setForm] = useState(user);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [saved, setSaved] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={onBack} className="text-xs text-blue-600 font-medium mb-4">
        ← Back to User Management
      </button>

      <h2 className="text-lg font-semibold text-slate-800">My Profile</h2>
      <p className="text-sm text-slate-400 mb-5">
        Manage your account information and security settings
      </p>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-5">
        <div className="h-16 bg-gradient-to-r from-blue-600 to-blue-500" />
        <div className="px-6 -mt-8 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-700 text-white flex items-center justify-center text-lg font-semibold ring-4 ring-white">
            {form.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <p className="mt-2 font-semibold text-slate-800">{form.name}</p>
          <p className="text-xs text-slate-400">
            {form.role} · {form.branch}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <div>
              <label className="text-[11px] font-medium text-slate-500">EMPLOYEE ID</label>
              <input
                readOnly
                value={form.id}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500">EMAIL ADDRESS</label>
              <input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500">FULL NAME</label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500">PHONE NUMBER</label>
              <input
                value={form.phone || ""}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+94 77 123 4567"
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500">ROLE</label>
              <select
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500">BRANCH / LOCATION</label>
              <select
                value={form.branch}
                onChange={(e) => update("branch", e.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white outline-none"
              >
                {BRANCHES.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 1500);
            }}
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg"
          >
            {saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={15} className="text-slate-500" />
          <p className="font-semibold text-slate-800 text-sm">Change Password</p>
        </div>
        <p className="text-xs text-slate-400 mb-4">Use a strong password with at least 8 characters</p>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-medium text-slate-500">CURRENT PASSWORD</label>
            <input
              type="password"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              placeholder="Enter current password"
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500">NEW PASSWORD</label>
              <input
                type="password"
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                placeholder="Min. 8 characters"
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500">CONFIRM NEW PASSWORD</label>
              <input
                type="password"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat new password"
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        <button className="mt-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg">
          Update Password
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login page
// ---------------------------------------------------------------------------
function LoginPage({ onLogin }) {
  const [showPw, setShowPw] = useState(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!id.trim() || !password.trim()) {
      setError("Enter your employee ID and password to continue.");
      return;
    }
    setError("");
    onLogin();
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-blue-700 to-blue-900 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-9 h-9 rounded-lg bg-white/15 text-white flex items-center justify-center text-xs font-bold mb-3">
        ET
      </div>
      <p className="text-white font-semibold">EGOTECH WORLD</p>
      <p className="text-blue-200 text-xs mb-8">Supermart POS System</p>

      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6">
        <p className="font-semibold text-slate-800">Welcome back</p>
        <p className="text-xs text-slate-400 mb-5">Sign in to your account to continue</p>

        <label className="text-[11px] font-medium text-slate-500">USERNAME / EMPLOYEE ID</label>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="e.g. EMP-001 or admin"
          className="mt-1 mb-3 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
        />

        <label className="text-[11px] font-medium text-slate-500">PASSWORD</label>
        <div className="relative mt-1 mb-1">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-9 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {error && <p className="text-xs text-rose-500 mb-2">{error}</p>}

        <label className="flex items-center gap-2 text-xs text-slate-500 mt-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="accent-blue-600"
          />
          Remember this device
        </label>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg"
        >
          Log In
        </button>

        <p className="text-center text-[11px] text-slate-400 mt-3">
          Demo: any Employee ID · password{" "}
          <span className="font-mono text-slate-500">admin123</span>
        </p>
      </div>

      <p className="text-blue-200/70 text-[11px] mt-8">
        © 2026 EgoTechWorld (Pvt) Ltd. All rights reserved.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------
export default function AuthUserManagement() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [view, setView] = useState("list"); // "list" | "profile"
  const [profileUser, setProfileUser] = useState(null);

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="h-full w-full bg-slate-50 flex">
      <Sidebar active="User Management" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar crumb="EGOTECH WORLD" page={view === "profile" ? "My Profile" : "User Management"} />
        <div className="flex-1 overflow-y-auto">
          {view === "profile" && profileUser ? (
            <ProfilePage user={profileUser} onBack={() => setView("list")} />
          ) : (
            <UserManagementPage
              onOpenProfile={(u) => {
                setProfileUser(u);
                setView("profile");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
