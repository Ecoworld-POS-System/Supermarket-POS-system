import BillHistory from '../models/BillHistory.js';
import CheckoutBill from '../models/Bill.js';
import mongoose from 'mongoose';

/* ─────────────────────────────────────────────────────────────
   Normalise a pos_checkout_bills document into the same shape
   as a billhistories document so the UI mapper works on both.
───────────────────────────────────────────────────────────── */
function normaliseCheckoutBill(doc) {
  return {
    _id:           doc._id,
    transactionId: doc.billNumber,
    dateTime:      doc.createdAt,
    customer: {
      name:    'Walk-in Customer',
      contact: null,
      tier:    'STANDARD',
    },
    cashier:    doc.cashier ?? 'Admin',
    outlet:     'Colombo - Head',
    registerNo: 'Register #01',
    items: (doc.items ?? []).map((i) => ({
      itemCode:    i.productId?.toString() ?? 'N/A',
      description: i.name,
      qty:         i.quantity,
      unitPrice:   i.unitPrice,
      total:       i.lineTotal,
    })),
    paymentMethod: doc.paymentMethod,
    subtotal:      doc.subtotal,
    discount:      doc.discount  ?? 0,
    tax:           doc.tax       ?? 0,
    grandTotal:    doc.grandTotal,
    status:        'Completed',
    createdAt:     doc.createdAt,
    updatedAt:     doc.createdAt,
    _source:       'checkout',
  };
}

// ── Diagnostic: check what collections exist and their counts ──────────────
export const getDiagnostics = async (_req, res) => {
    try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const counts = {};
        for (const col of collections) {
            counts[col.name] = await db.collection(col.name).countDocuments();
        }
        res.json({ success: true, database: db.databaseName, collections: counts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get Bills from BOTH collections — bills (manual inserts) + pos_checkout_bills (POS checkout)
export const getBills = async (req, res) => {
    try {
        const { search, outlet, status, method, startDate, endDate, page = 1, limit = 10 } = req.query;

        // ── Build filter for BillHistory (bills collection) ──────────
        const historyQuery = {};
        if (search) {
            historyQuery.$or = [
                { transactionId: { $regex: search, $options: 'i' } },
                { 'customer.name': { $regex: search, $options: 'i' } },
                { cashier: { $regex: search, $options: 'i' } },
            ];
        }
        if (outlet && outlet !== 'All Outlets') historyQuery.outlet = outlet;
        if (status && status !== 'All Status')   historyQuery.status = status;
        if (method && method !== 'All Methods')  historyQuery.paymentMethod = method;
        if (startDate && endDate) {
            historyQuery.dateTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // ── Build filter for CheckoutBill (pos_checkout_bills) ───────
        const checkoutQuery = {};
        if (search) {
            checkoutQuery.$or = [
                { billNumber: { $regex: search, $options: 'i' } },
                { cashier:    { $regex: search, $options: 'i' } },
            ];
        }
        if (method && method !== 'All Methods') checkoutQuery.paymentMethod = method;
        if (startDate && endDate) {
            checkoutQuery.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        // outlet/status filters don't apply to checkout bills (no outlet field)

        // ── Query both collections in parallel ───────────────────────
        const [historyBills, checkoutBills] = await Promise.all([
            BillHistory.find(historyQuery).lean(),
            CheckoutBill.find(checkoutQuery).lean(),
        ]);

        // Normalise checkout bills to the history shape
        const normalisedCheckout = checkoutBills.map(normaliseCheckoutBill);

        // Merge and sort by date descending
        const allBills = [...historyBills, ...normalisedCheckout].sort((a, b) => {
            const aDate = new Date(a.dateTime ?? a.createdAt ?? 0).getTime();
            const bDate = new Date(b.dateTime ?? b.createdAt ?? 0).getTime();
            return bDate - aDate;
        });

        // Paginate in application layer (after merge)
        const total      = allBills.length;
        const pageNum    = Number(page);
        const limitNum   = Number(limit);
        const paginated  = allBills.slice((pageNum - 1) * limitNum, pageNum * limitNum);

        res.json({ success: true, total, data: paginated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get Single Bill by ID or Transaction ID — searches both collections
export const getBillById = async (req, res) => {
    try {
        const { id } = req.params;

        // Try BillHistory first (transactionId or _id)
        let bill = await BillHistory.findById(id).catch(() => null)
                ?? await BillHistory.findOne({ transactionId: id }).lean();

        // Fall back to CheckoutBill (billNumber or _id)
        if (!bill) {
            const checkout = await CheckoutBill.findById(id).catch(() => null)
                          ?? await CheckoutBill.findOne({ billNumber: id }).lean();
            if (checkout) bill = normaliseCheckoutBill(checkout);
        }

        if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
        res.json({ success: true, data: bill });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Batch Print Receipts
export const batchPrintReceipts = async (req, res) => {
    try {
        const ids = req.body.ids || req.body.billIds || [];
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ success: false, message: 'Invalid or missing receipt IDs array' });
        }
        const bills = await BillHistory.find({
            $or: [
                { _id: { $in: ids.filter(id => id.length === 24) } },
                { transactionId: { $in: ids } }
            ]
        });
        res.json({ success: true, count: bills.length, data: bills });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Export Report Data Generator — returns CSV file download
export const exportReportData = async (req, res) => {
    try {
        const { startDate, endDate, outlet } = req.query;
        const historyQuery = {};
        if (startDate && endDate) historyQuery.dateTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
        if (outlet && outlet !== 'All Outlets') historyQuery.outlet = outlet;

        const historyBills  = await BillHistory.find(historyQuery).sort({ dateTime: -1 }).lean();
        const checkoutBills = await CheckoutBill.find(startDate && endDate
            ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } }
            : {}).lean();
        const allBills = [...historyBills, ...checkoutBills.map(normaliseCheckoutBill)]
            .sort((a, b) => new Date(b.dateTime ?? b.createdAt) - new Date(a.dateTime ?? a.createdAt));

        const headers = ['Transaction ID','Date','Customer','Tier','Cashier','Outlet','Register','Items','Payment Method','Subtotal','Discount','Tax','Grand Total','Status'];
        const rows = allBills.map((b) => [
            b.transactionId, b.dateTime ? new Date(b.dateTime).toLocaleString('en-GB') : '',
            b.customer?.name ?? '', b.customer?.tier ?? '', b.cashier, b.outlet, b.registerNo,
            b.items?.length ?? 0, b.paymentMethod, b.subtotal, b.discount ?? 0, b.tax ?? 0, b.grandTotal, b.status,
        ].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`));

        const csv = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="bill-history-export-${Date.now()}.csv"`);
        res.status(200).send(csv);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Sales Analytics Summary — aggregates across both collections
export const getSalesAnalytics = async (req, res) => {
    try {
        const [historySummary, checkoutSummary] = await Promise.all([
            BillHistory.aggregate([
                { $match: { status: 'Completed' } },
                { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' }, totalTransactions: { $sum: 1 }, avgBillValue: { $avg: '$grandTotal' } } },
            ]),
            CheckoutBill.aggregate([
                { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' }, totalTransactions: { $sum: 1 }, avgBillValue: { $avg: '$grandTotal' } } },
            ]),
        ]);

        const h = historySummary[0]  ?? { totalRevenue: 0, totalTransactions: 0 };
        const c = checkoutSummary[0] ?? { totalRevenue: 0, totalTransactions: 0 };
        const combined = {
            totalRevenue:      (h.totalRevenue      || 0) + (c.totalRevenue      || 0),
            totalTransactions: (h.totalTransactions || 0) + (c.totalTransactions || 0),
        };
        combined.avgBillValue = combined.totalTransactions > 0
            ? combined.totalRevenue / combined.totalTransactions : 0;

        res.json({ success: true, analytics: combined });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Return/Exchange handler
export const processReturnExchange = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { returnType = 'REFUND' } = req.body;
        const newStatus = returnType === 'EXCHANGE' ? 'Exchanged' : 'Refunded';
        const updatedBill = await BillHistory.findOneAndUpdate(
            { transactionId },
            { status: newStatus },
            { new: true }
        );
        if (!updatedBill) return res.json({ success: true, message: 'Return processed successfully' });
        res.json({ success: true, message: 'Return processed successfully', data: updatedBill });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};