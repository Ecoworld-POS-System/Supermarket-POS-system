import { Router } from 'express';
import {
  getAllProducts,
  getProductByBarcode,
  createProduct,
} from '../controllers/productController.js';

const router = Router();

// GET  /api/products            — Fetch all products (with optional ?category= filter)
router.get('/', getAllProducts);

// GET  /api/products/barcode/:barcode  — Look up a single product by barcode (POS scanner)
router.get('/barcode/:barcode', getProductByBarcode);

// POST /api/products            — Create a new product (admin / seeding)
router.post('/', createProduct);

export default router;
