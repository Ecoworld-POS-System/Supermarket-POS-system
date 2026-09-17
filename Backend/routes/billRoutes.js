import { Router } from 'express';
import {
  createBill,
  getBillById,
  getAllBills,
} from '../controllers/billController.js';

const router = Router();

// POST /api/bills          — Create a new bill (finalize transaction)
router.post('/', createBill);

// GET  /api/bills          — Fetch all bills (billing history / daily reports)
router.get('/', getAllBills);

// GET  /api/bills/:id      — Fetch a single bill by ObjectId or bill number (reprint)
router.get('/:id', getBillById);

export default router;
