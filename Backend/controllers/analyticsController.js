import mongoose from 'mongoose';
import BillHistory from '../models/BillHistory.js';
import CheckoutBill from '../models/Bill.js';

/* ─────────────────────────────────────────────────────────────
   OUTLET DEFINITIONS
   These are the known branches. Colors match the frontend #6B9CD2 palette.
───────────────────────────────────────────────────────────── */
const OUTLETS = [
  { id: 'colombo', name: 'Colombo', color: '#6B9CD2' },
  { id: 'kandy',   name: 'Kandy',   color: '#8b5cf6' },
  { id: 'galle',   name: 'Galle',   color: '#10b981' },
  { id: 'negombo', name: 'Negombo', color: '#f97316' },
  { id: 'matara',  name: 'Matara',  color: '#ef4444' },
];

// Helper: derive outletId key from free-text outlet string
function outletIdFromString(str = '') {
  const s = str.toLowerCase();
  if (s.includes('kandy'))   return 'kandy';
  if (s.includes('galle'))   return 'galle';
  if (s.includes('negombo')) return 'negombo';
  if (s.includes('matara'))  return 'matara';
  return 'colombo';
}

/* ─────────────────────────────────────────────────────────────
   GET /api/analytics/monthly-revenue
   Aggregates revenue per outlet per calendar month from BOTH collections.
───────────────────────────────────────────────────────────── */
export const getMonthlyRevenue = async (_req, res) => {
  try {
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // BillHistory uses dateTime field; CheckoutBill uses createdAt
    const [historyDocs, checkoutDocs] = await Promise.all([
      BillHistory.aggregate([
        { $group: { _id: { year: { $year: '$dateTime' }, month: { $month: '$dateTime' }, outlet: '$outlet' }, total: { $sum: '$grandTotal' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      CheckoutBill.aggregate([
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$grandTotal' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const monthMap = {};

    const ensureMonth = (key, shortMonth) => {
      if (!monthMap[key]) {
        monthMap[key] = { month: key, shortMonth, colombo: 0, kandy: 0, galle: 0, negombo: 0, matara: 0, total: 0 };
      }
    };

    historyDocs.forEach(({ _id, total }) => {
      const key = `${monthNames[_id.month - 1]} ${_id.year}`;
      ensureMonth(key, monthNames[_id.month - 1]);
      const ok = outletIdFromString(_id.outlet);
      monthMap[key][ok]   += total;
      monthMap[key].total += total;
    });

    // Checkout bills default to colombo (no outlet field)
    checkoutDocs.forEach(({ _id, total }) => {
      const key = `${monthNames[_id.month - 1]} ${_id.year}`;
      ensureMonth(key, monthNames[_id.month - 1]);
      monthMap[key].colombo += total;
      monthMap[key].total   += total;
    });

    const rows = Object.values(monthMap)
      .sort((a, b) => {
        const [am, ay] = [monthNames.indexOf(a.shortMonth), parseInt(a.month.split(' ')[1])];
        const [bm, by] = [monthNames.indexOf(b.shortMonth), parseInt(b.month.split(' ')[1])];
        return ay !== by ? ay - by : am - bm;
      })
      .map((r) => ({ ...r, formattedTotal: `LKR ${(r.total / 1_000_000).toFixed(2)}M` }));

    if (rows.length > 0) rows[rows.length - 1].isCurrent = true;

    return res.status(200).json({ success: true, data: rows.length ? rows : [] });
  } catch (error) {
    console.error('[analyticsController.getMonthlyRevenue]', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/analytics/payment-methods
   Aggregates real payment method counts and amounts from BOTH collections.
───────────────────────────────────────────────────────────── */
export const getPaymentMethodStats = async (req, res) => {
  try {
    const METHOD_COLORS = {
      'Cash':           '#6B9CD2',
      'Card':           '#10b981',
      'Gift Voucher':   '#f59e0b',
      'Loyalty Points': '#ef4444',
    };

    // Query both collections — no date filter so ALL records are included
    const [historyStats, checkoutStats] = await Promise.all([
      BillHistory.aggregate([
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$grandTotal' } } },
        { $sort: { count: -1 } },
      ]),
      CheckoutBill.aggregate([
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$grandTotal' } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Merge both result sets by payment method name
    const merged = {};
    for (const s of [...historyStats, ...checkoutStats]) {
      const key = s._id || 'Other';
      if (!merged[key]) merged[key] = { method: key, count: 0, amount: 0 };
      merged[key].count  += s.count;
      merged[key].amount += s.amount;
    }

    const totalCount = Object.values(merged).reduce((s, i) => s + i.count, 0) || 1;

    const data = Object.values(merged)
      .sort((a, b) => b.count - a.count)
      .map((m) => ({
        method:     m.method,
        count:      m.count,
        percentage: Math.round((m.count / totalCount) * 100),
        amount:     m.amount,
        color:      METHOD_COLORS[m.method] ?? '#6b7280',
      }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('[analyticsController.getPaymentMethodStats]', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/analytics/revenue-trends
   Returns outlet list + monthly revenue from BOTH collections.
───────────────────────────────────────────────────────────── */
export const getRevenueTrends = async (_req, res) => {
  try {
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const [historyDocs, checkoutDocs] = await Promise.all([
      BillHistory.aggregate([
        { $group: { _id: { year: { $year: '$dateTime' }, month: { $month: '$dateTime' }, outlet: '$outlet' }, total: { $sum: '$grandTotal' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      CheckoutBill.aggregate([
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$grandTotal' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const monthMap = {};
    const ensureMonth = (key, shortMonth) => {
      if (!monthMap[key]) {
        monthMap[key] = { month: key, shortMonth, colombo: 0, kandy: 0, galle: 0, negombo: 0, matara: 0, total: 0 };
      }
    };

    historyDocs.forEach(({ _id, total }) => {
      const key = `${monthNames[_id.month - 1]} ${_id.year}`;
      ensureMonth(key, monthNames[_id.month - 1]);
      const ok = outletIdFromString(_id.outlet);
      monthMap[key][ok]   += total;
      monthMap[key].total += total;
    });

    checkoutDocs.forEach(({ _id, total }) => {
      const key = `${monthNames[_id.month - 1]} ${_id.year}`;
      ensureMonth(key, monthNames[_id.month - 1]);
      monthMap[key].colombo += total;
      monthMap[key].total   += total;
    });

    const trends = Object.values(monthMap)
      .sort((a, b) => {
        const [am, ay] = [monthNames.indexOf(a.shortMonth), parseInt(a.month.split(' ')[1])];
        const [bm, by] = [monthNames.indexOf(b.shortMonth), parseInt(b.month.split(' ')[1])];
        return ay !== by ? ay - by : am - bm;
      })
      .map((r) => ({ ...r, formattedTotal: `LKR ${(r.total / 1_000_000).toFixed(2)}M` }));

    if (trends.length > 0) trends[trends.length - 1].isCurrent = true;

    return res.status(200).json({ success: true, data: { outlets: OUTLETS, trends } });
  } catch (error) {
    console.error('[analyticsController.getRevenueTrends]', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/analytics/top-products
   Aggregates top-selling products from BOTH collections.
───────────────────────────────────────────────────────────── */
export const getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    // BillHistory items use: description, qty, total, unitPrice
    // CheckoutBill items use: name, quantity, lineTotal, unitPrice
    const [historyResults, checkoutResults] = await Promise.all([
      BillHistory.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.description', unitsSold: { $sum: '$items.qty' }, revenue: { $sum: '$items.total' }, unitPrice: { $first: '$items.unitPrice' } } },
        { $sort: { unitsSold: -1 } },
      ]),
      CheckoutBill.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.name', unitsSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.lineTotal' }, unitPrice: { $first: '$items.unitPrice' } } },
        { $sort: { unitsSold: -1 } },
      ]),
    ]);

    // Merge by product name
    const productMap = {};
    for (const p of [...historyResults, ...checkoutResults]) {
      const key = p._id || 'Unknown';
      if (!productMap[key]) productMap[key] = { name: key, unitsSold: 0, revenue: 0, unitPrice: p.unitPrice };
      productMap[key].unitsSold += p.unitsSold;
      productMap[key].revenue   += p.revenue;
    }

    const results = Object.values(productMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, limit)
      .map((p, i) => ({ id: `p${i + 1}`, ...p }));

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error('[analyticsController.getTopProducts]', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
