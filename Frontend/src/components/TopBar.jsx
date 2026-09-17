import React from 'react';

const TopBar = ({ urlPath = "/products", moduleTitle = "Product Management" }) => {
  return (
    <div className="browser-top-bar">
      <div className="browser-url-box">
        http://pos-system.local{urlPath}
      </div>
      <div className="browser-title">
        POS System - {moduleTitle}
      </div>
    </div>
  );
};

export default TopBar;
