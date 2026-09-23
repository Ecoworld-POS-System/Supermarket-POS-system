import mongoose from 'mongoose';

// ─── Line Item Sub-Schema ─────────────────────────────────────────────────────
// Stored as a snapshot at time of sale so reprints stay accurate
// even if the product is later edited or deleted.
// ─── Line Item Sub-Schema ─────────────────────────────────────────────────────
const billItemSchema = new mongoose.Schema(
  {
    id: { 
      type: String,
      default: () => `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    name: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
    },
    price: {
      type: Number,
    },
    quantity: {
      type: Number,
    },
    qty: {
      type: Number,
    },
    lineTotal: {
      type: Number,
    },
    total: {
      type: Number,
    },
  },
  { _id: false }
);

// ─── Bill Schema ──────────────────────────────────────────────────────────────
const billSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => `TXN-${Date.now()}`,
    },
    billNumber: {
      type: String,
      default: () => `TXN-${Date.now()}`,
    },
    customerName: {
      type: String,
      default: 'Walk-in Customer',
    },
    cashier: {
      type: String,
    },
    cashierName: {
      type: String,
    },
    cashierId: {
      type: String,
    },
    branch: {
      type: String,
      default: 'Colombo - Head Office',
    },
    items: [billItemSchema],
    subtotal: {
      type: Number,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
    },
    total: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      default: 'Cash',
    },
    tenderedAmount: {
      type: Number,
    },
    tendered: {
      type: Number,
    },
    changeDue: {
      type: Number,
      default: 0,
    },
    change: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: 'Completed',
    },
    date: {
      type: String,
    },
  },
  {
    timestamps: true, // auto-manages createdAt & updatedAt
  }
);

const Bill = mongoose.models.Bill || mongoose.model('Bill', billSchema);

export default Bill;