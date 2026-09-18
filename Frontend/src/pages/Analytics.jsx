import React, { useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import DateRangeSelector from '../components/Analytics/DateRangeSelector';
import RevenueTrendChart from '../components/Analytics/RevenueTrendChart';
import PaymentMethodChart from '../components/Analytics/PaymentMethodChart';
import TopProducts from '../components/Analytics/TopProducts';
import MonthlyRevenueTable from '../components/Analytics/MonthlyRevenueTable';

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState('Sales Analytics');
    const [dateRange, setDateRange] = useState('This Month');

    return (
        <AppLayout activeMenu="Reports & Analytics" breadcrumb={['EGOTECH WORLD', 'Reports & Analytics']}>
            <div className="content-view">
                <div className="view-header">
                    <div>
                        <h1 className="page-title-main">Reports & Analytics</h1>
                        <p className="header-summary-subtitle">Performance insights across all outlets</p>
                    </div>
                    <DateRangeSelector selectedRange={dateRange} onChange={setDateRange} />
                </div>

                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-soft)', marginBottom: '24px', gap: '24px' }}>
                    {['Overview & Metrics', 'Sales Analytics'].map((tab) => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                paddingBottom: '12px',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                color: activeTab === tab ? 'var(--primary)' : '#64748B',
                                borderBottom: activeTab === tab ? '2px solid var(--primary)' : 'none',
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                {activeTab === 'Sales Analytics' && (
                    <>
                        <RevenueTrendChart />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <TopProducts />
                            <PaymentMethodChart />
                        </div>
                        <MonthlyRevenueTable />
                    </>
                )}

                {activeTab === 'Overview & Metrics' && (
                    <div className="table-card" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                        <h3>Overview & High-Level Metrics View</h3>
                        <p style={{ marginTop: '8px' }}>Consolidated high-level metrics view for {dateRange}.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}