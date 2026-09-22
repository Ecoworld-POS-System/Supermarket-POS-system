import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const ACCENT = '#6B9CD2';

export default function BillHistoryPagination({
  currentPage = 1, totalPages = 1, pageSize = 10,
  totalRecords, totalItems, pageSizeOptions = [5, 10, 25, 50],
  onPageChange = () => {}, onPageSizeChange = () => {}, className = '',
}) {
  const total    = totalRecords ?? totalItems ?? 0;
  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem   = Math.min(total, currentPage * pageSize);

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('…');
    const lo = Math.max(2, currentPage - 1);
    const hi = Math.min(totalPages - 1, currentPage + 1);
    for (let i = lo; i <= hi; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  const navBtn = 'p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors';

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2 text-xs text-gray-500 ${className}`}>
      <div className="flex items-center gap-3 flex-wrap">
        <span>
          Showing <strong className="text-gray-800">{startItem}</strong> – <strong className="text-gray-800">{endItem}</strong>{' '}
          of <strong className="text-gray-800">{total}</strong> transactions
        </span>
        <span className="hidden sm:inline text-gray-300">|</span>
        <label htmlFor="page-size-sel" className="hidden sm:inline text-gray-400">Rows:</label>
        <select id="page-size-sel" value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 text-xs font-semibold bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none cursor-pointer">
          {pageSizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPageChange(1)} disabled={currentPage === 1} className={navBtn}><ChevronsLeft size={14} /></button>
        <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={navBtn}><ChevronLeft size={14} /></button>

        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((num, i) =>
            typeof num === 'string' ? (
              <span key={`d-${i}`} className="px-2 text-gray-400 select-none">{num}</span>
            ) : (
              <button key={num} type="button" onClick={() => onPageChange(num)}
                className="min-w-[28px] h-7 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer border"
                style={currentPage === num
                  ? { backgroundColor: ACCENT, color: '#ffffff', borderColor: ACCENT }
                  : { backgroundColor: '#ffffff', color: '#374151', borderColor: '#e5e7eb' }}>
                {num}
              </button>
            )
          )}
        </div>

        <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages} className={navBtn}><ChevronRight size={14} /></button>
        <button type="button" onClick={() => onPageChange(totalPages)} disabled={currentPage >= totalPages} className={navBtn}><ChevronsRight size={14} /></button>
      </div>
    </div>
  );
}
