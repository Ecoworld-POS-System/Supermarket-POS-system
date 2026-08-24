import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

export default function BillSummaryCards({ metrics }) {
    const cards = [
        { title: 'Total Revenue', value: formatCurrency(metrics?.totalRevenue || 63919), subtitle: 'From completed bills', color: 'none' },
        { title: 'Completed', value: `${metrics?.completedCount || 10} Transactions`, subtitle: '', color: '#10B981' },
        { title: 'Pending', value: `${metrics?.pendingCount || 2} Awaiting confirmation`, subtitle: '', color: '#F59E0B' },
        { title: 'Cancelled / Refunded', value: `${metrics?.cancelledCount || 3} Voided transactions`, subtitle: '', color: '#EF4444' },
        { title: 'Loyalty Points Issued', value: `${metrics?.loyaltyPoints || 1240} Pts`, subtitle: '', color: '#6366F1' },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    className="table-card"
                    style={{
                        padding: '16px',
                        borderLeft: card.color !== 'none' ? `4px solid ${card.color}` : undefined
                    }}
                >
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{card.title}</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', margin: '4px 0' }}>
                        {card.value}
                    </div>
                    {card.subtitle && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{card.subtitle}</span>}
                </div>
            ))}
        </div>
    );
}