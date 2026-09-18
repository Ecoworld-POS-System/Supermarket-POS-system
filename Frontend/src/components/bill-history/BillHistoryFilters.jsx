import { useState, useRef, useEffect } from 'react';
import { Search, Calendar, ChevronDown, X, Check, RotateCcw } from 'lucide-react';

const ACCENT = '#6B9CD2';

export default function BillHistoryFilters({
  filters    = {},
  setFilters = () => {},
  totalRecords = 0,
  className  = '',
}) {
  const { search = '', outlet = 'all', status = 'all', method = 'all',
          dateRange = { start: '08/01/2026', end: '08/13/2026' } } = filters;

  const [outletOpen,     setOutletOpen]     = useState(false);
  const [statusOpen,     setStatusOpen]     = useState(false);
  const [methodOpen,     setMethodOpen]     = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const outletRef = useRef(null);
  const statusRef = useRef(null);
  const methodRef = useRef(null);
  const dateRef   = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (outletRef.current && !outletRef.current.contains(e.target)) setOutletOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false);
      if (methodRef.current && !methodRef.current.contains(e.target)) setMethodOpen(false);
      if (dateRef.current   && !dateRef.current.contains(e.target))   setDatePickerOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const closeAll = () => { setOutletOpen(false); setStatusOpen(false); setMethodOpen(false); setDatePickerOpen(false); };
  const set      = (key, value) => setFilters((p) => ({ ...p, [key]: value }));

  const outletOptions = [
    { value: 'all',     label: 'All Outlets'     },
    { value: 'colombo', label: 'Colombo - Head'  },
    { value: 'kandy',   label: 'Kandy - City'    },
    { value: 'galle',   label: 'Galle - Fort'    },
    { value: 'negombo', label: 'Negombo - Beach' },
    { value: 'matara',  label: 'Matara Branch'   },
  ];
  const statusOptions = [
    { value: 'all',       label: 'All Status' },
    { value: 'Completed', label: 'Completed'  },
    { value: 'Pending',   label: 'Pending'    },
    { value: 'Refunded',  label: 'Refunded'   },
    { value: 'Exchanged', label: 'Exchanged'  },
    { value: 'Cancelled', label: 'Cancelled'  },
  ];
  const methodOptions = [
    { value: 'all',    label: 'All Methods'    },
    { value: 'Cash',   label: 'Cash'           },
    { value: 'Card',   label: 'Card'           },
    { value: 'Voucher',label: 'Voucher'        },
    { value: 'Points', label: 'Loyalty Points' },
  ];

  const outletLabel = outletOptions.find((o) => o.value === outlet)?.label ?? 'All Outlets';
  const statusLabel = statusOptions.find((s) => s.value === status)?.label ?? 'All Status';
  const methodLabel = methodOptions.find((m) => m.value === method)?.label ?? 'All Methods';
  const hasActive   = search !== '' || outlet !== 'all' || status !== 'all' || method !== 'all';

  const dropBtn = (active) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600,
    border: `1px solid ${active ? ACCENT : '#d1d5db'}`,
    backgroundColor: active ? 'rgba(107,156,210,0.08)' : '#ffffff',
    color: active ? ACCENT : '#374151',
    borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', minWidth: '120px',
  });

  const dropMenu = 'absolute left-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 text-xs min-w-[150px]';
  const dropOpt  = (sel) =>
    `w-full text-left px-3.5 py-2 flex items-center justify-between cursor-pointer transition-colors ${
      sel ? 'font-semibold text-white' : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-3 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center gap-2.5">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type="text" placeholder="Search ID, customer, cashier..." value={search}
            onChange={(e) => set('search', e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all"
            style={{ '--tw-ring-color': ACCENT }} />
          {search && (
            <button type="button" onClick={() => set('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Outlet */}
        <div className="relative" ref={outletRef}>
          <button type="button" style={dropBtn(outlet !== 'all')}
            onClick={() => { closeAll(); setOutletOpen((p) => !p); }}>
            <span>{outletLabel}</span>
            <ChevronDown size={12} style={{ opacity: 0.6, transform: outletOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {outletOpen && (
            <div className={dropMenu}>
              {outletOptions.map((opt) => (
                <button key={opt.value} type="button"
                  onClick={() => { set('outlet', opt.value); setOutletOpen(false); }}
                  className={dropOpt(outlet === opt.value)}
                  style={outlet === opt.value ? { backgroundColor: ACCENT } : {}}>
                  <span>{opt.label}</span>
                  {outlet === opt.value && <Check size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="relative" ref={statusRef}>
          <button type="button" style={dropBtn(status !== 'all')}
            onClick={() => { closeAll(); setStatusOpen((p) => !p); }}>
            <span>{statusLabel}</span>
            <ChevronDown size={12} style={{ opacity: 0.6, transform: statusOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {statusOpen && (
            <div className={dropMenu}>
              {statusOptions.map((opt) => (
                <button key={opt.value} type="button"
                  onClick={() => { set('status', opt.value); setStatusOpen(false); }}
                  className={dropOpt(status === opt.value)}
                  style={status === opt.value ? { backgroundColor: ACCENT } : {}}>
                  <span>{opt.label}</span>
                  {status === opt.value && <Check size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Method */}
        <div className="relative" ref={methodRef}>
          <button type="button" style={dropBtn(method !== 'all')}
            onClick={() => { closeAll(); setMethodOpen((p) => !p); }}>
            <span>{methodLabel}</span>
            <ChevronDown size={12} style={{ opacity: 0.6, transform: methodOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {methodOpen && (
            <div className={dropMenu}>
              {methodOptions.map((opt) => (
                <button key={opt.value} type="button"
                  onClick={() => { set('method', opt.value); setMethodOpen(false); }}
                  className={dropOpt(method === opt.value)}
                  style={method === opt.value ? { backgroundColor: ACCENT } : {}}>
                  <span>{opt.label}</span>
                  {method === opt.value && <Check size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date range */}
        <div className="relative ml-auto" ref={dateRef}>
          <button type="button" onClick={() => { closeAll(); setDatePickerOpen((p) => !p); }}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer transition-all">
            <Calendar size={13} className="text-gray-400" />
            <span>{dateRange.start}</span>
            <span className="text-gray-400">to</span>
            <span>{dateRange.end}</span>
          </button>
          {datePickerOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 p-4 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 text-xs">
              <div className="font-bold text-gray-800 pb-2 border-b border-gray-100 mb-3">Date Range</div>
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] text-gray-500 font-semibold block mb-1">From</label>
                  <input type="date" defaultValue="2026-08-01"
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                    onChange={(e) => set('dateRange', { ...dateRange, start: e.target.value.split('-').reverse().join('/') })} />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-semibold block mb-1">To</label>
                  <input type="date" defaultValue="2026-08-13"
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                    onChange={(e) => set('dateRange', { ...dateRange, end: e.target.value.split('-').reverse().join('/') })} />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-end">
                <button type="button" onClick={() => setDatePickerOpen(false)}
                  className="px-3 py-1 text-white rounded-lg font-semibold text-xs cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: ACCENT }}>
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Record count */}
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-100 rounded-lg border border-gray-200 whitespace-nowrap">
          {totalRecords} records
        </div>

        {/* Reset */}
        {hasActive && (
          <button type="button"
            onClick={() => setFilters({ search: '', outlet: 'all', status: 'all', method: 'all', dateRange: { start: '08/01/2026', end: '08/13/2026' } })}
            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 border border-rose-200 cursor-pointer transition-colors">
            <RotateCcw size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
