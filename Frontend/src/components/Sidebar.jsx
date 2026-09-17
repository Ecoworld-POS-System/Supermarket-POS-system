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


/**
 * Sidebar — EGOTECH WORLD navigation rail.
 *
 * Props:
 *   activePage  {string}   – key of the currently active menu item
 *   onNavigate  {function} – called with the menu key when user clicks an item
 */
export default function Sidebar({ activePage = 'billing', onNavigate = () => {} }) {
  const menuItems = [
    { key: 'dashboard',  label: 'Dashboard',         icon: LayoutDashboard, badge: null },
    { key: 'products',   label: 'Products',           icon: Package,         badge: null },
    { key: 'categories', label: 'Categories',         icon: Tag,             badge: null },
    { key: 'inventory',  label: 'Inventory',          icon: Warehouse,       badge: 4    },
    { key: 'billing',    label: 'Billing & Payment',  icon: CreditCard,      badge: null },
    { key: 'history',    label: 'Bill History',       icon: History,         badge: null },
    { key: 'users',      label: 'User Management',    icon: Users,           badge: null },
    { key: 'reports',    label: 'Reports',            icon: BarChart2,       badge: null },
  ];

  return (
    <aside className="sidebar">
      {/* ── Brand Header ─────────────────────────── */}
      <div className="sidebar-brand">
        {/* Pastel-blue monogram badge */}
        <div className="sidebar-brand-icon" aria-hidden="true">
          ET
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">EGOTECH</span>
          <span className="sidebar-brand-sub">WORLD</span>
        </div>
      </div>

      {/* ── Navigation Menu ──────────────────────── */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        <p className="sidebar-section-label">MAIN MENU</p>
        <ul className="sidebar-menu" role="list">
          {menuItems.map(({ key, label, icon: Icon, badge }) => {
            const isActive = activePage === key;
            return (
              <li key={key}>
                <button
                  id={`sidebar-nav-${key}`}
                  className={`sidebar-menu-item${isActive ? ' active' : ''}`}
                  onClick={() => onNavigate(key)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="sidebar-menu-icon" />
                  <span className="sidebar-menu-label">{label}</span>

                  {/* Notification badge */}
                  {badge !== null && (
                    <span className={`sidebar-badge${isActive ? ' active' : ''}`} aria-label={`${badge} notifications`}>
                      {badge}
                    </span>
                  )}

                  {/* Active chevron indicator */}
                  {isActive && <ChevronRight size={14} className="sidebar-chevron" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Bottom Profile Area ───────────────────── */}
      <div className="sidebar-footer">
        <div className="sidebar-profile">
          <div className="sidebar-avatar" aria-hidden="true">A</div>
          <div className="sidebar-profile-info">
            <span className="sidebar-profile-role">Administrator</span>
            <span className="sidebar-profile-link">Admin · My Profile</span>
          </div>
        </div>

        <button id="sidebar-logout-btn" className="sidebar-logout-btn" aria-label="Logout">
          <LogOut size={16} />
          <span>Logout</span>
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
