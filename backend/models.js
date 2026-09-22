import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  role: { type: String, required: true },
  branch: { type: String },
  status: { type: String, default: 'Active' },
  lastLogin: { type: String }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  barcode: { type: String },
  sku: { type: String },
  category: { type: String },
  costPrice: { type: Number },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 0 },
  unit: { type: String },
  image: { type: String }
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String },
  color: { type: String },
  count: { type: Number, default: 0 }
}, { timestamps: true });

const billSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: { type: String },
  cashierName: { type: String },
  cashierId: { type: String },
  branch: { type: String },
  date: { type: String },
  paymentMethod: { type: String },
  items: [{
    id: String,
    name: String,
    price: Number,
    qty: Number,
    total: Number
  }],
  subtotal: { type: Number },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number },
  tendered: { type: Number },
  change: { type: Number },
  status: { type: String, default: 'Completed' }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
export const Product = mongoose.model('Product', productSchema);
export const Category = mongoose.model('Category', categorySchema);
export const Bill = mongoose.model('Bill', billSchema);
