import React, { useState, useMemo, useEffect, useCallback } from 'react';
import BillHistoryFilters from './BillHistoryFilters';
import BillHistoryTable from './BillHistoryTable';
import BillHistoryPagination from './BillHistoryPagination';
import BillDetailsModal from './BillDetailsModal';
import ExportReportModal from './ExportReportModal';
import BatchPrintModal from './BatchPrintModal';
import billService from '../../services/billService';
import { Download, Printer, TrendingUp, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';

const ACCENT = '#6B9CD2';

/* ─────────────────────────────────────────────────────────────
   Shape mapper: MongoDB BillHistory document → UI bill object
   MongoDB fields:  transactionId, dateTime, customer{name,contact,tier},
                    cashier, outlet, registerNo, items[{itemCode,description,qty,unitPrice,total}],
                    paymentMethod, subtotal, discount, tax, grandTotal, status
   UI fields:       billNumber, createdAt, formattedDate, customer{name,phone,tier},
                    cashier, branch, registerId, items[{name,quantity,unitPrice,lineTotal}],
                    paymentMethod, subtotal, discount, tax, grandTotal, status
───────────────────────────────────────────────────────────── */
function mapMongoToUI(doc) {
  const dt = doc.dateTime ? new Date(doc.dateTime) : new Date(doc.createdAt || Date.now());
  const datePart = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timePart = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Derive outletId key from outlet string for filter matching
  const outletLower = (doc.outlet || '').toLowerCase();
  let outletId = 'colombo';
  if (outletLower.includes('kandy'))   outletId = 'kandy';
  else if (outletLower.includes('galle'))   outletId = 'galle';
  else if (outletLower.includes('negombo')) outletId = 'negombo';
  else if (outletLower.includes('matara'))  outletId = 'matara';

  return {
    // identity
    id:           doc._id?.toString() ?? doc.transactionId,
    billNumber:   doc.transactionId ?? doc.billNumber ?? '—',
    // dates
    createdAt:    doc.dateTime ?? doc.createdAt,
    formattedDate: `${datePart}\n${timePart}`,
    // customer — keep nested shape BillHistoryRow expects
    customer: {
      name:          doc.customer?.name  ?? 'Walk-in Customer',
      phone:         doc.customer?.contact ?? null,
      tier:          doc.customer?.tier  ?? 'STANDARD',
      loyaltyPoints: doc.customer?.loyaltyPoints ?? 0,
      earnedPoints:  doc.customer?.earnedPoints  ?? 0,
    },
    // staff / location
    cashier:    doc.cashier    ?? 'Admin',
    counterId:  doc.counterId  ?? null,
    branch:     doc.outlet     ?? 'Colombo - Head',
    outletId,
    registerId: doc.registerNo ?? doc.registerId ?? 'Register #01',
    // items — map MongoDB item shape to UI shape
    itemsCount: doc.items?.length ?? 0,
    items: (doc.items ?? []).map((i) => ({
      name:      i.description ?? i.name ?? 'Item',
      quantity:  i.qty         ?? i.quantity ?? 1,
      unitPrice: i.unitPrice   ?? 0,
      lineTotal: i.total       ?? i.lineTotal ?? (i.unitPrice * (i.qty ?? 1)),
    })),
    // financials
    subtotal:    doc.subtotal   ?? doc.grandTotal ?? 0,
    discount:    doc.discount   ?? 0,
    tax:         doc.tax        ?? 0,
    grandTotal:  doc.grandTotal ?? 0,
    paymentMethod: doc.paymentMethod ?? '—',
    status:      doc.status     ?? 'Completed',
  };
}

const PAGE_SIZE_OPTIONS = [5, 10, 15, 25];

export default function BillHistoryView() {
  // ── Data state ──────────────────────────────────────────────
  const [allBills,   setAllBills]   = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [isLive,     setIsLive]     = useState(false); // true = data came from API
  const [fetchError, setFetchError] = useState(null);

  // ── Modal / UI state ────────────────────────────────────────
  const [selectedBill,       setSelectedBill]       = useState(null);
  const [showExportModal,    setShowExportModal]     = useState(false);
  const [showBatchPrintModal,setShowBatchPrintModal] = useState(false);

  // ── Filter state ────────────────────────────────────────────
  const [filters, setFilters] = useState({
    search: '', outlet: 'all', status: 'all', method: 'all',
    dateRange: { start: '08/01/2026', end: '08/13/2026' },
  });

  // ── Pagination state ────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize,    setPageSize]    = useState(10);

  /* ── Fetch from backend ──────────────────────────────────── */
  const fetchBills = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const result = await billService.getBillHistory({ limit: 200 });
      if (result?.success && Array.isArray(result.data)) {
        // Always use live data — even if empty array (0 bills in DB)
        setAllBills(result.data.map(mapMongoToUI));
        setIsLive(true);
      } else {
        setAllBills([]);
        setIsLive(false);
        setFetchError('Unexpected response from server. Please retry.');
      }
    } catch (err) {
      setAllBills([]);
      setIsLive(false);
      setFetchError(`Could not reach backend: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  /* ── Reset to page 1 on filter change ───────────────────── */
  const prevFiltersRef = React.useRef(filters);
  useEffect(() => {
    if (prevFiltersRef.current !== filters) {
      setCurrentPage(1);
      prevFiltersRef.current = filters;
    }
  }, [filters]);

  /* ── Client-side filter ──────────────────────────────────── */
  const filteredBills = useMemo(() => {
    return allBills.filter((bill) => {
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const hay = [bill.billNumber, bill.customer?.name, bill.cashier, bill.branch]
          .join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.outlet !== 'all' && bill.outletId !== filters.outlet) return false;
      if (filters.status !== 'all' && (bill.status ?? '').toLowerCase() !== filters.status.toLowerCase()) return false;
      if (filters.method !== 'all') {
        const m  = filters.method.toLowerCase();
        const bm = (bill.paymentMethod ?? '').toLowerCase();
        if (!bm.includes(m) && !m.includes(bm)) return false;
      }
      return true;
    });
  }, [allBills, filters]);

  /* ── Paginate ────────────────────────────────────────────── */
  const totalPages     = Math.max(1, Math.ceil(filteredBills.length / pageSize));
  const paginatedBills = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBills.slice(start, start + pageSize);
  }, [filteredBills, currentPage, pageSize]);

  /* ── Summary metrics ─────────────────────────────────────── */
  const metrics = useMemo(() => {
    const completed = allBills.filter((b) => b.status === 'Completed');
    const pending   = allBills.filter((b) => b.status === 'Pending');
    const voided    = allBills.filter((b) => ['Cancelled', 'Refunded', 'Exchanged'].includes(b.status));
    return {
      totalRevenue:   completed.reduce((s, b) => s + (b.grandTotal || 0), 0),
      completedCount: completed.length,
      pendingCount:   pending.length,
      cancelledCount: voided.length,
    };
  }, [allBills]);

  const fmt = (n) => `LKR ${Number(n).toLocaleString('en-LK')}`;

  return (
    <div className="min-h-full bg-gray-50">

      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Bill History</h1>
          <p className="text-sm font-medium mt-0.5 flex items-center gap-2" style={{ color: ACCENT }}>
            Full transaction log • Aug 2026
            {/* Live / offline indicator */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isLive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {isLive ? 'Live' : 'Sample data'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button type="button" onClick={fetchBills} disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            title="Refresh from database">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button type="button" onClick={() => setShowBatchPrintModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
            <Printer size={15} /> Batch Print
          </button>
          <button type="button" onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
            style={{ backgroundColor: ACCENT }}>
            <Download size={15} /> Export Report
          </button>
        </div>
      </div>

      {/* ── Backend error banner ─────────────────────────────── */}
      {fetchError && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-700 font-medium flex items-center gap-2">
          <span>⚠</span> {fetchError}
          <button type="button" onClick={fetchBills}
            className="ml-auto underline cursor-pointer hover:text-amber-900">
            Retry
          </button>
        </div>
      )}

      {/* ── Summary Metric Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Revenue</p>
            <TrendingUp size={16} style={{ color: ACCENT }} />
          </div>
          <p className="text-2xl font-black mt-1" style={{ color: ACCENT }}>{fmt(metrics.totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">From completed bills</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Completed</p>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.completedCount}</p>
          <p className="text-xs text-gray-400 mt-1">Transactions</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pending</p>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500 mt-1">{metrics.pendingCount}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting confirmation</p>
        </div>
        <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cancelled / Refunded</p>
            <XCircle size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-500 mt-1">{metrics.cancelledCount}</p>
          <p className="text-xs text-gray-400 mt-1">Voided transactions</p>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────── */}
      <BillHistoryFilters
        filters={filters} setFilters={setFilters}
        totalRecords={filteredBills.length} className="mb-4"
      />

      {/* ── Table ────────────────────────────────────────────── */}
      <BillHistoryTable
        bills={paginatedBills} isLoading={isLoading}
        onViewBill={setSelectedBill} className="mb-4"
      />

      {/* ── Pagination ───────────────────────────────────────── */}
      {filteredBills.length > 0 && (
        <BillHistoryPagination
          currentPage={currentPage} totalPages={totalPages}
          pageSize={pageSize} totalRecords={filteredBills.length}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={setCurrentPage}
          onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        />
      )}

      {/* ── Modals ───────────────────────────────────────────── */}
      {selectedBill && (
        <BillDetailsModal bill={selectedBill} onClose={() => setSelectedBill(null)} />
      )}
      {showExportModal && (
        <ExportReportModal onClose={() => setShowExportModal(false)} />
      )}
      {showBatchPrintModal && (
        <BatchPrintModal
          selectedBillIds={filteredBills.map((b) => b.billNumber)}
          onClose={() => setShowBatchPrintModal(false)}
        />
      )}
    </div>
  );
}
