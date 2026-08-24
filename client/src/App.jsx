import React, { useState, useEffect } from 'react';
import BillHistory from './pages/BillHistory';
import Analytics from './pages/Analytics';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'reports-&-analytics' || hash === 'analytics') return 'analytics';
    return 'bill-history';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'reports-&-analytics' || hash === 'analytics') {
        setCurrentPage('analytics');
      } else {
        setCurrentPage('bill-history');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="App">
      {currentPage === 'analytics' ? <Analytics /> : <BillHistory />}
    </div>
  );
}

export default App;