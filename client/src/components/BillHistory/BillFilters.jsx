import React from 'react';
import { Search, Calendar } from 'lucide-react';

export default function BillFilters({ filters, setFilters, totalRecords }) {
    return (
        <div className="bill-filter-container">
            <div className="bill-search-wrapper">
                <Search className="bill-search-icon" size={16} />
                <input
                    type="text"
                    className="bill-search-input"
                    placeholder="Search ID, customer, cashier..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
            </div>

            <div className="bill-filters-group">
                <select
                    className="bill-select"
                    value={filters.outlet}
                    onChange={(e) => setFilters({ ...filters, outlet: e.target.value })}
                >
                    <option value="All">All Outlets</option>
                    <option value="Colombo - Head">Colombo - Head</option>
                    <option value="Kandy - City">Kandy - City</option>
                    <option value="Galle - Fort">Galle - Fort</option>
                    <option value="Negombo - Beach">Negombo - Beach</option>
                    <option value="Matara Branch">Matara Branch</option>
                </select>

                <select
                    className="bill-select"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="All">All Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Refunded">Refunded</option>
                    <option value="Pending">Pending</option>
                    <option value="Exchanged">Exchanged</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                <select
                    className="bill-select"
                    value={filters.method}
                    onChange={(e) => setFilters({ ...filters, method: e.target.value })}
                >
                    <option value="All">All Methods</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Voucher">Voucher</option>
                    <option value="Point">Points</option>
                </select>

                <div className="bill-date-box">
                    <span>08/01/2026 &nbsp;to&nbsp; 08/13/2026</span>
                    <Calendar size={15} color="#64748B" />
                </div>

                <span className="bill-records-count">{totalRecords} records</span>
            </div>
        </div>
    );
}
