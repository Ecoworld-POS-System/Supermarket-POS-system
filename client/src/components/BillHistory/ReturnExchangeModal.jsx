import React, { useState } from 'react';
import { X, RefreshCw, AlertCircle } from 'lucide-react';
import billService from '../../services/billService';

export default function ReturnExchangeModal({ bill, selectedItemIds = [], onClose, onSuccess }) {
    const [returnType, setReturnType] = useState('REFUND'); // REFUND or EXCHANGE
    const [reason, setReason] = useState('DEFECTIVE');
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            billId: bill?.id,
            itemIds: selectedItemIds,
            returnType,
            reason,
            remarks,
            processedAt: new Date().toISOString(),
        };

        try {
            await billService.processReturnExchange(bill?.id, payload);
            setLoading(false);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setLoading(false);
            setError(err?.response?.data?.message || 'Failed to process return/exchange. Please try again.');
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-dialog-new" style={{ maxWidth: '580px' }}>
                <div className="modal-header-new">
                    <div className="modal-title-box">
                        <div className="modal-icon-badge" style={{ background: '#FEF2F2', color: '#EF4444' }}>
                            <RefreshCw size={20} />
                        </div>
                        <div>
                            <div className="modal-title-text">Return / Exchange Request</div>
                            <div className="modal-subtitle-text">Invoice #{bill?.id || 'N/A'}</div>
                        </div>
                    </div>
                    <button className="modal-close-btn-new" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body-new">
                        {error && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '16px' }}>
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div style={{ backgroundColor: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-soft)', marginBottom: '16px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Items Selected for Return ({selectedItemIds.length})</span>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)', marginTop: '4px' }}>
                                {selectedItemIds.length > 0 ? selectedItemIds.join(', ') : 'No items pre-selected'}
                            </div>
                        </div>

                        <div className="form-group-new">
                            <label className="form-label-new">Action Type</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div
                                    onClick={() => setReturnType('REFUND')}
                                    style={{
                                        border: `2px solid ${returnType === 'REFUND' ? '#EF4444' : 'var(--border-soft)'}`,
                                        backgroundColor: returnType === 'REFUND' ? '#FEF2F2' : '#FFFFFF',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: returnType === 'REFUND' ? '#DC2626' : '#334155' }}>Issue Refund</span>
                                    <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>Return cash or credit to customer</p>
                                </div>

                                <div
                                    onClick={() => setReturnType('EXCHANGE')}
                                    style={{
                                        border: `2px solid ${returnType === 'EXCHANGE' ? 'var(--primary)' : 'var(--border-soft)'}`,
                                        backgroundColor: returnType === 'EXCHANGE' ? 'var(--primary-light)' : '#FFFFFF',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: returnType === 'EXCHANGE' ? 'var(--primary)' : '#334155' }}>Item Exchange</span>
                                    <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>Swap for replacement inventory</p>
                                </div>
                            </div>
                        </div>

                        <div className="form-group-new">
                            <label className="form-label-new">Reason for Return</label>
                            <select className="select-box" style={{ width: '100%' }} value={reason} onChange={(e) => setReason(e.target.value)}>
                                <option value="DEFECTIVE">Damaged / Defective Product</option>
                                <option value="WRONG_ITEM">Incorrect Item Issued</option>
                                <option value="EXPIRED">Near Expiry / Expired</option>
                                <option value="CUSTOMER_CHANGE">Customer Changed Mind</option>
                            </select>
                        </div>

                        <div className="form-group-new">
                            <label className="form-label-new">Additional Remarks / Cashier Notes</label>
                            <textarea
                                className="form-control-new"
                                rows="3"
                                placeholder="Enter details regarding item condition or inspection notes..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <div className="modal-footer-new">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-danger" disabled={loading}>
                            {loading ? 'Processing...' : `Confirm ${returnType === 'REFUND' ? 'Refund' : 'Exchange'}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}