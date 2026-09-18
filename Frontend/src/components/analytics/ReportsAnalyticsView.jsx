import { useState, useEffect, useCallback } from 'react';
import DateRangeSelector from './DateRangeSelector';
import RevenueTrendChart from './RevenueTrendChart';
import TopProduct from './TopProduct';
import PaymentMethodChart from './PaymentMethodChart';
import MonthlyRevenueTable from './MonthlyRevenueTable';
import {
  fetchMonthlyRevenue,
  fetchPaymentMethodStats,
  fetchRevenueTrends,
  fetchTopProducts,
  DEFAULT_SUPERMARKET_ANALYTICS,
} from '../../services/api';

export default function ReportsAnalyticsView() {
  const [dateRange, setDateRange]     = useState('month');
  const [customDates, setCustomDates] = useState({ start: '2026-02-01', end: '2026-08-31' });
  const [isLoading, setIsLoading]     = useState(false);
  const [currentDate]                 = useState(new Date());

  const [revenueData, setRevenueData]         = useState(DEFAULT_SUPERMARKET_ANALYTICS.monthlyRevenue);
  const [paymentData, setPaymentData]         = useState(DEFAULT_SUPERMARKET_ANALYTICS.paymentMethods);
  const [topProductsData, setTopProductsData] = useState(DEFAULT_SUPERMARKET_ANALYTICS.topProducts);
  const [outlets, setOutlets]                 = useState(DEFAULT_SUPERMARKET_ANALYTICS.outlets);

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const loadAnalytics = useCallback(async (range) => {
    setIsLoading(true);
    try {
      const [rev, pay, prod, trends] = await Promise.allSettled([
        fetchMonthlyRevenue(range),
        fetchPaymentMethodStats(range),
        fetchTopProducts(range, 5),
        fetchRevenueTrends(range),
      ]);
      if (rev.status    === 'fulfilled' && rev.value)             setRevenueData(rev.value);
      if (pay.status    === 'fulfilled' && pay.value)             setPaymentData(pay.value);
      if (prod.status   === 'fulfilled' && prod.value)            setTopProductsData(prod.value);
      if (trends.status === 'fulfilled' && trends.value?.outlets) setOutlets(trends.value.outlets);
      // Use trends.data for the line chart if revenue data is empty
      if (trends.status === 'fulfilled' && trends.value?.trends?.length > 0 && rev.value?.length === 0) {
        setRevenueData(trends.value.trends);
      }
    } catch { /* keep defaults */ }
    finally   { setIsLoading(false); }
  }, []);

  useEffect(() => { loadAnalytics(dateRange); }, [dateRange, loadAnalytics]);

  const handleRangeChange = (newRange, custom) => {
    setDateRange(newRange);
    if (custom) setCustomDates(custom);
  };

  return (
    <div className="flex-1 flex flex-col min-h-full bg-gray-50">

      {/* ── Breadcrumb header ──────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <span className="text-gray-700">EGOTECH WORLD</span>
          <span>/</span>
          <span style={{ color: '#6B9CD2' }} className="font-bold">Reports</span>
        </div>
        <div className="text-xs font-medium text-gray-500">{formattedDate}</div>
      </header>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-5">

        {/* Title + date range */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">Performance insights across all outlets</p>
          </div>
          <DateRangeSelector
            selectedRange={dateRange}
            onRangeChange={handleRangeChange}
            customDates={customDates}
          />
        </div>

        {/* ── Sales Analytics — single tab, always visible ─────── */}
        <div className="space-y-5">
          <RevenueTrendChart
            data={revenueData}
            outlets={outlets}
            subtitle="Feb – Aug 2026 • Monthly"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <TopProduct
                data={topProductsData}
                subtitle="Aug 2026 • All outlets combined"
                maxScale={600}
              />
            </div>
            <div className="lg:col-span-5">
              <PaymentMethodChart
                data={paymentData}
                subtitle="Cash vs Card • Aug 2026"
              />
            </div>
          </div>

          <MonthlyRevenueTable data={revenueData} isLoading={isLoading} />
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white px-6 py-4 text-xs text-gray-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
          <span className="font-semibold text-gray-600">EGOTECHWORLD (PVT) LTD</span>
          <span>© 2026 EgotechWorld (Pvt) Ltd. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <span className="hover:underline cursor-pointer">egotechworld.com</span>
            <span>|</span>
            <span>+94 74 312 6123</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
