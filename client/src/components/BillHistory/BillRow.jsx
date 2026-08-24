import React from 'react';

export default function BillRow({ bill, onView }) {
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'status-pill-completed';
            case 'refunded':
                return 'status-pill-refunded';
            case 'exchanged':
                return 'status-pill-exchanged';
            case 'pending':
            default:
                return 'status-pill-pending';
        }
    };

    return (
        <tr>
            <td>
                <span className="txn-blue-id" onClick={() => onView(bill)}>
                    {bill.id}
                </span>
            </td>
            <td>{bill.dateTime}</td>
            <td>
                <div className="customer-cell">
                    <span>{bill.customer}</span>
                    {bill.tier && (
                        <span className="tier-pill">
                            {bill.tier}
                        </span>
                    )}
                </div>
            </td>
            <td>{bill.cashier}</td>
            <td>
                <div>
                    <div className="branch-text-main">{bill.branch}</div>
                    {bill.register && <div className="branch-text-sub">{bill.register}</div>}
                </div>
            </td>
            <td>{bill.items}</td>
            <td>
                <span className="method-box">{bill.method}</span>
            </td>
            <td>
                <span className="total-amount">{bill.total}</span>
            </td>
            <td>
                <span className={getStatusClass(bill.status)}>
                    <span className="status-pill-dot"></span>
                    {bill.status}
                </span>
            </td>
            <td>
                <button className="btn-action-view" onClick={() => onView(bill)}>
                    View
                </button>
            </td>
        </tr>
    );
}
