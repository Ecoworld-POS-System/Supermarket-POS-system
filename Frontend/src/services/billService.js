import { client } from './api';

/**
 * Fetch all bills with optional query filter parameters.
 * @param {Object} [queryParams] - Filter params (search, cashier, paymentMethod, startDate, endDate, etc.)
 * @returns {Promise<Array>} array of bill objects
 */
export async function fetchBills(queryParams = {}) {
  const { data } = await client.get('/bills', { params: queryParams });
  return data.data ?? data;
}

/**
 * Fetch a single bill by ObjectId or Bill Number / Invoice Number.
 * @param {string} id - Bill ID or Invoice Number
 * @returns {Promise<Object>} itemized bill document
 */
export async function fetchBillById(id) {
  const { data } = await client.get(`/bills/${id}`);
  return data.data ?? data;
}

/**
 * Issue a full refund for a bill by ID, updating status and restoring stock in MongoDB.
 * @param {string} id - Bill ID or Invoice Number
 * @returns {Promise<Object>} result payload containing updated bill and restored products
 */
export async function refundBill(id) {
  const { data } = await client.put(`/bills/${id}/refund`);
  return data.data ?? data;
}
