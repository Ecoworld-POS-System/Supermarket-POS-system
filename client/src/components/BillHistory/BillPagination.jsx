import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BillPagination({ currentPage = 1, totalPages = 10, onPageChange, totalRecords = 0, pageSize = 10 }) {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalRecords);

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--border-soft)', marginTop: '16px' }}>
            <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                Showing <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{startItem}</span> to <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{endItem}</span> of <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{totalRecords}</span> entries
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <ChevronLeft size={14} /> Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: currentPage === page ? 'var(--primary)' : 'var(--border-soft)',
                            backgroundColor: currentPage === page ? 'var(--primary)' : '#FFFFFF',
                            color: currentPage === page ? '#FFFFFF' : 'var(--text-dark)',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                        }}
                    >
                        {page}
                    </button>
                ))}

                <button
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    Next <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}