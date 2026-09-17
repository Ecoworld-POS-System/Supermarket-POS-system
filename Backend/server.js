import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import billRoutes from './routes/billRoutes.js';

/* ─────────────────────────────────────────────────────────────
   App Initialization
───────────────────────────────────────────────────────────── */
const app = express();
const PORT = process.env.PORT || 5000;

/* ─────────────────────────────────────────────────────────────
   Middleware
───────────────────────────────────────────────────────────── */

// CORS: Allow requests from the Vite React frontend only
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data (optional, good for safety)
app.use(express.urlencoded({ extended: true }));

/* ─────────────────────────────────────────────────────────────
   Health Check — useful for Docker/load-balancer probes
───────────────────────────────────────────────────────────── */
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Supermarket POS API',
    timestamp: new Date().toISOString(),
  });
});

/* ─────────────────────────────────────────────────────────────
   API Routes
───────────────────────────────────────────────────────────── */
app.use('/api/products', productRoutes);
app.use('/api/bills', billRoutes);

/* ─────────────────────────────────────────────────────────────
   404 Handler — for unmatched routes
───────────────────────────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found. Please check the API endpoint.',
  });
});

/* ─────────────────────────────────────────────────────────────
   Global Error Handler — catches any unhandled errors
───────────────────────────────────────────────────────────── */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('🔥 Unhandled Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
});

/* ─────────────────────────────────────────────────────────────
   Bootstrap: Connect DB → Start Server
───────────────────────────────────────────────────────────── */
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 Supermarket POS API is running`);
    console.log(`   ➜  Local:   http://localhost:${PORT}`);
    console.log(`   ➜  Health:  http://localhost:${PORT}/health`);
    console.log(`   ➜  Products: http://localhost:${PORT}/api/products`);
    console.log(`   ➜  Bills:    http://localhost:${PORT}/api/bills\n`);
  });
};

startServer();

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'POS System Backend is running' });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
