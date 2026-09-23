import React, { useState } from "react";
import { X, UserPlus, Eye, EyeOff, Copy, RefreshCw, Check } from "lucide-react";
import { ROLES, BRANCHES, genPassword, genEmpId } from "../../data/mockData";
import ModalPortal from "../layout/ModalPortal";

export default function UserModal({ existingUsers, editingUser, onClose, onSave }) {
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

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleCopy = () => {
    navigator.clipboard?.writeText(password).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email address";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    await onSave({
      ...form,
      password: password || "admin123",
      lastLogin: isEdit ? form.lastLogin : "Never logged in",
    });
  };

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
        <div
          style={{ backgroundColor: "#ffffff" }}
          className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#4A80B4] border border-[#4A80B4]/20 flex items-center justify-center shadow-xs">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isEdit ? "Edit Staff Member" : "Create New Staff Account"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isEdit ? `Updating profile for ${form.id}` : "Employee ID automatically allocated"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Auto ID Display */}
              <div className="bg-blue-50/80 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-[#3B6D9E]">
                  {isEdit ? "ASSIGNED EMPLOYEE ID" : "AUTO-GENERATED EMPLOYEE ID"}
                </span>
                <span className="text-sm font-bold text-[#4A80B4] font-mono">{form.id}</span>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  FULL NAME *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Kavindu Perera"
                  className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4A80B4]/20 focus:border-[#4A80B4] transition-all bg-white ${
                    errors.name ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                  }`}
                  required
                />
                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="name@egotechworld.com"
                    className={`w-full border rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4A80B4]/20 focus:border-[#4A80B4] transition-all bg-white ${
                      errors.email ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                    }`}
                    required
                  />
                  {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    value={form.phone || ""}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+94 77 000 0000"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4A80B4]/20 focus:border-[#4A80B4] transition-all bg-white"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  SYSTEM ROLE *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2 border rounded-xl px-3 py-2 text-xs font-medium cursor-pointer transition-all ${
                        form.role === r
                          ? "border-[#4A80B4] bg-blue-50/80 text-[#3B6D9E] shadow-xs font-semibold"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        checked={form.role === r}
                        onChange={() => update("role", r)}
                        className="accent-[#4A80B4] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Branch Assignment */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  ASSIGNED BRANCH LOCATION
                </label>
                <select
                  value={form.branch}
                  onChange={(e) => update("branch", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4A80B4]/20 focus:border-[#4A80B4] bg-white cursor-pointer"
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status (for edit) */}
              {isEdit && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    ACCOUNT STATUS
                  </label>
                  <div className="flex gap-4">
                    {["Active", "Inactive"].map((s) => (
                      <label key={s} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          checked={form.status === s}
                          onChange={() => update("status", s)}
                          className="accent-[#4A80B4] cursor-pointer"
                        />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Temp Password Generator (for new users) */}
              {!isEdit && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    TEMPORARY ACCESS CREDENTIALS
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        readOnly
                        type={showPw ? "text" : "password"}
                        value={password}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 pr-10 text-sm font-mono bg-slate-50 text-slate-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPassword(genPassword())}
                      className="flex items-center gap-1 text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                    >
                      <RefreshCw size={14} />
                      <span>New</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Default temporary password generated for employee onboarding.
                  </p>

                  <label className="flex items-start gap-2.5 mt-3 bg-slate-50/80 border border-slate-100 rounded-xl p-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireChange}
                      onChange={(e) => setRequireChange(e.target.checked)}
                      className="mt-0.5 accent-[#4A80B4] cursor-pointer"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-700">Require Password Reset on First Login</p>
                      <p className="text-slate-400 text-[11px]">
                        The employee must establish a personalized passphrase before initial login access.
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-[#4A80B4] hover:bg-[#3B6D9E] text-white shadow-xs transition-all cursor-pointer active:scale-98"
              >
                <UserPlus size={15} />
                <span>{isEdit ? "Save Changes" : "Create User"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}