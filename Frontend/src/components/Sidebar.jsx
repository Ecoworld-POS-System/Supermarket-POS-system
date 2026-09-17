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
