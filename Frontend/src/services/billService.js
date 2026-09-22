import { api } from './api';

const billService = {
  // ── Bill History (MongoDB /api/bill-history) ──────────────────────────────

  /**
   * Fetch paginated + filtered bill history from MongoDB.
   * Maps filter keys used by BillHistoryView to query params the backend expects.
   */
  getBillHistory: async ({ search = '', outlet = 'all', status = 'all', method = 'all', page = 1, limit = 100 } = {}) => {
    const params = { page, limit };
    if (search)                          params.search  = search;
    if (outlet !== 'all')                params.outlet  = outlet;
    if (status !== 'all')                params.status  = status;
    if (method !== 'all')                params.method  = method;
    const response = await api.get('/bill-history', { params });
    return response.data; // { success, total, data: [...] }
  },

  getBillHistoryById: async (id) => {
    const response = await api.get(`/bill-history/${id}`);
    return response.data;
  },

  // ── Billing (MongoDB /api/bills) ─────────────────────────────────────────

  getAllBills: async (params) => {
    const response = await api.get('/bills', { params });
    return response.data;
  },

  getBillById: async (id) => {
    const response = await api.get(`/bills/${id}`);
    return response.data;
  },

  processReturnExchange: async (transactionId, returnData) => {
    const response = await api.post(`/bill-history/${transactionId}/return`, returnData);
    return response.data;
  },

  batchPrintBills: async (batchData) => {
    const response = await api.post('/bill-history/batch-print', batchData);
    return response.data;
  },

  exportReport: async (exportConfig) => {
    const response = await api.get('/bill-history/export', {
      params: exportConfig,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default billService;
export { billService };
