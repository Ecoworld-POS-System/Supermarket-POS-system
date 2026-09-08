import React, { useState } from "react";
import { ArrowLeft, Lock, CheckCircle2, Shield, Building, User } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ROLES, BRANCHES } from "../../data/mockData";

export default function ProfilePage({ user, onBack }) {
  const { updateUser, currentUser } = useApp();
  const targetUser = user || currentUser;

  const [form, setForm] = useState(targetUser);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const [pwMessage, setPwMessage] = useState({ text: "", type: "" });

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!pw.next || pw.next.length < 6) {
      setPwMessage({ text: "New password must be at least 6 characters.", type: "error" });
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwMessage({ text: "New passwords do not match.", type: "error" });
      return;
    }
    setPwMessage({ text: "Password updated successfully!", type: "success" });
    setPw({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwMessage({ text: "", type: "" }), 3000);
  };

  const initials = form.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
      >
        <ArrowLeft size={14} /> Back to Directory
      </button>

      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Staff Account Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage system identity, assigned permissions, and login credentials
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="h-20 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />
        <div className="px-6 -mt-10 pb-6">
          <div className="w-18 h-18 rounded-2xl bg-slate-800 text-white flex items-center justify-center text-xl font-bold ring-4 ring-white shadow-md">
            {initials}
          </div>

          <div className="mt-3 flex items-start justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{form.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span className="font-medium text-blue-600">{form.role}</span>
                <span>•</span>
                <span>{form.branch}</span>
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Member
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  EMPLOYEE ID
                </label>
                <input
                  readOnly
                  value={form.id}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm bg-slate-50 text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  PHONE NUMBER
                </label>
                <input
                  type="text"
                  value={form.phone || ""}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  SYSTEM ROLE
                </label>
                <select
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  ASSIGNED BRANCH
                </label>
                <select
                  value={form.branch}
                  onChange={(e) => update("branch", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              {saved && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 size={16} /> Changes saved successfully!
                </div>
              )}
              <button
                type="submit"
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs shadow-blue-500/20 transition-all"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Password Reset Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Lock size={16} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Security & Access Key</h3>
            <p className="text-xs text-slate-400">Update terminal password for POS authorization</p>
          </div>
        </div>

        {pwMessage.text && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              pwMessage.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-rose-50 border border-rose-200 text-rose-700"
            }`}
          >
            {pwMessage.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="mt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              CURRENT PASSWORD
            </label>
            <input
              type="password"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              placeholder="Enter current password"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                NEW PASSWORD
              </label>
              <input
                type="password"
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                placeholder="Minimum 6 characters"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                CONFIRM PASSWORD
              </label>
              <input
                type="password"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat new password"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
