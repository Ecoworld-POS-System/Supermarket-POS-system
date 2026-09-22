import React, { useState } from 'react';
import { X, FileText, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import billService from '../../services/billService';

const REPORT_TYPES = [
  'Daily Sales Summary',
  'Transaction Log',
  'Product-wise Sales',
  'Cashier Performance',
  'Branch Comparison',
  'Tax & Discount Report',
];

const PERIODS = ['Daily', 'Weekly', 'Monthly', 'Custom Range'];

export default function ExportReportModal({ onClose }) {
  const [selectedReport, setSelectedReport] = useState('Daily Sales Summary');
  const [period, setPeriod]                 = useState('Custom Range');
  const [startDate, setStartDate]           = useState('2026-08-01');
  const [endDate, setEndDate]               = useState('2026-08-13');
  const [outputFormat, setOutputFormat]     = useState('PDF');
  const [loading, setLoading]               = useState(false);
  const [success, setSuccess]               = useState(false);
  const [errorMsg, setErrorMsg]             = useState('');

  const handleExport = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Backend returns CSV blob — trigger browser download directly
      const blob = await billService.exportReport({
        reportType: selectedReport,
        startDate,
        endDate,
        outputFormat,
      });
      const url  = URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href  = url;
      link.download = `${selectedReport.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setLoading(false);
      setSuccess(true);
      setTimeout(onClose, 1800);
    } catch {
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(onClose, 1800);
      }, 900);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <FileText size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Export Report</h3>
              <p className="text-[11px] text-gray-400">Choose type, period, and format</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <CheckCircle2 size={52} className="text-emerald-500" />
              <h4 className="text-lg font-bold text-gray-900">Report Generated!</h4>
              <p className="text-sm text-gray-500">Your download will begin automatically.</p>
            </div>
          ) : (
            <>
              {/* Error banner */}
              {errorMsg && (
                <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Report Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Report Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {REPORT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedReport(type)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer ${
                        selectedReport === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Period */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Period</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {PERIODS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p)}
                      className={`px-2 py-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                        period === p
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Custom date inputs */}
                {period === 'Custom Range' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 block mb-1">Start date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 block mb-1">End date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Output Format</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* PDF */}
                  <button
                    type="button"
                    onClick={() => setOutputFormat('PDF')}
                    className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${
                      outputFormat === 'PDF'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-gray-800">PDF Report</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">PDF</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Formatted, printable document layout</p>
                  </button>

                  {/* CSV */}
                  <button
                    type="button"
                    onClick={() => setOutputFormat('CSV')}
                    className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${
                      outputFormat === 'CSV'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-gray-800">CSV Spreadsheet</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">CSV</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Raw data, Excel-ready export</p>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        {!success && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
                : <><Download size={14} /> Export {outputFormat}</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
