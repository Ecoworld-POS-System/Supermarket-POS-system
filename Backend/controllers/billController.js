import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import Product from '../models/Product.js';

/* ─────────────────────────────────────────────────────────────
   UTILITY: Generate a unique Bill Number
   Format: TXN-YYYY-XXXX
   Uses current year + an atomic counter drawn from the number of
   existing bills today to ensure uniqueness, with a random
   4-digit suffix as a collision guard.
───────────────────────────────────────────────────────────── */
const generateBillNumber = async () => {
  const year = new Date().getFullYear();

  // Count all bills for the current year to derive a sequential number
  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
  const count = await Bill.countDocuments({ createdAt: { $gte: startOfYear } });

  // Zero-pad the sequence to 4 digits (e.g., 0001, 0042, 1337)
  const sequence = String(count + 1).padStart(4, '0');
  return `TXN-${year}-${sequence}`;
};

/* ─────────────────────────────────────────────────────────────
   CREATE BILL
   POST /api/bills
───────────────────────────────────────────────────────────── */

/**
 * @desc    Create a new finalized bill, deduct stock, and return saved document
 * @route   POST /api/bills
 * @access  Public (internal POS network)
 */
export const createBill = async (req, res) => {
  // Use a Mongoose session for atomic stock deduction + bill save
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      cashier = 'Cashier 01',
      items,
      subtotal,
      tax = 0,
      discount = 0,
      grandTotal,
      paymentMethod,
      tenderedAmount,
    } = req.body;

    // ── 1. Validate required fields ──────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Validation error: "items" array is required and must not be empty.',
      });
    }

    if (grandTotal === undefined || grandTotal === null) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Validation error: "grandTotal" is required.',
      });
    }

    if (!paymentMethod || !['Cash', 'Card'].includes(paymentMethod)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Validation error: "paymentMethod" must be "Cash" or "Card".',
      });
    }

    // Cash payment: validate tendered amount covers grand total
    if (paymentMethod === 'Cash') {
      if (tenderedAmount === undefined || tenderedAmount < grandTotal) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Validation error: Tendered amount (Rs. ${tenderedAmount ?? 0}) is less than grand total (Rs. ${grandTotal}).`,
        });
      }
    }

    // ── 2. Validate each item and check stock availability ───
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Validation error: Each item must have a valid "productId" and "quantity" (≥ 1).`,
        });
      }

      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: `Product not found for ID: ${item.productId}`,
        });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}.`,
        });
      }
    }

    // ── 3. Generate unique bill number ───────────────────────
    const billNumber = await generateBillNumber();

    // ── 4. Deduct stock for each item (atomic via session) ───
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { session, new: true }
      );
    }

    // ── 5. Calculate change due ──────────────────────────────
    const changeDue =
      paymentMethod === 'Cash' && tenderedAmount
        ? parseFloat((tenderedAmount - grandTotal).toFixed(2))
        : 0;

    // ── 6. Build and save the bill document ──────────────────
    const newBill = new Bill({
      billNumber,
      cashier,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),
      subtotal,
      tax,
      discount,
      grandTotal,
      paymentMethod,
      tenderedAmount: tenderedAmount ?? null,
      changeDue,
    });

    const savedBill = await newBill.save({ session });

    // ── 7. Commit the transaction ────────────────────────────
    await session.commitTransaction();
    session.endSession();

    console.log(`✅ Bill created: ${billNumber} | Total: Rs. ${grandTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })} | Method: ${paymentMethod}`);

    return res.status(201).json({
      success: true,
      message: `Bill ${billNumber} created successfully.`,
      data: savedBill,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('[billController.createBill]', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating bill.',
      error: error.message,
    });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET BILL BY ID OR BILL NUMBER (for reprinting)
   GET /api/bills/:id
───────────────────────────────────────────────────────────── */

/**
 * @desc    Fetch a bill by MongoDB ObjectId or by bill number (TXN-YYYY-XXXX)
 * @route   GET /api/bills/:id
 * @access  Public (internal POS network)
 */
export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    let bill = null;

    // Determine if the param is a MongoDB ObjectId or a bill number string
    if (mongoose.Types.ObjectId.isValid(id)) {
      bill = await Bill.findById(id);
    }

    // If not found by ObjectId (or param was a bill number string), try billNumber
    if (!bill) {
      bill = await Bill.findOne({ billNumber: id.toUpperCase() });
    }

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: `Bill not found for identifier: ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    console.error('[billController.getBillById]', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching bill.',
      error: error.message,
    });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET ALL BILLS (billing history / reports)
   GET /api/bills
───────────────────────────────────────────────────────────── */

/**
 * @desc    Get all bills, sorted by latest first, with optional date range filter
 * @route   GET /api/bills
 * @access  Public (internal POS network)
 */
export const getAllBills = async (req, res) => {
  try {
    const { from, to, paymentMethod } = req.query;

    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    if (paymentMethod && ['Cash', 'Card'].includes(paymentMethod)) {
      filter.paymentMethod = paymentMethod;
    }

    const bills = await Bill.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (error) {
    console.error('[billController.getAllBills]', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching bills.',
      error: error.message,
    });
  }
};
