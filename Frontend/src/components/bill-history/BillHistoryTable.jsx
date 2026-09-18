import { useState, useMemo } from 'react';
import { ArrowUpDown, FileText } from 'lucide-react';
import BillHistoryRow from './BillHistoryRow';

const ACCENT = '#6B9CD2';

export default function BillHistoryTable({
  bills = [], isLoading = false, onViewBill = () => {},
  selectedBillIds = [], onToggleSelectBill = () => {}, className = '',
}) {
  const [sortField, setSortField] = useState('createdAt');
  const [sortAsc,   setSortAsc]   = useState(false);

  const handleSort = (field) => {
    if (sortField === field) setSortAsc((p) => !p);
    else { setSortField(field); setSortAsc(false); }
  };

  const sortedBills = useMemo(() => {
    return [...bills].sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (sortField === 'customer')   { av = a.customer?.name ?? ''; bv = b.customer?.name ?? ''; }
      if (sortField === 'createdAt')  { av = new Date(a.createdAt || 0).getTime(); bv = new Date(b.createdAt || 0).getTime(); }
      if (sortField === 'grandTotal') { av = Number(a.grandTotal) || 0; bv = Number(b.grandTotal) || 0; }
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ?  1 : -1;
      return 0;
    });
  }, [bills, sortField, sortAsc]);

  const headers = [
    { key: 'billNumber',    label: 'TRANSACTION ID', sortable: true  },
    { key: 'createdAt',     label: 'DATE & TIME',    sortable: true  },
    { key: 'customer',      label: 'CUSTOMER',       sortable: true  },
    { key: 'cashier',       label: 'CASHIER',        sortable: true  },
    { key: 'branch',        label: 'BRANCH',         sortable: false },
    { key: 'itemsCount',    label: 'ITEMS',          sortable: true,  align: 'center' },
    { key: 'paymentMethod', label: 'METHOD',         sortable: false },
    { key: 'grandTotal',    label: 'TOTAL',          sortable: true  },
    { key: 'status',        label: 'STATUS',         sortable: true  },
    { key: 'actions',       label: 'ACTIONS',        sortable: false, align: 'right'  },
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-500 tracking-wider select-none">
              {headers.map((h) => (
                <th key={h.key} onClick={() => h.sortable && handleSort(h.key)}
                  className={`py-3 px-4 uppercase whitespace-nowrap ${
                    h.align === 'center' ? 'text-center' : h.align === 'right' ? 'text-right' : 'text-left'
                  } ${h.sortable ? 'cursor-pointer hover:text-gray-800 transition-colors' : ''}`}>
                  <span className={`inline-flex items-center gap-1 ${h.align === 'center' ? 'justify-center' : h.align === 'right' ? 'justify-end' : ''}`}>
                    {h.label}
                    {h.sortable && (
                      <ArrowUpDown size={10}
                        style={{ color: sortField === h.key ? ACCENT : undefined }}
                        className={sortField === h.key ? 'opacity-100' : 'opacity-40'} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={headers.length} className="py-14 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: `${ACCENT} transparent ${ACCENT} ${ACCENT}` }} />
                    <span className="text-xs font-semibold">Loading transactions…</span>
                  </div>
                </td>
              </tr>
            ) : sortedBills.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="py-14 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2 max-w-xs mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-1">
                      <FileText size={22} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">No matching transactions</p>
                    <p className="text-xs text-gray-400">Try adjusting your filters or date range.</p>
                  </div>
                </td>
              </tr>
            ) : sortedBills.map((bill) => (
              <BillHistoryRow key={bill.id ?? bill.billNumber} bill={bill} onView={onViewBill}
                isSelected={selectedBillIds.includes(bill.id ?? bill.billNumber)}
                onToggleSelect={() => onToggleSelectBill(bill.id ?? bill.billNumber)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
