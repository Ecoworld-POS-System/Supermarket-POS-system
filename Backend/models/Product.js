import mongoose from 'mongoose';

/* ─── Product Schema ──────────────────────────────────────────────────────────
   Supports all field names used across the app:
     - productController.js (strict fields)
     - inventoryController.js (minThreshold / minStock)
     - server.js legacy inline routes (id, sku, costPrice, unit)
     - productService.js frontend service
─────────────────────────────────────────────────────────────────────────────── */
const productSchema = new mongoose.Schema(
  {
    // Legacy custom string ID used by old server.js inline routes (e.g. PROD-001)
    id: {
      type: String,
      default: '',
    },

    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },

    // SKU — supported under both field names for compatibility
    sku: {
      type: String,
      trim: true,
      default: '',
    },
    skuCode: {
      type: String,
      trim: true,
      default: '',
    },

    barcode: {
      type: String,
      trim: true,
      default: '',
    },

    // Category stored as a plain string name (not an ObjectId ref)
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },

    // Pricing
    costPrice: {
      type: Number,
      default: 0,
      min: [0, 'Cost price cannot be negative'],
    },
    price: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Price cannot be negative'],
    },

    // Stock and thresholds — all three names supported for field-mapping flexibility
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    minStock: {
      type: Number,
      default: 5,
    },
    minThreshold: {
      type: Number,
      default: 5,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },

    // Display / logistics
    unit: {
      type: String,
      trim: true,
      default: 'pcs',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    supplier: {
      type: String,
      trim: true,
      default: 'General Supplier',
    },
  },
  {
    timestamps: true,
  }
);

// Safe export — prevents OverwriteModelError when module is hot-reloaded
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
