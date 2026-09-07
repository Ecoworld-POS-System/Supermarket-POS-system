import { Router } from 'express';

const router = Router();

// Placeholder route
router.get('/', (req, res) => {
  res.json({ message: 'POS System API - Ready for routes' });
});

// TODO: Add product routes
// import productRoutes from './productRoutes.js';
// router.use('/products', productRoutes);

// TODO: Add category routes
// import categoryRoutes from './categoryRoutes.js';
// router.use('/categories', categoryRoutes);

export default router;
