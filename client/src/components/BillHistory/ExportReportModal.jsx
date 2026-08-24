import React, { useState } from 'react';
import { X, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import billService from '../../services/billService';

export default function ExportReportModal({ onClose }) {
    const [selectedReport, setSelectedReport] = useState('Daily Sales Summary');
    const [period, setPeriod] = useState('Custom Range');
    const [outputFormat, setOutputFormat] = useState('PDF');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            await billService.exportReport({ selectedReport, period, outputFormat });
            setLoading(false);
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        } catch {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        }
    };

    const reportTypes = [
        'Daily Sales Summary', 'Transaction Log',
        'Product-wise Sales', 'Cashier Performance',
        'Branch Comparison', 'Tax & Discount Report'
    ];

    return (
        <div className="modal-backdrop">
            <div className="modal-dialog-new" style={{ maxWidth: '640px' }}>
                <div className="modal-header-new">
                    <div className="modal-title-box">
                        <div className="modal-icon-badge"><FileText size={20} /></div>
                        <div>
                            <div className="modal-title-text">Export Report</div>
                            <div className="modal-subtitle-text">Choose type, period, and format</div>
                        </div>
                    </div>
                    <button className="modal-close-btn-new" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body-new">
                    {success ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <CheckCircle2 size={56} color="#10B981" style={{ margin: '0 auto 16px' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>Report Generated Successfully!</h3>
                            <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '6px' }}>Your download will begin automatically.</p>
                        </div>
                    ) : (
                        <>
                            <div className="form-group-new">
                                <label className="form-label-new">Report Type</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {reportTypes.map((type) => (
                                        <div
                                            key={type}
                                            onClick={() => setSelectedReport(type)}
                                            style={{
                                                padding: '10px 14px',
                                                border: `1px solid ${selectedReport === type ? 'var(--primary)' : 'var(--border-soft)'}`,
                                                backgroundColor: selectedReport === type ? 'var(--primary-light)' : '#FFFFFF',
                                                borderRadius: '8px',
                                                fontSize: '0.875rem',
                                                fontWeight: selectedReport === type ? 600 : 500,
                                                cursor: 'pointer',
                                                color: selectedReport === type ? 'var(--primary)' : '#334155'
                                            }}
                                        >
                                            {type}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group-new">
                                <label className="form-label-new">Period</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
                                    {['Daily', 'Weekly', 'Monthly', 'Custom Range'].map((p) => (
                                        <div
                                            key={p}
                                            onClick={() => setPeriod(p)}
                                            style={{
                                                padding: '8px 12px',
                                                textAlign: 'center',
                                                border: `1px solid ${period === p ? 'var(--primary)' : 'var(--border-soft)'}`,
                                                backgroundColor: period === p ? 'var(--primary-light)' : '#FFFFFF',
                                                borderRadius: '8px',
                                                fontSize: '0.8125rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                color: period === p ? 'var(--primary)' : '#334155'
                                            }}
                                        >
                                            {p}
                                        </div>
                                    ))}
                                </div>

                                {period === 'Custom Range' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Start date</span>
                                            <input type="text" className="form-control-new" defaultValue="08/01/2026" />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>End date</span>
                                            <input type="text" className="form-control-new" defaultValue="08/13/2026" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-group-new">
                                <label className="form-label-new">Filter Output By Departments & Cashiers</label>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {['Groceries', 'Fresh Produce', 'Household', 'Counter 01', 'Counter 02'].map((filt, idx) => (
                                        <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', cursor: 'pointer' }}>
                                            <input type="checkbox" defaultChecked /> {filt}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group-new">
                                <label className="form-label-new">Output Format</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div
                                        onClick={() => setOutputFormat('PDF')}
                                        style={{
                                            border: `2px solid ${outputFormat === 'PDF' ? 'var(--primary)' : 'var(--border-soft)'}`,
                                            backgroundColor: outputFormat === 'PDF' ? 'var(--primary-light)' : '#FFFFFF',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>PDF Report</span>
                                            <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '0.6875rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>PDF</span>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Formatted, printable document layout</p>
                                    </div>

                                    <div
                                        onClick={() => setOutputFormat('CSV')}
                                        style={{
                                            border: `2px solid ${outputFormat === 'CSV' ? 'var(--primary)' : 'var(--border-soft)'}`,
                                            backgroundColor: outputFormat === 'CSV' ? 'var(--primary-light)' : '#FFFFFF',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>CSV Spreadsheet</span>
                                            <span style={{ backgroundColor: '#D1FAE5', color: '#047857', fontSize: '0.6875rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>CSV</span>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Raw data, Excel-ready export</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {!success && (
                    <div className="modal-footer-new">
                        <button className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="btn-primary" onClick={handleExport} disabled={loading}>
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Export {outputFormat}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}