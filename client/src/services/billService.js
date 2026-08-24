import api from './api';

export const billService = {
    getAllBills: async (params) => {
        const response = await api.get('/bills', { params });
        return response.data;
    },

    getBillById: async (id) => {
        const response = await api.get(`/bills/${id}`);
        return response.data;
    },

    processReturnExchange: async (billId, returnData) => {
        const response = await api.post(`/bills/${billId}/return`, returnData);
        return response.data;
    },

    batchPrintBills: async (batchData) => {
        const response = await api.post('/bills/batch-print', batchData);
        return response.data;
    },

    exportReport: async (exportConfig) => {
        const response = await api.post('/reports/export', exportConfig, {
            responseType: 'blob',
        });
        return response.data;
    },
};

export default billService;