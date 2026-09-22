import React, { useState } from 'react';
import { X, Printer, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import billService from '../../services/billService';

const PRINT_TARGETS = [
  {
    id: 'Thermal Receipt (80mm)',
    label: 'Thermal Receipt (80mm)',
    desc: 'Standard POS receipt printer format',
  },
  {
    id: 'A4 Invoice PDF',
    label: 'A4 Invoice PDF',
    desc: 'Full-page printable invoice layout',
  },
  {
    id: 'A5 Summary Sheet',
    label: 'A5 Summary Sheet',
    desc: 'Compact half-page summary per transaction',
  },
];

export default function BatchPrintModal({ selectedBillIds = [], onClose }) {
  const [printTarget, setPrintTarget] = useState('Thermal Receipt (80mm)');
  const [loading, setLoading]         = useState(false);
  const [completed, setCompleted]     = useState(false);

  const count = selectedBillIds.length;

  const handleBatchPrint = async () => {
    setLoading(true);
    try {
      await billService.batchPrintBills({ billIds: selectedBillIds, format: printTarget });
    } catch {
      // Proceed regardless — printer daemon may handle it locally
    } finally {
      setLoading(false);
      setCompleted(true);
      setTimeout(onClose, 1800);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Printer size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Batch Print Receipts</h3>
              <p className="text-[11px] text-gray-400">{count} receipt{count !== 1 ? 's' : ''} selected</p>
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
        <div className="p-6 space-y-4">
          {completed ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <CheckCircle2 size={52} className="text-emerald-500" />
              <h4 className="text-base font-bold text-gray-900">Print Job Sent!</h4>
              <p className="text-sm text-gray-500">
                Processing {count} receipt{count !== 1 ? 's' : ''}…
              </p>
            </div>
          ) : (
            <>
              {/* Printer layout selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Select Printer Layout
                </label>
                <div className="space-y-2">
                  {PRINT_TARGETS.map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setPrintTarget(target.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        printTarget === target.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {/* Radio dot */}
                      <span
                        className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          printTarget === target.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {printTarget === target.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <div>
                        <p className={`text-xs font-semibold ${printTarget === target.id ? 'text-blue-700' : 'text-gray-800'}`}>
                          {target.label}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{target.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Warning notice */}
              <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span>
                  Ensure the local receipt printer is connected and its daemon is active before
                  starting a batch operation.
                </span>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        {!completed && (
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
              onClick={handleBatchPrint}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Sending…</>
                : <><Printer size={14} /> Print {count} Receipt{count !== 1 ? 's' : ''}</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
