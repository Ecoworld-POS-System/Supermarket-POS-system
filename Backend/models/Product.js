import mongoose from 'mongoose';

// ─── Product Schema ───────────────────────────────────────────────────────────
// Minimal model used by the Billing & Payment module for:
//   • Barcode lookup during scanner entry
//   • Stock deduction on successful bill creation
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    barcode: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: String,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
