import Bill from '../models/Bill.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

/* ─────────────────────────────────────────────────────────────
   UTILITY: Generate a unique Bill Number
   Format: TXN-YYYY-XXXX  (year + zero-padded sequence)
───────────────────────────────────────────────────────────── */
const generateBillNumber = async () => {
  const year = new Date().getFullYear();
  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
  const count = await Bill.countDocuments({ createdAt: { $gte: startOfYear } });
  const seq = String(count + 1).padStart(4, '0');
  return `TXN-${year}-${seq}`;
};

/* ─────────────────────────────────────────────────────────────
   UTILITY: Resolve a product by any identifier the frontend may send:
   - MongoDB ObjectId (_id)
   - Legacy string id  (e.g. "PROD-001")
   - barcode / SKU / name
───────────────────────────────────────────────────────────── */
const resolveProduct = async (productId, itemName) => {
  if (!productId && !itemName) return null;

  // 1. Try ObjectId first (most common for newly-created products)
  if (productId && mongoose.Types.ObjectId.isValid(String(productId))) {
    const p = await Product.findById(productId);
    if (p) return p;
  }

  // 2. Try legacy string `id` field (e.g. "PROD-001")
  if (productId) {
    const p = await Product.findOne({
      $or: [
        { id: String(productId) },
        { barcode: String(productId) },
        { sku: String(productId) },
        { skuCode: String(productId) },
      ],
    });
    if (p) return p;
  }

  // 3. Last resort: match by item name snapshot
  if (itemName) {
    return Product.findOne({ name: new RegExp(`^${itemName.trim()}$`, 'i') });
  }

  return null;
};

/* ─────────────────────────────────────────────────────────────
   CREATE BILL
   POST /api/bills
   Accepts the payload built by POSPage.jsx handleCheckout()
───────────────────────────────────────────────────────────── */

/**
 * @desc    Finalize a POS sale: save bill + decrement product stock
 * @route   POST /api/bills
 * @access  Public (internal POS network)
 */
export const createBill = async (req, res) => {
  try {
    const {
      // Cashier / customer metadata (accept multiple naming conventions)
      cashier,
      cashierName,
      cashierId,
      customerName,
      branch,

      // Financials
      subtotal     = 0,
      tax          = 0,
      discount     = 0,
      grandTotal,
      total,          // alias for grandTotal sent by some versions of POSPage
      paymentMethod,

      // Cash tender fields (multiple aliases)
      tenderedAmount,
      tendered,
      changeDue,
      change,

      // Line items array
      items,
    } = req.body;

    // ── 1. Validate required fields ──────────────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: "items" array is required and must not be empty.',
      });
    }

    const resolvedGrandTotal = grandTotal ?? total;
    if (resolvedGrandTotal === undefined || resolvedGrandTotal === null) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: "grandTotal" (or "total") is required.',
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: "paymentMethod" is required.',
      });
    }

    // ── 2. Resolve & validate each item, then decrement stock ────────
    const savedItems = [];

    for (const item of items) {
      const qty = Number(item.quantity ?? item.qty ?? 0);
      if (qty < 1) {
        return res.status(400).json({
          success: false,
          message: `Validation error: item "${item.name || 'unknown'}" has invalid quantity (${qty}).`,
        });
      }

      const product = await resolveProduct(item.productId ?? item.id, item.name);

      if (product) {
        // Decrement stock (floor at 0 — never go negative)
        await Product.findByIdAndUpdate(
          product._id,
          { $inc: { stock: -qty } },
          { new: true }
        );
      } else {
        // Product not found in DB (e.g. manually-entered item) — log but don't block sale
        console.warn(
          `[createBill] ⚠️  Product not found for item "${item.name}" (id: ${item.productId ?? item.id}). Stock NOT decremented.`
        );
      }

      savedItems.push({
        productId : product?._id ?? undefined,
        id        : item.id || item.productId || `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name      : item.name || product?.name || 'Unknown Item',
        unitPrice : Number(item.unitPrice ?? item.price ?? product?.price ?? 0),
        price     : Number(item.price ?? item.unitPrice ?? product?.price ?? 0),
        quantity  : qty,
        qty,
        lineTotal : Number(item.lineTotal ?? item.total ?? (item.unitPrice ?? item.price ?? 0) * qty),
        total     : Number(item.total ?? item.lineTotal ?? (item.unitPrice ?? item.price ?? 0) * qty),
      });
    }

    // ── 3. Generate unique bill number ───────────────────────────────
    const billNumber = await generateBillNumber();

    // ── 4. Resolve tender / change (accept all alias names) ─────────
    const resolvedTendered  = Number(tenderedAmount ?? tendered ?? resolvedGrandTotal);
    const resolvedChangeDue = Number(changeDue ?? change ?? Math.max(0, resolvedTendered - resolvedGrandTotal));

    // ── 5. Save the bill document ────────────────────────────────────
    const resolvedCashier = cashier || cashierName || 'Cashier';

    const newBill = new Bill({
      id            : billNumber,   // satisfies legacy schema that had id: required
      billNumber    : billNumber,
      transactionId : billNumber,   // satisfies unique index on transactionId
      invoiceNumber : billNumber,
      cashier       : resolvedCashier,
      cashierName   : cashierName || cashier || 'Cashier',
      cashierId     : cashierId   || '',
      customerName  : customerName || 'Walk-in Customer',
      branch        : branch      || 'Colombo - Head Office',
      items         : savedItems,
      subtotal      : Number(subtotal),
      tax           : Number(tax),
      discount      : Number(discount),
      grandTotal    : Number(resolvedGrandTotal),
      total         : Number(resolvedGrandTotal),
      paymentMethod,
      tenderedAmount: resolvedTendered,
      tendered      : resolvedTendered,
      changeDue     : resolvedChangeDue,
      change        : resolvedChangeDue,
      status        : 'Completed',
      date          : new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    });

    const savedBill = await newBill.save();

    console.log(
      `✅ Bill created: ${billNumber} | Total: Rs. ${resolvedGrandTotal} | Method: ${paymentMethod} | Items: ${savedItems.length}`
    );

    return res.status(201).json({
      success : true,
      message : `Bill ${billNumber} created successfully.`,
      data    : savedBill,
    });

  } catch (error) {
    console.error('[billHistoryController.createBill] ERROR:', error.stack);
    return res.status(500).json({
      success : false,
      message : error.message || 'Server error while creating bill.',
    });
  }
};


/**
 * @desc    Fetch all bills with query filters (invoiceNumber, cashier, paymentMethod, date range)
 *          Sorted by latest first.
 * @route   GET /api/bills
 * @access  Public
 */
export const getAllBills = async (req, res) => {
  try {
    const {
      invoiceNumber,
      billNumber,
      cashier,
      paymentMethod,
      startDate,
      endDate,
      from,
      to,
      search,
    } = req.query;

    const query = {};

    // Invoice number / bill ID filter
    const invNo = invoiceNumber || billNumber;
    if (invNo) {
      query.$or = [
        { id: new RegExp(invNo, 'i') },
        { billNumber: new RegExp(invNo, 'i') },
        { transactionId: new RegExp(invNo, 'i') },
      ];
    } else if (search) {
      query.$or = [
        { id: new RegExp(search, 'i') },
        { billNumber: new RegExp(search, 'i') },
        { transactionId: new RegExp(search, 'i') },
        { cashier: new RegExp(search, 'i') },
        { cashierName: new RegExp(search, 'i') },
        { customerName: new RegExp(search, 'i') },
      ];
    }

    // Cashier filter
    if (cashier) {
      const cashierRegex = new RegExp(cashier, 'i');
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: [{ cashier: cashierRegex }, { cashierName: cashierRegex }] },
        ];
        delete query.$or;
      } else {
        query.$or = [
          { cashier: cashierRegex },
          { cashierName: cashierRegex },
        ];
      }
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = new RegExp(`^${paymentMethod}$`, 'i');
    }

    // Date range filter
    const fromDate = startDate || from;
    const toDate = endDate || to;

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        query.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        const end = new Date(toDate);
        if (toDate.length <= 10) {
          end.setHours(23, 59, 59, 999);
        }
        query.createdAt.$lte = end;
      }
    }

    const bills = await Bill.find(query).sort({ createdAt: -1 });

    const formattedBills = bills.map((b) => {
      const doc = b.toObject ? b.toObject() : b;
      return {
        ...doc,
        invoiceNumber: doc.id || doc.billNumber || doc.transactionId,
        billNumber: doc.billNumber || doc.id || doc.transactionId,
        cashier: doc.cashier || doc.cashierName || 'Cashier',
        grandTotal: doc.grandTotal ?? doc.total ?? 0,
        items: doc.items || [],
      };
    });

    res.status(200).json({
      success: true,
      count: formattedBills.length,
      data: formattedBills,
    });
  } catch (error) {
    console.error('[billHistoryController.getAllBills]', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bill history',
      error: error.message,
    });
  }
};

/**
 * @desc    Fetch single bill by ID or Bill Number with complete itemized breakdown for thermal receipt printing
 * @route   GET /api/bills/:id
 * @access  Public
 */
export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    let bill = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      bill = await Bill.findById(id);
    }

    if (!bill) {
      bill = await Bill.findOne({
        $or: [
          { id: id },
          { billNumber: id },
          { transactionId: id },
          { id: new RegExp(`^${id}$`, 'i') },
          { billNumber: new RegExp(`^${id}$`, 'i') },
        ],
      });
    }

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: `Bill not found with ID or Invoice Number: ${id}`,
      });
    }

    const doc = bill.toObject ? bill.toObject() : bill;
    const formattedBill = {
      ...doc,
      invoiceNumber: doc.id || doc.billNumber || doc.transactionId,
      billNumber: doc.billNumber || doc.id || doc.transactionId,
      cashier: doc.cashier || doc.cashierName || 'Cashier',
      grandTotal: doc.grandTotal ?? doc.total ?? 0,
      tenderedAmount: doc.tenderedAmount ?? doc.tendered ?? 0,
      changeDue: doc.changeDue ?? doc.change ?? 0,
      items: (doc.items || []).map((item) => ({
        ...item,
        unitPrice: item.unitPrice ?? item.price ?? 0,
        quantity: item.quantity ?? item.qty ?? 0,
        lineTotal:
          item.lineTotal ??
          item.total ??
          (item.unitPrice || item.price || 0) * (item.quantity || item.qty || 0),
      })),
    };

    res.status(200).json({
      success: true,
      data: formattedBill,
    });
  } catch (error) {
    console.error('[billHistoryController.getBillById]', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bill details',
      error: error.message,
    });
  }
};

/**
 * @desc    Refund a bill: Update bill status to 'Refunded' and restore stock for each itemized product in MongoDB
 * @route   PUT /api/bills/:id/refund
 * @access  Public
 */
export const refundBill = async (req, res) => {
  try {
    const { id } = req.params;

    let bill = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      bill = await Bill.findById(id);
    }

    if (!bill) {
      bill = await Bill.findOne({
        $or: [
          { id: id },
          { billNumber: id },
          { transactionId: id },
          { id: new RegExp(`^${id}$`, 'i') },
          { billNumber: new RegExp(`^${id}$`, 'i') },
        ],
      });
    }

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: `Bill not found with identifier: ${id}`,
      });
    }

    if (bill.status === 'Refunded') {
      return res.status(400).json({
        success: false,
        message: 'This bill has already been refunded.',
      });
    }

    // 1. Update bill status to 'Refunded'
    bill.status = 'Refunded';
    await bill.save();

    // 2. Loop through bill.items and restore refunded quantities back to Product stock in MongoDB
    const restoredProducts = [];

    if (Array.isArray(bill.items) && bill.items.length > 0) {
      for (const item of bill.items) {
        const itemQty = item.quantity ?? item.qty ?? 0;
        if (itemQty <= 0) continue;

        let product = null;

        const pId = item.productId || item.id;
        if (pId && mongoose.Types.ObjectId.isValid(pId.toString())) {
          product = await Product.findById(pId);
        }

        if (!product && pId) {
          product = await Product.findOne({
            $or: [{ id: pId }, { sku: pId }, { skuCode: pId }, { barcode: pId }],
          });
        }

        if (!product && item.name) {
          product = await Product.findOne({ name: item.name });
        }

        if (product) {
          product.stock = (product.stock || 0) + itemQty;
          await product.save();
          restoredProducts.push({
            productId: product._id,
            name: product.name,
            restoredQuantity: itemQty,
            newStock: product.stock,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Bill ${bill.billNumber || bill.id} has been successfully refunded and inventory restored.`,
      data: {
        bill,
        restoredProducts,
      },
    });
  } catch (error) {
    console.error('[billHistoryController.refundBill]', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to refund bill',
      error: error.message,
    });
  }
};