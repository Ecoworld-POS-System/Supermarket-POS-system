import React from 'react';
import BillRow from './BillRow';

export default function BillTable({ bills, onViewBill }) {
    return (
        <div className="bill-table-card">
            <table className="bill-table">
                <thead>
                    <tr>
                        <th>TRANSACTION ID</th>
                        <th>DATE & TIME</th>
                        <th>CUSTOMER</th>
                        <th>CASHIER</th>
                        <th>BRANCH / REGISTER</th>
                        <th>ITEMS</th>
                        <th>METHOD</th>
                        <th>TOTAL</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {bills.length > 0 ? (
                        bills.map((bill) => (
                            <BillRow key={bill.id} bill={bill} onView={onViewBill} />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>
                                No transactions found matching the selected filters.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}