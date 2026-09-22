import { useState, useMemo } from 'react';
import { DEFAULT_SUPERMARKET_ANALYTICS } from '../../services/api';

// Cash = #6B9CD2 (brand accent), Card = #10b981, others keep their own
const METHOD_COLORS = {
  Cash:             '#6B9CD2',
  Card:             '#10b981',
  Voucher:          '#f59e0b',
  'Loyalty Points': '#ef4444',
  Points:           '#ef4444',
};

export default function PaymentMethodChart({
  data      = DEFAULT_SUPERMARKET_ANALYTICS.paymentMethods,
  subtitle  = 'Cash vs Card • Aug 2026',
  className = '',
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = useMemo(() => data.reduce((s, d) => s + (d.count ?? 0), 0), [data]);

  const segments = useMemo(() => {
    let cum = 0;
    return data.map((item, i) => {
      const pct   = item.percentage ?? (total > 0 ? (item.count / total) * 100 : 0);
      const angle = (pct / 100) * 360;
      const start = cum;
      cum += angle;
      return {
        ...item,
        pct:   Math.round(pct),
        start,
        end:   cum,
        color: item.color ?? METHOD_COLORS[item.method] ?? '#6b7280',
        label: item.method === 'Loyalty Points' ? 'Points' : item.method,
        idx:   i,
      };
    });
  }, [data, total]);

  const active = hoveredIdx !== null ? segments[hoveredIdx] : (segments[0] ?? {});

  const p2c = (cx, cy, r, deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (cx, cy, ri, ro, s, e) => {
    const ae = Math.min(e, s + 359.99);
    const so = p2c(cx, cy, ro, ae);
    const eo = p2c(cx, cy, ro, s);
    const si = p2c(cx, cy, ri, s);
    const ei = p2c(cx, cy, ri, ae);
    const lg = ae - s > 180 ? 1 : 0;
    return [
      `M ${so.x} ${so.y}`,
      `A ${ro} ${ro} 0 ${lg} 0 ${eo.x} ${eo.y}`,
      `L ${si.x} ${si.y}`,
      `A ${ri} ${ri} 0 ${lg} 1 ${ei.x} ${ei.y}`,
      'Z',
    ].join(' ');
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col h-full ${className}`}>

      {/* Header */}
      <div className="pb-3 border-b border-gray-100 mb-4">
        <h3 className="text-sm font-bold text-gray-900">Payment Method Split</h3>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>

      {/* Chart + legend */}
      <div className="flex-1 flex flex-col sm:flex-row items-center gap-6 py-2">

        {/* Donut */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <svg width="160" height="160" viewBox="0 0 160 160"
            style={{ transform: 'rotate(-90deg)' }} aria-label="Payment method donut">
            {segments.map((seg) => {
              const hov = hoveredIdx === seg.idx;
              return (
                <path
                  key={seg.method}
                  d={arcPath(80, 80, 46, hov ? 74 : 70, seg.start + 1, seg.end - 1)}
                  fill={seg.color}
                  style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={() => setHoveredIdx(seg.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl font-black text-gray-900 leading-none">
              {active.pct ?? 0}%
            </span>
            <span className="text-[11px] font-semibold mt-1 uppercase tracking-wider"
              style={{ color: active.color ?? '#6B9CD2' }}>
              {active.label ?? 'Cash'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2">
          {segments.map((seg) => (
            <div
              key={seg.method}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${hoveredIdx === seg.idx ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onMouseEnter={() => setHoveredIdx(seg.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-sm font-medium text-gray-700">{seg.label}</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{seg.pct}%</span>
            </div>
          ))}

          <div className="pt-2 border-t border-gray-100 text-xs text-gray-400">
            Total transactions: <strong className="text-gray-600">{total.toLocaleString()}</strong>
          </div>
          {segments.length >= 2 && (
            <div className="text-xs text-gray-400">
              {segments[0]?.count?.toLocaleString()} / {segments[1]?.count?.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
