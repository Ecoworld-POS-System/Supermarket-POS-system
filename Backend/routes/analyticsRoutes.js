import { Router } from 'express';
import {
  getMonthlyRevenue,
  getPaymentMethodStats,
  getRevenueTrends,
  getTopProducts,
} from '../controllers/analyticsController.js';

const router = Router();

// GET /api/analytics/monthly-revenue
router.get('/monthly-revenue', getMonthlyRevenue);

// GET /api/analytics/payment-methods
router.get('/payment-methods', getPaymentMethodStats);

// GET /api/analytics/revenue-trends
router.get('/revenue-trends', getRevenueTrends);

// GET /api/analytics/top-products
router.get('/top-products', getTopProducts);

export default router;
