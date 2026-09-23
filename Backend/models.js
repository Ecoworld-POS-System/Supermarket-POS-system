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

// Product model is now defined in ./models/Product.js with the full schema.
// We re-export it here only for any legacy references.
import ProductModel from './models/Product.js';

// Bill model is now defined in ./models/Bill.js with the full schema.
// Re-exported here for legacy inline dashboard/stats routes in server.js.
import BillModel from './models/Bill.js';

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String },
  color: { type: String },
  count: { type: Number, default: 0 }
}, { timestamps: true });

import UserModel from './models/User.js';

export const User = UserModel;
export const Product = ProductModel;
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export const Bill = BillModel;
