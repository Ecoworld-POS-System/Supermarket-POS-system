import React from 'react';

const Header = ({ currentModule = "Products" }) => {
  return (
    <header className="top-header">
      <div className="breadcrumb">
        <span>EGOTECH WORLD</span>
        <span>/</span>
        <span className="active-crumb">{currentModule}</span>
      </div>
      <div className="header-date">
        Wednesday, 13 August 2026
      </div>
    </header>
  );
};

export default Header;
