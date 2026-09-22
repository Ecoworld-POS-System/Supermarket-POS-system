import { Eye } from 'lucide-react';

const ACCENT = '#6B9CD2';

export default function BillHistoryRow({
  bill, onView = () => {}, isSelected = false, onToggleSelect = () => {},
}) {
  const formattedTotal = bill.grandTotal !== undefined
    ? `LKR ${Number(bill.grandTotal).toLocaleString('en-LK')}` : 'LKR 0';

  const statusConfig = {
    completed: { bg: '#ecfdf5', text: '#065f46', border: '#6ee7b7', dot: '#10b981', label: 'Completed' },
    pending:   { bg: '#fffbeb', text: '#92400e', border: '#fcd34d', dot: '#f59e0b', label: 'Pending'   },
    refunded:  { bg: '#fff1f2', text: '#9f1239', border: '#fca5a5', dot: '#ef4444', label: 'Refunded'  },
    exchanged: { bg: '#faf5ff', text: '#6b21a8', border: '#d8b4fe', dot: '#a855f7', label: 'Exchanged' },
    cancelled: { bg: '#f9fafb', text: '#4b5563', border: '#d1d5db', dot: '#9ca3af', label: 'Cancelled' },
  };
  const sk  = (bill.status ?? '').toLowerCase();
  const cfg = statusConfig[sk] ?? { bg: '#eff6ff', text: '#1e40af', border: '#93c5fd', dot: ACCENT, label: bill.status ?? '—' };

  const tierConfig = {
    GOLD:     { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    SILVER:   { bg: '#f3f4f6', text: '#1f2937', border: '#d1d5db' },
    STANDARD: { bg: '#fefce8', text: '#713f12', border: '#fde68a' },
  };
  const tier    = bill.customer?.tier?.toUpperCase();
  const tierCfg = tier ? (tierConfig[tier] ?? tierConfig.STANDARD) : null;

  const methodColors = {
    cash:    { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    card:    { bg: 'rgba(107,156,210,0.1)', text: '#1e3a5f', border: 'rgba(107,156,210,0.4)' },
    voucher: { bg: '#faf5ff', text: '#6b21a8', border: '#d8b4fe' },
    loyalty: { bg: '#fffbeb', text: '#92400e', border: '#fcd34d' },
  };
  const mk        = (bill.paymentMethod ?? '').toLowerCase();
  const mKey      = Object.keys(methodColors).find((k) => mk.includes(k)) ?? '';
  const mCfg      = methodColors[mKey] ?? { bg: '#f9fafb', text: '#4b5563', border: '#e5e7eb' };

  const [datePart, timePart] = bill.formattedDate
    ? bill.formattedDate.split('\n')
    : [
        new Date(bill.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        new Date(bill.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      ];

  return (
    <tr className={`transition-colors duration-100 hover:bg-gray-50/80 ${isSelected ? 'bg-blue-50/30' : ''}`}>
      {/* Transaction ID */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <button type="button" onClick={() => onView(bill)}
          className="text-xs font-bold hover:underline cursor-pointer text-left"
          style={{ color: ACCENT }}>
          {bill.billNumber}
        </button>
      </td>

      {/* Date & Time */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-800">{datePart}</span>
          <span className="text-[11px] text-gray-400">{timePart}</span>
        </div>
      </td>

      {/* Customer */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-gray-900">{bill.customer?.name ?? 'Walk-in Customer'}</span>
          {tierCfg && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border"
              style={{ backgroundColor: tierCfg.bg, color: tierCfg.text, borderColor: tierCfg.border }}>
              {tier}
            </span>
          )}
        </div>
      </td>

      {/* Cashier */}
      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-600">{bill.cashier ?? 'Admin'}</td>

      {/* Branch */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-800">{bill.branch ?? 'Colombo - Head'}</span>
          <span className="text-[11px] text-gray-400">{bill.registerId ?? 'Register #01'}</span>
        </div>
      </td>

      {/* Items */}
      <td className="py-3.5 px-4 whitespace-nowrap text-center text-xs font-semibold text-gray-700">
        {bill.itemsCount ?? bill.items?.length ?? 1}
      </td>

      {/* Method */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <span className="inline-block px-2.5 py-1 text-[11px] font-semibold rounded-lg border"
          style={{ backgroundColor: mCfg.bg, color: mCfg.text, borderColor: mCfg.border }}>
          {bill.paymentMethod}
        </span>
      </td>

      {/* Total */}
      <td className="py-3.5 px-4 whitespace-nowrap text-xs font-black text-gray-900">{formattedTotal}</td>

      {/* Status */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
          style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
          {cfg.label}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 whitespace-nowrap text-right">
        <button type="button" onClick={() => onView(bill)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
          <Eye size={13} /> View
        </button>
      </td>
    </tr>
  );
}
