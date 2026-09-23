import { Router } from 'express';
import {
  getInventory,
  getLowStockAlerts,
  restockItem,
} from '../controllers/inventoryController.js';

const router = Router();

// GET /api/inventory         — Fetch all inventory products
router.get('/', getInventory);

// GET /api/inventory/alerts  — Fetch low stock alerts (stock <= minThreshold)
router.get('/alerts', getLowStockAlerts);

// PUT /api/inventory/:id/restock — Restock item quantity
router.put('/:id/restock', restockItem);

export default router;
