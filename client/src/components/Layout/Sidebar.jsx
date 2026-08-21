import React from 'react';

const navItems = [
    'Dashboard',
    'Products',
    'Categories',
    'Inventory',
    'Billing & Payment',
    'Bill History',
    'User Management',
    'Reports & Analytics',
];

export default function Sidebar({ activeMenu = 'Bill History' }) {
    return (
        <aside className="sidebar">

            {/* Brand */}
            <div className="sidebar-header">
                <div className="brand-badge">ET</div>

                <div className="brand-text">
                    EGOTECH WORLD
                </div>
            </div>

            {/* Main Menu Label */}
            <div className="sidebar-menu-label">
                Main Menu
            </div>

            {/* Navigation */}
            <nav className="sidebar-navigation">
                <ul className="sidebar-nav">
                    {navItems.map((item) => (
                        <li key={item}>
                            <a
                                href={`#${item
                                    .toLowerCase()
                                    .replace(/\s+/g, '-')}`}
                                className={`sidebar-link ${activeMenu === item ? 'active' : ''
                                    }`}
                            >
                                <div className="sidebar-link-left">
                                    <span>{item}</span>
                                </div>

                                {/* Inventory Alert */}
                                {item === 'Inventory' && (
                                    <span className="badge-count">
                                        4
                                    </span>
                                )}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Sidebar Bottom */}
            <div className="sidebar-footer">

                {/* Admin Profile */}
                <div className="admin-card">
                    <div className="admin-avatar">
                        AD
                    </div>

                    <div className="admin-info">
                        <div className="admin-name">
                            Administrator
                        </div>

                        <div className="admin-role">
                            Admin Profile
                        </div>
                    </div>
                </div>

                {/* Logout */}
                <button
                    type="button"
                    className="logout-btn"
                >
                    Logout
                </button>

            </div>
        </aside>
    );
}