import express from 'express';
import {
    getBills,
    getBillById,
    batchPrintReceipts,
    exportReportData,
    getSalesAnalytics,
    processReturnExchange,
    getDiagnostics,
} from '../controllers/billhistoryController.js';

const router = express.Router();

router.get('/diagnostics', getDiagnostics);   // ← check collection names & counts
router.get('/analytics/sales', getSalesAnalytics);
router.post('/batch-print', batchPrintReceipts);
router.get('/export', exportReportData);
router.get('/:id', getBillById);
router.get('/', getBills);
router.patch('/:transactionId/return', processReturnExchange);
router.post('/:transactionId/return', processReturnExchange);

export default router;