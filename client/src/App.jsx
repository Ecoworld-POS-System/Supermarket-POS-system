import React, { useState, useEffect } from 'react';
import BillHistory from './pages/BillHistory';
import Analytics from './pages/Analytics';
import Inventory from './pages/Inventory';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'reports-&-analytics' || hash === 'analytics' || hash === 'reports') return 'analytics';
    if (hash === 'inventory') return 'inventory';
    return 'inventory'; // Default to inventory or bill-history; setting inventory allows user to see it immediately!
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'reports-&-analytics' || hash === 'analytics' || hash === 'reports') {
        setCurrentPage('analytics');
      } else if (hash === 'inventory') {
        setCurrentPage('inventory');
      } else if (hash === 'bill-history') {
        setCurrentPage('bill-history');
      } else {
        setCurrentPage('inventory');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="App">
      {currentPage === 'analytics' ? (
        <Analytics />
      ) : currentPage === 'bill-history' ? (
        <BillHistory />
      ) : (
        <Inventory />
      )}
    </div>
  );
}

export default App;