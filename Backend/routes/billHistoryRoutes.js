import { Router } from 'express';
import {
  createBill,
  getAllBills,
  getBillById,
  refundBill,
} from '../controllers/billHistoryController.js';

const router = Router();

// POST /api/bills          — Create a new bill and atomically deduct stock
router.post('/', createBill);

// GET  /api/bills          — Fetch all bills with query filter support
router.get('/', getAllBills);

// GET  /api/bills/:id      — Fetch single bill by ID or Bill Number for printing
router.get('/:id', getBillById);

// PUT  /api/bills/:id/refund — Refund a bill and restore product stock
router.put('/:id/refund', refundBill);

// POST /api/bills/:id/refund — Support POST fallback for refund
router.post('/:id/refund', refundBill);

export default router;
