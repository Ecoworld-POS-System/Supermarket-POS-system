import React, { useState, useRef } from 'react';

const DEFAULT_PRODUCTS = [
    { id: 1, name: 'Basmati Rice', unitsSold: 488, category: 'Grains & Staples', revenue: 244000 },
    { id: 2, name: 'Samba Rice', unitsSold: 412, category: 'Grains & Staples', revenue: 164800 },
    { id: 3, name: 'Nestlé Milk', unitsSold: 370, category: 'Dairy & Beverages', revenue: 185000 },
    { id: 4, name: 'Coca-Cola 1.5L', unitsSold: 345, category: 'Beverages', revenue: 138000 },
    { id: 5, name: 'Milo Powder', unitsSold: 290, category: 'Beverages', revenue: 203000 },
];

export default function TopProducts({
    products = DEFAULT_PRODUCTS,
    title = 'Top 5 Products by Units Sold',
    subtitle = 'Aug 2026 · All outlets combined',
    maxScale = 600,
}) {
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const ticks = [0, 150, 300, 450, 600];

    // SVG Layout Dimensions
    const svgWidth = 520;
    const svgHeight = 195;
    const labelWidth = 100;
    const rightPadding = 15;
    const chartWidth = svgWidth - labelWidth - rightPadding; // 405
    const barHeight = 20;
    const barGap = 32;
    const startY = 12;

    const handleMouseMove = (e, product) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setHoveredProduct(product);
        setTooltipPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleMouseLeave = () => {
        setHoveredProduct(null);
    };

    return (
        <div
            ref={containerRef}
            className="table-card"
            style={{
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between',
                position: 'relative',
            }}
        >
            {/* Card Header */}
            <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                    {title}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    {subtitle}
                </span>
            </div>

            {/* Horizontal Bar Chart (SVG) */}
            <div style={{ position: 'relative', width: '100%', flex: 1, display: 'flex', alignItems: 'center' }}>
                <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    style={{ width: '100%', height: 'auto', overflow: 'visible' }}
                >
                    {/* Vertical dashed grid lines */}
                    {ticks.map((tick) => {
                        const x = labelWidth + (tick / maxScale) * chartWidth;
                        return (
                            <g key={tick}>
                                <line
                                    x1={x}
                                    y1={startY - 4}
                                    x2={x}
                                    y2={startY + 4 * barGap + barHeight + 8}
                                    stroke="#E2E8F0"
                                    strokeWidth="1"
                                    strokeDasharray="3 3"
                                />
                                <text
                                    x={x}
                                    y={startY + 4 * barGap + barHeight + 24}
                                    textAnchor="middle"
                                    fill="#94A3B8"
                                    fontSize="11"
                                    fontWeight="500"
                                >
                                    {tick}
                                </text>
                            </g>
                        );
                    })}

                    {/* Bars and Y-Axis Labels */}
                    {products.slice(0, 5).map((product, index) => {
                        const y = startY + index * barGap;
                        const barW = Math.min((product.unitsSold / maxScale) * chartWidth, chartWidth);
                        const isHovered = hoveredProduct?.id === product.id;

                        return (
                            <g
                                key={product.id}
                                style={{ cursor: 'pointer' }}
                                onMouseMove={(e) => handleMouseMove(e, product)}
                                onMouseLeave={handleMouseLeave}
                            >
                                {/* Y-Axis Product Name */}
                                <text
                                    x={labelWidth - 12}
                                    y={y + 14}
                                    textAnchor="end"
                                    fill={isHovered ? '#0F172A' : '#334155'}
                                    fontSize="12"
                                    fontWeight={isHovered ? '600' : '500'}
                                    style={{ transition: 'fill 0.15s ease' }}
                                >
                                    {product.name}
                                </text>

                                {/* Background hit area for easier hover */}
                                <rect
                                    x={labelWidth}
                                    y={y - 4}
                                    width={chartWidth}
                                    height={barHeight + 8}
                                    fill="transparent"
                                />

                                {/* Bar Rect */}
                                <rect
                                    x={labelWidth}
                                    y={y}
                                    width={barW}
                                    height={barHeight}
                                    rx="3"
                                    fill={isHovered ? '#1D4ED8' : '#2563EB'}
                                    style={{
                                        transition: 'fill 0.2s ease, width 0.3s ease, filter 0.2s ease',
                                        filter: isHovered ? 'drop-shadow(0 2px 6px rgba(37,99,235,0.35))' : 'none',
                                    }}
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Floating Tooltip */}
                {hoveredProduct && (
                    <div
                        style={{
                            position: 'absolute',
                            left: `${tooltipPos.x}px`,
                            top: `${tooltipPos.y - 48}px`,
                            transform: 'translate(-50%, -100%)',
                            backgroundColor: '#0F172A',
                            color: '#FFFFFF',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                        }}
                    >
                        <span style={{ fontWeight: 600 }}>{hoveredProduct.name}</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.6875rem' }}>
                            {hoveredProduct.unitsSold.toLocaleString()} units sold
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
