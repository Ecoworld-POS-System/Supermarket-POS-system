import React from 'react';
import {
  LayoutDashboard,
  Package,
  Tag,
  Warehouse,
  CreditCard,
  History,
  Users,
  BarChart2,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard',         icon: LayoutDashboard, badge: null },
  { key: 'products',  label: 'Products',           icon: Package,         badge: null },
  { key: 'categories',label: 'Categories',         icon: Tag,             badge: null },
  { key: 'inventory', label: 'Inventory',          icon: Warehouse,       badge: 4    },
  { key: 'billing',   label: 'Billing & Payment',  icon: CreditCard,      badge: null },
  { key: 'history',   label: 'Bill History',       icon: History,         badge: null },
  { key: 'users',     label: 'User Management',    icon: Users,           badge: null },
  { key: 'reports',   label: 'Reports & Analytics',icon: BarChart2,       badge: null },
];

/**
 * Sidebar — navigation component.
 *
 * Props:
 *   activePage  {string}  – current page key ('billing', 'history', 'reports', …)
 *   onNavigate  {fn}      – called with the page key when a nav item is clicked
 */
export default function Sidebar({ activePage = 'billing', onNavigate = () => {} }) {
  return (
    <aside className="h-full flex flex-col bg-white border-r border-gray-200 select-none">

      {/* ── Brand ──────────────────────────────────── */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <div className="w-9 h-9 text-white font-bold flex items-center justify-center rounded-lg shadow-sm"
          style={{ backgroundColor: '#6B9CD2' }}>
          ET
        </div>
        <div>
          <span className="block font-bold text-gray-900 text-sm leading-tight">EGOTECH</span>
          <span className="block text-xs text-gray-500 font-medium tracking-wide">WORLD</span>
        </div>
      </div>

      {/* ── Nav items ─────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Main navigation">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2 pt-1">
          MAIN MENU
        </p>
        <ul className="space-y-0.5" role="list">
          {menuItems.map(({ key, label, icon: Icon, badge }) => {
            const isActive = activePage === key;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onNavigate(key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  style={isActive ? { backgroundColor: '#6B9CD2' } : { backgroundColor: '#ffffff' }}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {badge !== null && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive ? 'bg-white' : 'bg-orange-500 text-white'
                      }`}
                        style={isActive ? { color: '#6B9CD2' } : {}}>
                        {badge}
                      </span>
                    )}
                    {isActive && <ChevronRight size={14} className="text-white opacity-80" />}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Profile / Logout ──────────────────────── */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-sm"
            style={{ backgroundColor: '#6B9CD2' }}>
            A
          </div>
          <div>
            <span className="block text-sm font-bold text-gray-900 leading-tight">Administrator</span>
            <span className="block text-xs font-medium cursor-pointer hover:underline"
              style={{ color: '#6B9CD2' }}>
              Admin · My Profile
            </span>
          </div>
        </div>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => console.log('Logout')}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  CreditCard,
  History,
  Users,
  BarChart3,
  Bell,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const showNotice = (moduleName) => (e) => {
    e.preventDefault();
    alert(`${moduleName} is handled by another team member.`);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-badge">ET</div>
        <div className="brand-text">
          EGOTECH<br />WORLD
        </div>
      </div>

      <div className="sidebar-menu-label">MAIN MENU</div>

      <ul className="sidebar-nav">
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={showNotice('Dashboard')}
          >
            <div className="sidebar-link-left">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/products"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <div className="sidebar-link-left">
              <Package size={18} />
              <span>Products</span>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/categories"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <div className="sidebar-link-left">
              <FolderTree size={18} />
              <span>Categories</span>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/inventory"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={showNotice('Inventory')}
          >
            <div className="sidebar-link-left">
              <Boxes size={18} />
              <span>Inventory</span>
            </div>
            <span className="badge-count">4</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/billing"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={showNotice('Billing & Payment')}
          >
            <div className="sidebar-link-left">
              <CreditCard size={18} />
              <span>Billing & Payment</span>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/history"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={showNotice('Bill History')}
          >
            <div className="sidebar-link-left">
              <History size={18} />
              <span>Bill History</span>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/users"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={showNotice('User Management')}
          >
            <div className="sidebar-link-left">
              <Users size={18} />
              <span>User Management</span>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/reports"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={showNotice('Reports')}
          >
            <div className="sidebar-link-left">
              <BarChart3 size={18} />
              <span>Reports</span>
            </div>
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="admin-card">
          <div className="admin-avatar">AD</div>
          <div className="admin-info">
            <div className="admin-role">Administrator</div>
            <a href="#profile" className="admin-name" onClick={(e) => { e.preventDefault(); alert("Authentication & Profile is handled by another team member."); }}>
              Admin - My Profile
            </a>
          </div>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={18} color="#F59E0B" />
            <span style={{ position: 'absolute', top: 0, right: 0, width: 6, height: 6, backgroundColor: '#EF4444', borderRadius: '50%' }}></span>
          </div>
        </div>

        <a href="#logout" className="logout-btn" onClick={(e) => { e.preventDefault(); alert("Logout functionality handled by Authentication module."); }}>
          <LogOut size={16} />
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
