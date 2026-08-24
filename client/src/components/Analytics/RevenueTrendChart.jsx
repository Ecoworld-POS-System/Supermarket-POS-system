import React, { useState, useRef } from 'react';

const OUTLETS = [
    { id: 'Colombo', name: 'Colombo', color: '#2563EB' },
    { id: 'Kandy', name: 'Kandy', color: '#9333EA' },
    { id: 'Galle', name: 'Galle', color: '#10B981' },
    { id: 'Negombo', name: 'Negombo', color: '#F59E0B' },
    { id: 'Matara', name: 'Matara', color: '#EF4444' },
];

const MONTHS_DATA = [
    { month: 'Feb', fullName: 'Feb 2026', Colombo: 2841, Kandy: 1620, Galle: 980, Negombo: 740, Matara: 560, total: 'LKR 6.74M' },
    { month: 'Mar', fullName: 'Mar 2026', Colombo: 3120, Kandy: 1780, Galle: 1090, Negombo: 820, Matara: 630, total: 'LKR 7.44M' },
    { month: 'Apr', fullName: 'Apr 2026', Colombo: 2960, Kandy: 1640, Galle: 1010, Negombo: 760, Matara: 590, total: 'LKR 6.96M' },
    { month: 'May', fullName: 'May 2026', Colombo: 3380, Kandy: 1920, Galle: 1180, Negombo: 890, Matara: 670, total: 'LKR 8.04M' },
    { month: 'Jun', fullName: 'Jun 2026', Colombo: 3540, Kandy: 2010, Galle: 1250, Negombo: 940, Matara: 720, total: 'LKR 8.46M' },
    { month: 'Jul', fullName: 'Jul 2026', Colombo: 3720, Kandy: 2140, Galle: 1340, Negombo: 1010, Matara: 780, total: 'LKR 8.99M' },
    { month: 'Aug', fullName: 'Aug 2026', Colombo: 3847, Kandy: 2260, Galle: 1410, Negombo: 1080, Matara: 830, total: 'LKR 9.43M' },
];

// Helper to compute smooth cubic spline path
function getSmoothSplinePath(points) {
    if (!points || points.length < 2) return '';
    let path = `M ${points[0].x},${points[0].y}`;
    const tension = 0.22;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];

        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = p1.y + (p2.y - p0.y) * tension;
        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = p2.y - (p3.y - p1.y) * tension;

        path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return path;
}

export default function RevenueTrendChart() {
    const [activeOutlets, setActiveOutlets] = useState({
        Colombo: true,
        Kandy: true,
        Galle: true,
        Negombo: true,
        Matara: true,
    });

    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const chartContainerRef = useRef(null);

    const toggleOutlet = (outletId) => {
        setActiveOutlets(prev => ({
            ...prev,
            [outletId]: !prev[outletId]
        }));
    };

    // Chart Dimensions
    const svgWidth = 900;
    const svgHeight = 220;
    const padding = { top: 20, right: 30, bottom: 40, left: 30 };
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    // Y Axis scaling (0 to 4200k)
    const maxY = 4200;

    const getX = (index) => padding.left + (index / (MONTHS_DATA.length - 1)) * chartWidth;
    const getY = (value) => padding.top + (1 - value / maxY) * chartHeight;

    const handleMouseMove = (e) => {
        if (!chartContainerRef.current) return;
        const rect = chartContainerRef.current.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const relativeX = (clientX / rect.width) * svgWidth;

        // Find closest month index
        let closestIdx = 0;
        let minDiff = Infinity;
        MONTHS_DATA.forEach((_, idx) => {
            const diff = Math.abs(getX(idx) - relativeX);
            if (diff < minDiff) {
                minDiff = diff;
                closestIdx = idx;
            }
        });

        setHoveredIndex(closestIdx);
        setTooltipPos({
            x: (getX(closestIdx) / svgWidth) * rect.width,
            y: e.clientY - rect.top
        });
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
    };

    return (
        <div className="table-card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
            {/* Header section with title, subtitle and outlet legend dots */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Revenue Trends by Outlet</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Feb - Aug 2026 • Monthly</span>
                </div>

                {/* Outlet Legend with colored dots matching the 2nd image */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {OUTLETS.map((outlet) => {
                        const isActive = activeOutlets[outlet.id];
                        return (
                            <div
                                key={outlet.id}
                                onClick={() => toggleOutlet(outlet.id)}
                                title={`Click to toggle ${outlet.name}`}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.8125rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    color: isActive ? '#334155' : '#94A3B8',
                                    opacity: isActive ? 1 : 0.45,
                                    userSelect: 'none',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <span
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: outlet.color,
                                        display: 'inline-block'
                                    }}
                                />
                                <span style={{ textDecoration: isActive ? 'none' : 'line-through' }}>{outlet.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* SVG Chart Container */}
            <div
                ref={chartContainerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '240px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #F1F5F9',
                    padding: '8px 12px',
                    boxSizing: 'border-box',
                    cursor: 'crosshair',
                    overflow: 'hidden'
                }}
            >
                <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    style={{ width: '100%', height: '100%', overflow: 'visible' }}
                    preserveAspectRatio="none"
                >
                    {/* Subtle Horizontal Grid lines */}
                    {[800, 1600, 2400, 3200, 4000].map((val) => {
                        const y = getY(val);
                        return (
                            <line
                                key={val}
                                x1={padding.left}
                                y1={y}
                                x2={svgWidth - padding.right}
                                y2={y}
                                stroke="#EDF2F7"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                            />
                        );
                    })}

                    {/* Outlet Trend Curves */}
                    {OUTLETS.map((outlet) => {
                        if (!activeOutlets[outlet.id]) return null;

                        const points = MONTHS_DATA.map((item, idx) => ({
                            x: getX(idx),
                            y: getY(item[outlet.id]),
                        }));

                        const pathData = getSmoothSplinePath(points);

                        return (
                            <g key={outlet.id}>
                                <path
                                    d={pathData}
                                    fill="none"
                                    stroke={outlet.color}
                                    strokeWidth="3.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{
                                        transition: 'all 0.3s ease',
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.03))'
                                    }}
                                />

                                {/* Highlight dot at hovered month */}
                                {hoveredIndex !== null && (
                                    <circle
                                        cx={points[hoveredIndex].x}
                                        cy={points[hoveredIndex].y}
                                        r="5"
                                        fill="#FFFFFF"
                                        stroke={outlet.color}
                                        strokeWidth="3"
                                        style={{ transition: 'cx 0.1s ease, cy 0.1s ease' }}
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* Vertical indicator line on hover */}
                    {hoveredIndex !== null && (
                        <line
                            x1={getX(hoveredIndex)}
                            y1={padding.top}
                            x2={getX(hoveredIndex)}
                            y2={svgHeight - padding.bottom}
                            stroke="#94A3B8"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                        />
                    )}

                    {/* X-Axis Baseline */}
                    <line
                        x1={padding.left}
                        y1={svgHeight - padding.bottom}
                        x2={svgWidth - padding.right}
                        y2={svgHeight - padding.bottom}
                        stroke="#E2E8F0"
                        strokeWidth="1"
                    />

                    {/* X-Axis Month Labels */}
                    {MONTHS_DATA.map((item, idx) => {
                        const isHovered = hoveredIndex === idx;
                        return (
                            <text
                                key={item.month}
                                x={getX(idx)}
                                y={svgHeight - 12}
                                textAnchor="middle"
                                fontSize="12"
                                fontWeight={isHovered ? '700' : '500'}
                                fill={isHovered ? '#0F172A' : '#94A3B8'}
                                style={{ transition: 'fill 0.15s ease' }}
                            >
                                {item.month}
                            </text>
                        );
                    })}
                </svg>

                {/* Floating Interactive Tooltip */}
                {hoveredIndex !== null && (
                    <div
                        style={{
                            position: 'absolute',
                            left: `${Math.min(Math.max(tooltipPos.x, 140), (chartContainerRef.current?.offsetWidth || 700) - 140)}px`,
                            top: '14px',
                            transform: 'translateX(-50%)',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #E2E8F0',
                            pointerEvents: 'none',
                            zIndex: 10,
                            minWidth: '170px',
                            animation: 'fadeIn 0.15s ease'
                        }}
                    >
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{MONTHS_DATA[hoveredIndex].fullName}</span>
                            <span style={{ color: 'var(--primary)' }}>{MONTHS_DATA[hoveredIndex].total}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {OUTLETS.map(outlet => {
                                if (!activeOutlets[outlet.id]) return null;
                                const val = MONTHS_DATA[hoveredIndex][outlet.id];
                                return (
                                    <div key={outlet.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6875rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: outlet.color }} />
                                            <span style={{ color: '#475569' }}>{outlet.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 600, color: '#0F172A' }}>
                                            LKR {(val * 1000).toLocaleString()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}