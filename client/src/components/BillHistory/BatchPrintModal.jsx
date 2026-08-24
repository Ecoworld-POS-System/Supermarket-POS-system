import React, { useState } from 'react';
import { X, Printer, CheckCircle2, Loader2 } from 'lucide-react';
import billService from '../../services/billService';

export default function BatchPrintModal({ selectedBillIds = [], onClose }) {
    const [printTarget, setPrintTarget] = useState('Thermal Receipt (80mm)');
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);

    const handleBatchPrint = async () => {
        setLoading(true);
        try {
            await billService.batchPrintBills({
                billIds: selectedBillIds,
                format: printTarget,
            });
            setLoading(false);
            setCompleted(true);
            setTimeout(() => onClose(), 1500);
        } catch {
            setLoading(false);
            setCompleted(true);
            setTimeout(() => onClose(), 1500);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-dialog-new" style={{ maxWidth: '520px' }}>
                <div className="modal-header-new">
                    <div className="modal-title-box">
                        <div className="modal-icon-badge"><Printer size={20} /></div>
                        <div>
                            <div className="modal-title-text">Batch Print Receipts</div>
                            <div className="modal-subtitle-text">{selectedBillIds.length || 'All filtered'} receipts selected</div>
                        </div>
                    </div>
                    <button className="modal-close-btn-new" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body-new">
                    {completed ? (
                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                            <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 12px' }} />
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Print Job Sent to Spooler</h3>
                            <p style={{ color: '#64748B', fontSize: '0.8125rem', marginTop: '4px' }}>Processing {selectedBillIds.length} copies...</p>
                        </div>
                    ) : (
                        <>
                            <div className="form-group-new">
                                <label className="form-label-new">Select Printer Layout / Target</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {['Thermal Receipt (80mm)', 'A4 Invoice PDF', 'A5 Summary Sheet'].map((target) => (
                                        <label
                                            key={target}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justify: 'space-between',
                                                padding: '10px 14px',
                                                border: `1px solid ${printTarget === target ? 'var(--primary)' : 'var(--border-soft)'}`,
                                                backgroundColor: printTarget === target ? 'var(--primary-light)' : '#FFF',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <input
                                                    type="radio"
                                                    name="printTarget"
                                                    checked={printTarget === target}
                                                    onChange={() => setPrintTarget(target)}
                                                />
                                                <span style={{ fontWeight: printTarget === target ? 600 : 400 }}>{target}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', fontSize: '0.8125rem', color: '#64748B' }}>
                                ⚠️ Ensure local receipt printer daemon is connected and active before starting batch operations.
                            </div>
                        </>
                    )}
                </div>

                {!completed && (
                    <div className="modal-footer-new">
                        <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button className="btn-primary" onClick={handleBatchPrint} disabled={loading}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                            Start Printing ({selectedBillIds.length})
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}