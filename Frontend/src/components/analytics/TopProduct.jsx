import { useState } from 'react';
import { DEFAULT_SUPERMARKET_ANALYTICS } from '../../services/api';

const ACCENT = '#6B9CD2';
const ACCENT_DARK = '#5a8bc1';

export default function TopProduct({
  data      = DEFAULT_SUPERMARKET_ANALYTICS.topProducts,
  subtitle  = 'Aug 2026 • All outlets combined',
  maxScale  = 600,
  className = '',
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const scaleMarkers = [0, 150, 300, 450, 600];

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col h-full ${className}`}>

      {/* Header */}
      <div className="pb-3 border-b border-gray-100 mb-4">
        <h3 className="text-sm font-bold text-gray-900">Top 5 Products by Units Sold</h3>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>

      {/* Bar chart */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-3">
          {data.map((item, idx) => {
            const pct      = Math.min(100, Math.max(2, (item.unitsSold / maxScale) * 100));
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={item.id ?? item.name}
                className="flex items-center gap-3"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className="w-28 sm:w-36 flex-shrink-0 text-right pr-2">
                  <span className="text-xs font-medium text-gray-700 truncate block">{item.name}</span>
                </div>
                <div className="flex-1 relative flex items-center h-7">
                  <div
                    className="h-full rounded-r-md flex items-center justify-end px-2.5 transition-all duration-200"
                    style={{ width: `${pct}%`, backgroundColor: isHovered ? ACCENT_DARK : ACCENT }}
                  >
                    <span className="text-[11px] font-bold text-white">{item.unitsSold}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis */}
        <div className="mt-4 pl-28 sm:pl-36 pr-0 flex justify-between text-[10px] font-semibold text-gray-400 select-none">
          {scaleMarkers.map((v) => <span key={v}>{v}</span>)}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <span>Top Contributor: <strong className="text-gray-600">{data[0]?.name ?? 'Basmati Rice'}</strong></span>
        <span className="font-semibold text-gray-600">
          Total: {data.reduce((s, p) => s + (p.unitsSold ?? 0), 0).toLocaleString()} units
        </span>
      </div>
    </div>
  );
}
