import { useState, useMemo, useRef } from 'react';
import { TrendingUp } from 'lucide-react';
import { DEFAULT_SUPERMARKET_ANALYTICS, formatLKR } from '../../services/api';

export default function RevenueTrendChart({
  data     = DEFAULT_SUPERMARKET_ANALYTICS.monthlyRevenue,
  outlets  = DEFAULT_SUPERMARKET_ANALYTICS.outlets,
  subtitle = 'Feb – Aug 2026 • Monthly',
  className = '',
}) {
  const [hiddenOutlets, setHiddenOutlets] = useState({});
  const [hoveredIndex, setHoveredIndex]   = useState(null);
  const containerRef = useRef(null);

  const W = 800, H = 270;
  const pad = { top: 30, right: 30, bottom: 42, left: 56 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top  - pad.bottom;

  const toggleOutlet = (id) =>
    setHiddenOutlets((p) => ({ ...p, [id]: !p[id] }));

  const maxRevenue = useMemo(() => {
    let max = 0;
    data.forEach((row) => {
      outlets.forEach((o) => {
        if (!hiddenOutlets[o.id] && (row[o.id] || 0) > max) max = row[o.id] || 0;
      });
    });
    return Math.ceil((max || 4_000_000) * 1.18);
  }, [data, outlets, hiddenOutlets]);

  const yLabels = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => ({
      val:   (maxRevenue / steps) * (steps - i),
      ratio: i / steps,
    }));
  }, [maxRevenue]);

  const xCoords = useMemo(() => {
    if (data.length <= 1) return [pad.left + cW / 2];
    const step = cW / (data.length - 1);
    return data.map((_, i) => pad.left + i * step);
  }, [data, cW]);

  const getY = (val) =>
    pad.top + (1 - Math.max(0, Math.min(1, (val || 0) / maxRevenue))) * cH;

  const smoothPath = (pts) => {
    if (!pts.length) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const areaPath = (pts) => {
    if (!pts.length) return '';
    return `${smoothPath(pts)} L ${pts[pts.length - 1].x} ${pad.top + cH} L ${pts[0].x} ${pad.top + cH} Z`;
  };

  const outletLines = useMemo(() => outlets.map((outlet) => {
    const points = data.map((row, i) => ({
      x: xCoords[i],
      y: getY(row[outlet.id] || 0),
      val: row[outlet.id] || 0,
    }));
    return {
      ...outlet,
      isHidden: !!hiddenOutlets[outlet.id],
      points,
      path: smoothPath(points),
      area: areaPath(points),
    };
  }), [outlets, data, hiddenOutlets, xCoords, maxRevenue]);

  const fmtY = (v) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `${Math.round(v / 1_000)}k`;
    return '0';
  };

  return (
    <div
      ref={containerRef}
      style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      className={className}
    >
      {/* Header */}
      <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '14px', marginBottom: '4px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} style={{ color: '#6B9CD2' }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Revenue Trends by Outlet</span>
          </div>
          <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{subtitle}</p>
        </div>

        {/* Legend pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {outlets.map((o) => {
            const hidden = !!hiddenOutlets[o.id];
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => toggleOutlet(o.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                  cursor: 'pointer', border: '1px solid #e5e7eb',
                  backgroundColor: hidden ? '#f3f4f6' : '#ffffff',
                  color: hidden ? '#9ca3af' : '#374151',
                  textDecoration: hidden ? 'line-through' : 'none',
                  opacity: hidden ? 0.5 : 1,
                }}
              >
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: o.color, flexShrink: 0 }} />
                {o.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '12px', overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} aria-label="Revenue trends chart">
          <defs>
            {outlets.map((o) => (
              <linearGradient key={o.id} id={`rg-${o.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={o.color} stopOpacity="0.13" />
                <stop offset="100%" stopColor={o.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines + Y labels */}
          {yLabels.map(({ val, ratio }) => {
            const y = pad.top + ratio * cH;
            return (
              <g key={ratio}>
                <line x1={pad.left} y1={y} x2={W - pad.right} y2={y}
                  stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
                <text x={pad.left - 8} y={y + 4} textAnchor="end"
                  fill="#9ca3af" fontSize="10" fontWeight="500">
                  {fmtY(val)}
                </text>
              </g>
            );
          })}

          {/* Hover vertical line */}
          {hoveredIndex !== null && (
            <line
              x1={xCoords[hoveredIndex]} y1={pad.top}
              x2={xCoords[hoveredIndex]} y2={pad.top + cH}
              stroke="#6B9CD2" strokeWidth="1.5" strokeDasharray="4 3"
            />
          )}

          {/* Area fills */}
          {outletLines.map((o) => !o.isHidden && (
            <path key={`a-${o.id}`} d={o.area} fill={`url(#rg-${o.id})`} />
          ))}

          {/* Lines */}
          {outletLines.map((o) => !o.isHidden && (
            <path key={`l-${o.id}`} d={o.path} fill="none"
              stroke={o.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          ))}

          {/* Data point circles */}
          {outletLines.map((o) => !o.isHidden && o.points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y}
              r={hoveredIndex === i ? 5 : 3}
              fill={o.color} stroke="#ffffff" strokeWidth={hoveredIndex === i ? 2 : 1.5}
            />
          )))}

          {/* X-axis month labels */}
          {data.map((row, i) => (
            <text key={i} x={xCoords[i]} y={H - 10} textAnchor="middle"
              fill={hoveredIndex === i ? '#111827' : '#9ca3af'}
              fontSize={hoveredIndex === i ? '11' : '10'}
              fontWeight={hoveredIndex === i ? '700' : '500'}>
              {row.shortMonth || (row.month || '').split(' ')[0]}
            </text>
          ))}

          {/* Invisible hover columns */}
          {data.map((_, i) => {
            const step = cW / Math.max(1, data.length - 1);
            return (
              <rect key={i}
                x={Math.max(pad.left, xCoords[i] - step / 2)}
                y={pad.top} width={step} height={cH + 30}
                fill="transparent" style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div style={{
            position: 'absolute', top: '12px', zIndex: 20, pointerEvents: 'none',
            backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '10px 12px',
            fontSize: '11px', minWidth: '160px',
            left: `${Math.min(Math.max(4, ((xCoords[hoveredIndex] - pad.left) / cW) * 80), 65)}%`,
          }}>
            <div style={{ fontWeight: 700, color: '#111827', paddingBottom: '6px', borderBottom: '1px solid #f3f4f6', marginBottom: '6px' }}>
              {data[hoveredIndex].month}
            </div>
            {outlets.map((o) => {
              if (hiddenOutlets[o.id]) return null;
              const val = data[hoveredIndex][o.id] || 0;
              return (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: o.color, flexShrink: 0 }} />
                    <span style={{ color: '#6b7280', fontWeight: 500 }}>{o.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{formatLKR(val, 'short')}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
