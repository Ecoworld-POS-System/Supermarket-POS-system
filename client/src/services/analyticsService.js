import api from './api';

export const analyticsService = {
    getOverviewMetrics: async (timeRange) => {
        const response = await api.get('/analytics/overview', { params: { range: timeRange } });
        return response.data;
    },

    getSalesAnalytics: async (timeRange) => {
        const response = await api.get('/analytics/sales', { params: { range: timeRange } });
        return response.data;
    },
};

export default analyticsService;