import React, { useState } from 'react';
import { X, Printer } from 'lucide-react';

export default function BillDetailsModal({ bill, onClose, onProcessReturn }) {
    const [selectedItems, setSelectedItems] = useState([]);

    if (!bill) return null;

    const toggleItemSelection = (code) => {
        setSelectedItems(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-dialog-new" style={{ maxWidth: '720px' }}>
                <div className="modal-header-new">
                    <div className="modal-title-box">
                        <div>
                            <div className="modal-title-text">Bill Details: #{bill.id}</div>
                            <div className="modal-subtitle-text">Complete customer breakdown & items list</div>
                        </div>
                    </div>
                    <button className="modal-close-btn-new" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body-new">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
                        <div>
                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Customer Information</span>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginTop: '4px' }}>Name: {bill.customer}</div>
                            <div style={{ fontSize: '0.8125rem', color: '#475569' }}>Contact: {bill.contact || '+94 77 123 4567'}</div>
                            <div style={{ fontSize: '0.8125rem', color: '#B45309', fontWeight: 600, marginTop: '2px' }}>
                                Member Tier: {bill.tier ? `👑 ${bill.tier}` : 'STANDARD'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '2px' }}>
                                Points: {bill.points || '+50 pts'}
                            </div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Transaction Summary</span>
                            <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '4px' }}>Date & Time: {bill.dateTime}</div>
                            <div style={{ fontSize: '0.8125rem', color: '#475569' }}>Outlet: {bill.branch}</div>
                            <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                                Counter No: {bill.counter || (bill.register ? bill.register.replace('Register #', 'Counter-').replace('Reg #', 'Counter-') : 'Counter-01')}
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: '#475569' }}>Cashier: {bill.cashier}</div>
                            <div style={{ fontSize: '0.8125rem', color: '#475569' }}>Payment: {bill.method}</div>
                            <div style={{ fontSize: '0.8125rem', color: '#475569' }}>Status: {bill.status}</div>
                        </div>
                    </div>

                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Items Purchased (Select for Return / Exchange)</span>
                    <div className="table-card" style={{ marginBottom: '16px' }}>
                        <table className="data-table" style={{ fontSize: '0.8125rem' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>Return</th>
                                    <th>Item Code</th>
                                    <th>Description</th>
                                    <th>QTY</th>
                                    <th>Unit Price (LKR)</th>
                                    <th>Total (LKR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(bill.itemsList && bill.itemsList.length > 0 ? bill.itemsList : [
                                    { code: 'PRD-101', name: 'Item Sample 1', qty: 1, price: 1000, total: 1000 }
                                ]).map((item) => (
                                    <tr key={item.code}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.code)}
                                                onChange={() => toggleItemSelection(item.code)}
                                            />
                                        </td>
                                        <td><span className="sku-code">{item.code}</span></td>
                                        <td>{item.name}</td>
                                        <td>{item.qty}</td>
                                        <td>{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td>{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', fontSize: '0.875rem', paddingRight: '12px' }}>
                        <div>Subtotal: {bill.subtotal || bill.total}</div>
                        {bill.discount && <div style={{ color: '#EF4444' }}>Discount / Promo Applied: {bill.discount}</div>}
                        <div style={{ color: '#64748B' }}>Tax (0%): LKR 0.00</div>
                        <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-dark)', marginTop: '4px' }}>
                            Grand Total: {bill.total}
                        </div>
                    </div>
                </div>

                <div className="modal-footer-new">
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Printer size={16} /> Print Receipt
                    </button>
                    <button
                        className="btn-danger"
                        style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
                        disabled={selectedItems.length === 0}
                        onClick={() => onProcessReturn(selectedItems)}
                    >
                        Process Return / Exchange
                    </button>
                    <button className="btn-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}