import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="app-navbar">
      <div className="navbar-container">
        <NavLink to="/products" className="brand-logo">
          [Logo] POS System
        </NavLink>
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); alert("Dashboard is handled by another team member module."); }}
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/products" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Products
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/categories" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Categories
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/billing" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); alert("Billing & Payment is handled by another team member module."); }}
              >
                Billing
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/inventory" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); alert("Inventory & Stock Management is handled by another team member module."); }}
              >
                Inventory
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
