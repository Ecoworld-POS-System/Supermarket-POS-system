import React, { useState } from "react";
import {
  Users,
  Search,
  UserPlus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Building,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ROLES, ROLE_STYLES } from "../../data/mockData";
import UserModal from "./UserModal";

function StatusDot({ status }) {
  const active = status === "Active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"}`} />
      {status}
    </span>
  );
}

export default function UserManagementPage({ onOpenProfile }) {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus } = useApp();
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

  const handleSaveUser = (userData) => {
    if (editingUser) {
      updateUser(userData);
    } else {
      addUser(userData);
    }
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (userId, userName) => {
    if (window.confirm(`Are you sure you want to remove employee ${userName} (${userId})?`)) {
      deleteUser(userId);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Staff & User Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage cashier terminals, store managers, roles, and branch staff permissions
          </p>
        </div>

        {/* Counter cards */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={16} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 leading-none">{users.length}</p>
              <p className="text-[11px] font-medium text-slate-400">Total Staff</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ml-1" />
            <div>
              <p className="text-base font-bold text-emerald-700 leading-none">{activeCount}</p>
              <p className="text-[11px] font-medium text-slate-400">Active</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-1" />
            <div>
              <p className="text-base font-bold text-rose-700 leading-none">{inactiveCount}</p>
              <p className="text-[11px] font-medium text-slate-400">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID or email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option>All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          {/* New User Button */}
          <button
            onClick={() => {
              setEditingUser(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all ml-auto md:ml-0"
          >
            <UserPlus size={15} />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">System Role</th>
                <th className="px-5 py-3.5">Branch Location</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Activity</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => {
                const initials = u.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onOpenProfile(u)}
                          className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-semibold flex items-center justify-center shrink-0 hover:ring-2 hover:ring-blue-500 transition-all"
                          title="View user profile"
                        >
                          {initials}
                        </button>
                        <div className="min-w-0">
                          <button
                            onClick={() => onOpenProfile(u)}
                            className="font-bold text-slate-800 hover:text-blue-600 text-left truncate block"
                          >
                            {u.name}
                          </button>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="font-mono text-slate-500">{u.id}</span>
                            <span>•</span>
                            <span className="truncate">{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ROLE_STYLES[u.role] || "bg-slate-100 text-slate-700"}`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Building size={13} className="text-slate-400" />
                        <span>{u.branch}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusDot status={u.status} />
                    </td>

                    <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                      {u.lastLogin}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          title="Edit user details"
                        >
                          <Pencil size={12} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`inline-flex items-center p-1.5 rounded-lg border text-xs transition-colors ${
                            u.status === "Active"
                              ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={u.status === "Active" ? "Deactivate User" : "Activate User"}
                        >
                          {u.status === "Active" ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        </button>

                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="inline-flex items-center p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 text-sm py-12">
                    <Users size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">No staff members found</p>
                    <p className="text-xs text-slate-400">Try adjusting your keyword search or role filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <UserModal
          existingUsers={users}
          editingUser={editingUser}
          onClose={() => {
            setModalOpen(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}
