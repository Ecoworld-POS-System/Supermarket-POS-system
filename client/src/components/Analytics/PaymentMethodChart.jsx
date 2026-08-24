import React, { useState } from 'react';

const DEFAULT_DATA = [
    {
        id: 'cash',
        name: 'Cash',
        count: 976,
        percentage: 58,
        color: '#10B981', // Emerald / Teal Green
    },
    {
        id: 'card',
        name: 'Card',
        count: 404,
        percentage: 24,
        color: '#2563EB', // Royal Blue
    },
    {
        id: 'voucher',
        name: 'Voucher',
        count: 202,
        percentage: 12,
        color: '#EAB308', // Amber Yellow
    },
    {
        id: 'points',
        name: 'Points',
        count: 100,
        percentage: 6,
        color: '#E11D48', // Coral / Rose Pink
    },
];

export default function PaymentMethodChart({ data = DEFAULT_DATA, title = "Payment Method Split", subtitle = "Transaction count • This Month" }) {
    const [hoveredId, setHoveredId] = useState(null);

    // Selected or default active item (defaults to highest / first item: Cash)
    const activeItem = data.find(item => item.id === hoveredId) || data[0];

    // SVG Donut calculation
    const size = 180;
    const strokeWidth = 24;
    const center = size / 2;
    const radius = center - strokeWidth / 2 - 4; // radius ~64
    const circumference = 2 * Math.PI * radius;

    // Calculate strokeDashoffsets for each slice
    let accumulatedPercentage = 0;
    const slices = data.map((item) => {
        const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
        const strokeDashoffset = -((accumulatedPercentage / 100) * circumference);
        accumulatedPercentage += item.percentage;

        return {
            ...item,
            strokeDasharray,
            strokeDashoffset,
        };
    });

    return (
        <div className="table-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            {/* Header */}
            <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                    {title}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    {subtitle}
                </span>
            </div>

            {/* Chart & Legend Content */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flex: 1, padding: '4px 0' }}>
                {/* Donut Chart */}
                <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg
                        width={size}
                        height={size}
                        viewBox={`0 0 ${size} ${size}`}
                        style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
                    >
                        {slices.map((slice) => {
                            const isHovered = hoveredId === slice.id;
                            const isCurrentActive = activeItem.id === slice.id;

                            return (
                                <circle
                                    key={slice.id}
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    fill="none"
                                    stroke={slice.color}
                                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                                    strokeDasharray={slice.strokeDasharray}
                                    strokeDashoffset={slice.strokeDashoffset}
                                    strokeLinecap="butt"
                                    style={{
                                        transition: 'all 0.25s ease',
                                        cursor: 'pointer',
                                        opacity: hoveredId && !isHovered ? 0.65 : 1,
                                    }}
                                    onMouseEnter={() => setHoveredId(slice.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                />
                            );
                        })}
                    </svg>

                    {/* Centered Percentage & Label */}
                    <div
                        style={{
                            position: 'absolute',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                            textAlign: 'center',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '1.625rem',
                                fontWeight: 800,
                                color: '#0F172A',
                                lineHeight: 1.1,
                                letterSpacing: '-0.02em',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {activeItem.percentage}%
                        </span>
                        <span
                            style={{
                                fontSize: '0.8125rem',
                                color: '#64748B',
                                fontWeight: 500,
                                marginTop: '2px',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {activeItem.name}
                        </span>
                    </div>
                </div>

                {/* Breakdown Legend List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minWidth: '150px' }}>
                    {data.map((item) => {
                        const isHovered = hoveredId === item.id;

                        return (
                            <div
                                key={item.id}
                                onMouseEnter={() => setHoveredId(item.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: isHovered ? '#F8FAFC' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {/* Dot and Name */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: item.color,
                                            flexShrink: 0,
                                            transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                                            transition: 'transform 0.15s ease',
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontSize: '0.8125rem',
                                            fontWeight: isHovered ? 600 : 500,
                                            color: isHovered ? '#0F172A' : '#64748B',
                                            transition: 'color 0.15s ease',
                                        }}
                                    >
                                        {item.name}
                                    </span>
                                </div>

                                {/* Transaction Count & Percentage */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <span
                                        style={{
                                            fontSize: '0.8125rem',
                                            color: '#94A3B8',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {item.count} tx
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '0.875rem',
                                            fontWeight: 700,
                                            color: '#0F172A',
                                            minWidth: '32px',
                                            textAlign: 'right',
                                        }}
                                    >
                                        {item.percentage}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}