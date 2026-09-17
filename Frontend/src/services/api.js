/**
 * api.js — Centralised Axios client for the Supermarket POS backend.
 *
 * Base URL is read from the Vite env variable VITE_API_URL so that
 * switching environments (dev / staging / prod) only requires a .env change.
 *
 * All functions return the `data` payload directly and throw a normalised
 * Error object on non-2xx responses so callers can just try/catch.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000, // 10 s — fail fast in POS environment
});

/* ── Response interceptor: normalise error messages ─────────────────────── */
client.interceptors.response.use(
  (res) => res,
  (err) => {
    // Extract the most useful error message available
    const message =
      err.response?.data?.message ??
      err.message ??
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  },
);

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCTS
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Fetch all products.
 * Optional `category` string filters by category on the backend.
 * @returns {Promise<Array>} array of product objects
 */
export async function fetchAllProducts(category = '') {
  const params = category ? { category } : {};
  const { data } = await client.get('/products', { params });
  return data.data; // unwrap { success, count, data: [...] }
}

/**
 * Look up a single product by barcode (called on each scanner entry).
 * @param {string} barcode
 * @returns {Promise<Object>} product object
 */
export async function fetchProductByBarcode(barcode) {
  const { data } = await client.get(`/products/barcode/${encodeURIComponent(barcode)}`);
  return data.data;
}

/* ═══════════════════════════════════════════════════════════════════════════
   BILLS
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Submit a finalized bill to the backend.
 * The backend atomically:
 *   1. Generates a unique billNumber (TXN-YYYY-XXXX)
 *   2. Deducts stock from each product
 *   3. Saves the bill document
 *
 * @param {Object} payload
 * @param {Array}  payload.items          – [{ productId, name, unitPrice, quantity, lineTotal }]
 * @param {number} payload.subtotal
 * @param {number} payload.tax
 * @param {number} payload.discount
 * @param {number} payload.grandTotal
 * @param {string} payload.paymentMethod  – 'Cash' | 'Card'
 * @param {number} [payload.tenderedAmount]
 * @param {number} [payload.changeDue]
 * @param {string} [payload.cashier]
 * @returns {Promise<Object>} saved bill document (includes billNumber, createdAt)
 */
export async function createBill(payload) {
  const { data } = await client.post('/bills', payload);
  return data.data; // unwrap { success, message, data: { bill } }
}

/**
 * Fetch a bill by MongoDB ObjectId or bill number (for reprinting).
 * @param {string} idOrBillNumber
 * @returns {Promise<Object>}
 */
export async function fetchBillById(idOrBillNumber) {
  const { data } = await client.get(`/bills/${idOrBillNumber}`);
  return data.data;
}
