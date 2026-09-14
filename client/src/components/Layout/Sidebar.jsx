import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Archive,
  CreditCard,
  Receipt,
  Users,
  BarChart3,
  Bell,
  LogOut,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', hash: 'dashboard', icon: LayoutDashboard },
  { name: 'Products', hash: 'products', icon: Package },
  { name: 'Categories', hash: 'categories', icon: Layers },
  { name: 'Inventory', hash: 'inventory', icon: Archive, badge: 4 },
  { name: 'Billing & Payment', hash: 'billing-&-payment', icon: CreditCard },
  { name: 'Bill History', hash: 'bill-history', icon: Receipt },
  { name: 'User Management', hash: 'user-management', icon: Users },
  { name: 'Reports', hash: 'reports-&-analytics', icon: BarChart3, matchActive: ['Reports', 'Reports & Analytics'] },
];

export default function Sidebar({ activeMenu = 'Inventory' }) {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-badge">ET</div>
        <div className="brand-text">
          EGOTECH<br />WORLD
        </div>
      </div>

      {/* Main Menu Label */}
      <div className="sidebar-menu-label">Main Menu</div>

      {/* Navigation Links */}
      <nav className="sidebar-navigation">
        <ul className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeMenu === item.name ||
              (item.matchActive && item.matchActive.includes(activeMenu));

            return (
              <li key={item.name}>
                <a
                  href={`#${item.hash}`}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <div className="sidebar-link-left">
                    <Icon size={18} strokeWidth={2} />
                    <span>{item.name}</span>
                  </div>

                  {/* Inventory Badge */}
                  {item.badge && (
                    <span className="badge-count">{item.badge}</span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        {/* Admin Profile */}
        <div className="admin-card">
          <div className="admin-avatar">AD</div>
          <div className="admin-info">
            <div className="admin-name" style={{ color: '#1E293B', fontSize: '0.75rem', fontWeight: 700 }}>
              Administrator
            </div>
            <div className="admin-role" style={{ color: '#2563EB', fontSize: '0.6875rem', fontWeight: 600 }}>
              Admin • My Profile
            </div>
          </div>
          <div style={{ position: 'relative', cursor: 'pointer', padding: '4px' }}>
            <Bell size={16} color="#64748B" />
            <span
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 6,
                height: 6,
                backgroundColor: '#EF4444',
                borderRadius: '50%',
              }}
            />
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          className="logout-btn"
          onClick={() => alert('Logout clicked')}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}