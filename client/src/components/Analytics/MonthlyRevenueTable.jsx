import React from 'react';

export default function MonthlyRevenueTable() {
    const monthlyData = [
        { month: 'Feb 2026', colombo: '2841k', kandy: '1620k', galle: '980k', negombo: '740k', matara: '560k', total: 'LKR 6.74M', highlight: false },
        { month: 'Mar 2026', colombo: '3120k', kandy: '1780k', galle: '1090k', negombo: '820k', matara: '630k', total: 'LKR 7.44M', highlight: false },
        { month: 'Apr 2026', colombo: '2960k', kandy: '1640k', galle: '1010k', negombo: '760k', matara: '590k', total: 'LKR 6.96M', highlight: false },
        { month: 'May 2026', colombo: '3380k', kandy: '1920k', galle: '1180k', negombo: '890k', matara: '670k', total: 'LKR 8.04M', highlight: false },
        { month: 'Jun 2026', colombo: '3540k', kandy: '2010k', galle: '1250k', negombo: '940k', matara: '720k', total: 'LKR 8.46M', highlight: false },
        { month: 'Jul 2026', colombo: '3720k', kandy: '2140k', galle: '1340k', negombo: '1010k', matara: '780k', total: 'LKR 8.99M', highlight: false },
        { month: 'Aug 2026', colombo: '3847k', kandy: '2260k', galle: '1410k', negombo: '1080k', matara: '830k', total: 'LKR 9.43M', highlight: true }
    ];

    return (
        <div className="table-card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-soft)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Monthly Revenue by Outlet</h3>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Colombo</th>
                        <th>Kandy</th>
                        <th>Galle</th>
                        <th>Negombo</th>
                        <th>Matara</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {monthlyData.map((row, idx) => (
                        <tr key={idx} style={{ backgroundColor: row.highlight ? '#EFF6FF' : 'transparent' }}>
                            <td style={{ fontWeight: row.highlight ? 700 : 500 }}>{row.month}</td>
                            <td>{row.colombo}</td>
                            <td>{row.kandy}</td>
                            <td>{row.galle}</td>
                            <td>{row.negombo}</td>
                            <td>{row.matara}</td>
                            <td><span style={{ color: 'var(--primary)', fontWeight: 700 }}>{row.total}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}