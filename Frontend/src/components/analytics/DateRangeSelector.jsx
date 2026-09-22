import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Check, X } from 'lucide-react';

const ACCENT = '#6B9CD2';

export default function DateRangeSelector({
  selectedRange = 'month',
  onRangeChange = () => {},
  customDates   = { start: '', end: '' },
  className     = '',
}) {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [startDate, setStartDate]       = useState(customDates.start || '2026-02-01');
  const [endDate, setEndDate]           = useState(customDates.end   || '2026-08-31');
  const dropdownRef = useRef(null);

  const presets = [
    { key: 'today',   label: 'Today'        },
    { key: 'week',    label: 'This Week'     },
    { key: 'month',   label: 'This Month'    },
    { key: '3months', label: 'Last 3 Months' },
    { key: '6months', label: 'Last 6 Months' },
  ];

  useEffect(() => {
    if (!isCustomOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsCustomOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isCustomOpen]);

  const handleApply = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    setIsCustomOpen(false);
    onRangeChange('custom', { start: startDate, end: endDate });
  };

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      {/* Pill group */}
      <div className="inline-flex items-center p-1 bg-gray-100 border border-gray-200 rounded-xl shadow-sm">
        {presets.map(({ key, label }) => {
          const active = selectedRange === key;
          return (
            <button key={key} type="button"
              onClick={() => { setIsCustomOpen(false); onRangeChange(key); }}
              style={active ? { backgroundColor: ACCENT, color: '#ffffff' } : {}}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                active ? '' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
              aria-pressed={active}>
              {label}
            </button>
          );
        })}

        <button type="button"
          onClick={() => setIsCustomOpen((p) => !p)}
          style={selectedRange === 'custom' ? { backgroundColor: ACCENT, color: '#ffffff' } : {}}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            selectedRange === 'custom' ? '' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}>
          <CalendarIcon size={13} className="opacity-80" />
          <span>{selectedRange === 'custom' ? 'Custom' : 'Custom...'}</span>
          <ChevronDown size={12} className={`opacity-70 transition-transform ${isCustomOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Custom date popover */}
      {isCustomOpen && (
        <div ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-76 p-4 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 text-gray-800">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(107,156,210,0.12)', color: ACCENT }}>
                <CalendarIcon size={15} />
              </div>
              <h4 className="text-xs font-bold text-gray-900">Select Custom Period</h4>
            </div>
            <button type="button" onClick={() => setIsCustomOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleApply} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                style={{ '--tw-ring-color': ACCENT }}
                required />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                required />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Quick Periods</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'August 2026',  s: '2026-08-01', e: '2026-08-31' },
                  { label: 'Year to Date', s: '2026-01-01', e: '2026-08-31' },
                ].map(({ label, s, e }) => (
                  <button key={label} type="button"
                    onClick={() => { setStartDate(s); setEndDate(e); }}
                    className="px-2 py-1 text-[11px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-left cursor-pointer transition-colors">
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setIsCustomOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg cursor-pointer">
                Cancel
              </button>
              <button type="submit"
                style={{ backgroundColor: ACCENT }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                <Check size={13} /> Apply Range
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
