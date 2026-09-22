import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { DEFAULT_SUPERMARKET_ANALYTICS } from '../../services/api';

const ACCENT = '#6B9CD2';
const OUTLETS = [
  { key: 'colombo', label: 'COLOMBO' },
  { key: 'kandy',   label: 'KANDY'   },
  { key: 'galle',   label: 'GALLE'   },
  { key: 'negombo', label: 'NEGOMBO' },
  { key: 'matara',  label: 'MATARA'  },
];

export default function MonthlyRevenueTable({
  data      = DEFAULT_SUPERMARKET_ANALYTICS.monthlyRevenue,
  isLoading = false,
  className = '',
}) {
  const [mode, setMode] = useState('compact');

  const fmtBranch = (v) => {
    if (v == null) return '—';
    return mode === 'full'
      ? `LKR ${Number(v).toLocaleString('en-LK')}`
      : `${Math.round(v / 1000)}k`;
  };

  const fmtTotal = (v) => {
    if (v == null) return '—';
    return mode === 'full'
      ? `LKR ${Number(v).toLocaleString('en-LK')}`
      : `LKR ${(v / 1_000_000).toFixed(2)}M`;
  };

  const totals = useMemo(() => {
    const t = { colombo: 0, kandy: 0, galle: 0, negombo: 0, matara: 0, total: 0 };
    data.forEach((r) => {
      OUTLETS.forEach(({ key }) => { t[key] += r[key] ?? 0; });
      t.total += r.total ?? 0;
    });
    return t;
  }, [data]);

  const handleExportCSV = () => {
    const headers = ['Month', ...OUTLETS.map((o) => `${o.label} (LKR)`), 'Total (LKR)'];
    const rows    = data.map((r) => [r.month, ...OUTLETS.map(({ key }) => r[key] ?? 0), r.total ?? 0]);
    const csv     = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const a       = document.createElement('a');
    a.href        = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download    = `monthly_revenue_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm ${className}`}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 mb-1">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Monthly Revenue by Outlet</h3>
          <p className="text-xs text-gray-400 mt-0.5">Regional performance breakdown across all 5 supermarket branches</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex p-0.5 bg-gray-100 rounded-lg border border-gray-200">
            {[['compact', 'Short (k/M)'], ['full', 'Full LKR']].map(([val, lbl]) => (
              <button key={val} type="button" onClick={() => setMode(val)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  mode === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}>
                {lbl}
              </button>
            ))}
          </div>
          <button type="button" onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg cursor-pointer">
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-500 tracking-wider">
              <th className="py-3 px-3 uppercase">MONTH</th>
              {OUTLETS.map(({ key, label }) => (
                <th key={key} className="py-3 px-3 uppercase">{label}</th>
              ))}
              <th className="py-3 px-3 uppercase text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: `${ACCENT} transparent ${ACCENT} ${ACCENT}` }} />
                    Loading…
                  </div>
                </td>
              </tr>
            ) : data.map((row) => (
              <tr key={row.month}
                className={`transition-colors hover:bg-gray-50 ${row.isCurrent ? 'font-semibold text-gray-900' : ''}`}
                style={row.isCurrent ? { backgroundColor: 'rgba(107,156,210,0.06)' } : {}}>
                <td className="py-3 px-3 whitespace-nowrap font-medium">
                  <div className="flex items-center gap-2">
                    {row.isCurrent && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ACCENT }} />}
                    {row.month}
                  </div>
                </td>
                {OUTLETS.map(({ key }) => (
                  <td key={key} className="py-3 px-3 whitespace-nowrap text-gray-600">{fmtBranch(row[key])}</td>
                ))}
                <td className="py-3 px-3 whitespace-nowrap text-right font-bold"
                  style={{ color: row.isCurrent ? ACCENT : '#1f2937' }}>
                  {fmtTotal(row.total)}
                </td>
              </tr>
            ))}
          </tbody>
          {!isLoading && data.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold text-gray-900 text-xs">
                <td className="py-3 px-3 text-gray-500 uppercase tracking-wider text-[11px]">Total</td>
                {OUTLETS.map(({ key }) => (
                  <td key={key} className="py-3 px-3 text-gray-600">{fmtBranch(totals[key])}</td>
                ))}
                <td className="py-3 px-3 text-right font-black" style={{ color: ACCENT }}>
                  {fmtTotal(totals.total)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <span>EGOTECHWORLD (PVT) LTD</span>
        <span>egotechworld.com | +94 74 312 6123</span>
      </div>
    </div>
  );
}
