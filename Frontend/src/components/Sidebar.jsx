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
