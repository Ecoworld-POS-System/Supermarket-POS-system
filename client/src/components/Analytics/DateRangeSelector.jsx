import React from 'react';

export default function DateRangeSelector({ selectedRange, onChange }) {
    const ranges = ['Today', 'This Week', 'This Month', 'Last 3 Months', 'Last 6 Months'];

    return (
        <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid var(--border-soft)', padding: '4px', borderRadius: '8px', gap: '4px' }}>
            {ranges.map((range) => (
                <button
                    key={range}
                    onClick={() => onChange(range)}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: selectedRange === range ? 'var(--primary)' : 'transparent',
                        color: selectedRange === range ? '#FFFFFF' : '#64748B',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                    }}
                >
                    {range}
                </button>
            ))}
        </div>
    );
}