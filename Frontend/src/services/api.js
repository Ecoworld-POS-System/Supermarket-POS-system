/**
 * api.js — Centralised Axios client for the Supermarket POS backend.
 *
 * Base URL is read from the Vite env variable VITE_API_URL so that
 * switching environments (dev / staging / prod) only requires a .env change.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

/* ── Response interceptor: normalise error messages ─────────────────────── */
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ??
      err.message ??
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  },
);

export { client as api };
export default client;

/* ═══════════════════════════════════════════════════════════════════════════
   OUTLET DEFINITIONS (display metadata only — no revenue figures)
═══════════════════════════════════════════════════════════════════════════ */
export const OUTLET_DEFS = [
  { id: 'colombo', name: 'Colombo', color: '#6B9CD2' },
  { id: 'kandy',   name: 'Kandy',   color: '#8b5cf6' },
  { id: 'galle',   name: 'Galle',   color: '#10b981' },
  { id: 'negombo', name: 'Negombo', color: '#f97316' },
  { id: 'matara',  name: 'Matara',  color: '#ef4444' },
];

/* ─── Used only as initial React state (renders empty charts on first load) */
export const DEFAULT_SUPERMARKET_ANALYTICS = {
  outlets:        OUTLET_DEFS,
  monthlyRevenue: [],
  paymentMethods: [],
  topProducts:    [],
};

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCTS
═══════════════════════════════════════════════════════════════════════════ */
export async function fetchAllProducts(category = '') {
  const params = category ? { category } : {};
  const { data } = await client.get('/products', { params });
  return data.data;
}

export async function fetchProductByBarcode(barcode) {
  const { data } = await client.get(`/products/barcode/${encodeURIComponent(barcode)}`);
  return data.data;
}

/* ═══════════════════════════════════════════════════════════════════════════
   BILLS (billing checkout — /api/bills)
═══════════════════════════════════════════════════════════════════════════ */
export async function createBill(payload) {
  const { data } = await client.post('/bills', payload);
  return data.data;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANALYTICS — all hitting live /api/analytics/* endpoints
   Returns empty array / empty object on error so charts render blank
   rather than showing fabricated numbers.
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Fetch monthly revenue breakdown across supermarket outlets.
 * @param {string} dateRange - 'today' | 'week' | 'month' | '3months' | '6months'
 * @returns {Promise<Array>} monthly revenue rows (may be empty if no DB data)
 */
export async function fetchMonthlyRevenue(dateRange = 'month') {
  try {
    const { data } = await client.get('/analytics/monthly-revenue', { params: { range: dateRange } });
    return Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
}

/**
 * Fetch payment method distribution.
 * @param {string} dateRange
 * @returns {Promise<Array>}
 */
export async function fetchPaymentMethodStats(dateRange = 'month') {
  try {
    const { data } = await client.get('/analytics/payment-methods', { params: { range: dateRange } });
    return Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
}

/**
 * Fetch revenue trends (outlets + monthly series) for the line chart.
 * @param {string} dateRange
 * @returns {Promise<Object>} { outlets, trends }
 */
export async function fetchRevenueTrends(dateRange = 'month') {
  try {
    const { data } = await client.get('/analytics/revenue-trends', { params: { range: dateRange } });
    return data.data ?? { outlets: OUTLET_DEFS, trends: [] };
  } catch {
    return { outlets: OUTLET_DEFS, trends: [] };
  }
}

/**
 * Fetch top-selling products from bill line items.
 * @param {string} dateRange
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function fetchTopProducts(dateRange = 'month', limit = 5) {
  try {
    const { data } = await client.get('/analytics/top-products', { params: { range: dateRange, limit } });
    return Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FORMATTING UTILITY
═══════════════════════════════════════════════════════════════════════════ */
export function formatLKR(amount, style = 'short') {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rs. 0';
  if (style === 'short') {
    if (amount >= 1_000_000) return `LKR ${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000)     return `${Math.round(amount / 1_000)}k`;
    return `LKR ${amount.toLocaleString('en-LK')}`;
  }
  if (style === 'million') return `LKR ${(amount / 1_000_000).toFixed(2)}M`;
  if (style === 'k')       return `${Math.round(amount / 1_000)}k`;
  return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
