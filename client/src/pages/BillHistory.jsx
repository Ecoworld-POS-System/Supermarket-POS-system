import React, { useState, useMemo } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import BillFilters from '../components/BillHistory/BillFilters';
import BillTable from '../components/BillHistory/BillTable';
import BillDetailsModal from '../components/BillHistory/BillDetailsModal';
import ExportReportModal from '../components/BillHistory/ExportReportModal';
import BatchPrintModal from '../components/BillHistory/BatchPrintModal';
import { Download, Printer } from 'lucide-react';

export default function BillHistoryPage() {
    const [selectedBill, setSelectedBill] = useState(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showBatchPrintModal, setShowBatchPrintModal] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        outlet: 'All',
        status: 'All',
        method: 'All',
    });

    const mockBills = useMemo(() => [
        {
            id: 'TXN-2026-0840',
            dateTime: '13 Aug 2026, 09:56 AM',
            customer: 'Jude Fernando',
            tier: 'STANDARD',
            cashier: 'Dilan P.',
            branch: 'Kandy - City',
            register: 'Register #04',
            counter: 'Counter-01',
            items: 2,
            method: 'Gift Voucher',
            total: 'LKR 4,170',
            status: 'Pending',
            contact: '+94 77 334 1122',
            points: '+41 pts (Bal: 240)',
            itemsList: [
                { code: 'PRD-101', name: 'Fresh Milk 1L', qty: 2, price: 585.00, total: 1170.00 },
                { code: 'PRD-104', name: 'Premium Rice 5kg', qty: 1, price: 3000.00, total: 3000.00 },
            ],
            subtotal: 'LKR 4,170.00',
            discount: 'LKR 0.00',
        },
        {
            id: 'TXN-2026-0841',
            dateTime: '13 Aug 2026, 09:44 AM',
            customer: 'Madhavi Jayasuriya',
            tier: 'SILVER',
            cashier: 'Nethmi R.',
            branch: 'Galle - Fort',
            register: 'Register #01',
            counter: 'Counter-02',
            items: 1,
            method: 'Card',
            total: 'LKR 7,890',
            status: 'Refunded',
            contact: '+94 71 556 7788',
            points: '0 pts (Bal: 580)',
            itemsList: [
                { code: 'PRD-201', name: 'Imported Olive Oil 1L', qty: 1, price: 7890.00, total: 7890.00 },
            ],
            subtotal: 'LKR 7,890.00',
            discount: 'LKR 0.00',
        },
        {
            id: 'TXN-2026-0842',
            dateTime: '13 Aug 2026, 09:20 AM',
            customer: 'Rukshan de Alwis',
            tier: 'GOLD',
            cashier: 'Amara S.',
            branch: 'Negombo - Beach',
            register: 'Register #03',
            counter: 'Counter-01',
            items: 1,
            method: 'Cash',
            total: 'LKR 2,650',
            status: 'Exchanged',
            contact: '+94 70 889 0011',
            points: '+26 pts (Bal: 1,210)',
            itemsList: [
                { code: 'PRD-301', name: 'Ceylon Spice Pack', qty: 1, price: 2650.00, total: 2650.00 },
            ],
            subtotal: 'LKR 2,650.00',
            discount: 'LKR 0.00',
        },
        {
            id: 'TXN-2026-0843',
            dateTime: '12 Aug 2026, 08:58 PM',
            customer: 'Farah Nizam',
            tier: 'GOLD',
            cashier: 'Raveendra K.',
            branch: 'Colombo - Head',
            register: 'Register #01',
            counter: 'Counter-02',
            items: 1,
            method: 'Loyalty Points',
            total: 'LKR 1,920',
            status: 'Completed',
            contact: '+94 76 112 3344',
            points: '-1,920 pts (Redeemed)',
            itemsList: [
                { code: 'PRD-401', name: 'Organic Honey 250g', qty: 1, price: 1920.00, total: 1920.00 },
            ],
            subtotal: 'LKR 1,920.00',
            discount: 'LKR 0.00',
        },
        {
            id: 'TXN-2026-0844',
            dateTime: '13 Aug 2026, 10:42 AM',
            customer: 'Kasun Perera',
            tier: 'GOLD',
            cashier: 'Sachini M.',
            branch: 'Colombo - Head',
            register: 'Register #02',
            counter: 'Counter-01',
            items: 4,
            method: 'Cash',
            total: 'LKR 12,377',
            status: 'Completed',
            contact: '+94 77 123 4567',
            points: '+124 pts (Bal: 1,450)',
            itemsList: [
                { code: 'PRD-101', name: 'Basmati Rice 5kg', qty: 2, price: 3500.00, total: 7000.00 },
                { code: 'PRD-102', name: 'Anchor Milk Powder 400g', qty: 1, price: 1250.00, total: 1250.00 },
                { code: 'PRD-105', name: 'Sunlight Detergent 1kg', qty: 1, price: 950.00, total: 950.00 },
                { code: 'PRD-108', name: 'Dilmah Tea 500g', qty: 2, price: 1588.50, total: 3177.00 },
            ],
            subtotal: 'LKR 12,450.00',
            discount: 'LKR 73.00',
        },
        {
            id: 'TXN-2026-0845',
            dateTime: '13 Aug 2026, 10:31 AM',
            customer: 'Nilufar Silva',
            tier: 'SILVER',
            cashier: 'Raveendra K.',
            branch: 'Colombo - Head',
            register: 'Register #01',
            counter: 'Counter-02',
            items: 2,
            method: 'Card',
            total: 'LKR 686',
            status: 'Completed',
            contact: '+94 71 889 2341',
            points: '+14 pts (Bal: 320)',
            itemsList: [
                { code: 'PRD-201', name: 'Coca Cola 1.5L', qty: 1, price: 420.00, total: 420.00 },
                { code: 'PRD-204', name: 'Marie Biscuits 200g', qty: 2, price: 133.00, total: 266.00 },
            ],
            subtotal: 'LKR 686.00',
            discount: 'LKR 0.00',
        },
    ], []);

    const filteredBills = useMemo(() => {
        return mockBills.filter((bill) => {
            if (filters.search) {
                const query = filters.search.toLowerCase().trim();
                const matchesSearch =
                    bill.id.toLowerCase().includes(query) ||
                    bill.customer.toLowerCase().includes(query) ||
                    bill.cashier.toLowerCase().includes(query) ||
                    bill.branch.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }
            if (filters.outlet !== 'All') {
                if (!bill.branch.toLowerCase().includes(filters.outlet.toLowerCase())) {
                    return false;
                }
            }
            if (filters.status !== 'All') {
                if (bill.status.toLowerCase() !== filters.status.toLowerCase()) {
                    return false;
                }
            }
            if (filters.method !== 'All') {
                const methodFilter = filters.method.toLowerCase();
                const billMethod = bill.method.toLowerCase();
                if (!billMethod.includes(methodFilter) && !methodFilter.includes(billMethod)) {
                    return false;
                }
            }
            return true;
        });
    }, [mockBills, filters]);

    return (
        <AppLayout activeMenu="Bill History" breadcrumb={['EGOTECH WORLD', 'Bill History']}>
            <div className="content-view">
                <div className="view-header">
                    <div>
                        <h1 className="page-title-main">Bill History</h1>
                        <p className="header-summary-subtitle">Full transaction log • Aug 2026</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-secondary" onClick={() => setShowBatchPrintModal(true)}>
                            <Printer size={16} /> Batch Print
                        </button>
                        <button className="btn-primary" onClick={() => setShowExportModal(true)}>
                            <Download size={16} /> Export Report
                        </button>
                    </div>
                </div>

                <BillFilters
                    filters={filters}
                    setFilters={setFilters}
                    totalRecords={filteredBills.length}
                />
                <BillTable bills={filteredBills} onViewBill={(bill) => setSelectedBill(bill)} />

                {selectedBill && (
                    <BillDetailsModal
                        bill={selectedBill}
                        onClose={() => setSelectedBill(null)}
                        onProcessReturn={(items) => console.log('Process Return:', items)}
                    />
                )}

                {showExportModal && (
                    <ExportReportModal onClose={() => setShowExportModal(false)} />
                )}

                {showBatchPrintModal && (
                    <BatchPrintModal
                        selectedBillIds={filteredBills.map((b) => b.id)}
                        onClose={() => setShowBatchPrintModal(false)}
                    />
                )}
            </div>
        </AppLayout>
    );
}
