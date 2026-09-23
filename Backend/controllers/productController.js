import Product from '../models/Product.js';

/* ─────────────────────────────────────────────────────────────
   GET ALL PRODUCTS
   GET /api/products
───────────────────────────────────────────────────────────── */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('[productController.getAllProducts]', error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   CREATE PRODUCT
   POST /api/products
   Accepts all fields sent by ProductModal.jsx / productService.js
───────────────────────────────────────────────────────────── */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      barcode     = '',
      sku         = '',
      skuCode     = '',
      category,
      costPrice   = 0,
      price,
      stock       = 0,
      minStock    = 5,
      minThreshold,
      lowStockThreshold,
      unit        = 'pcs',
      image       = '',
      status      = 'Active',
      supplier    = 'General Supplier',
    } = req.body;

    // ── Validate required fields explicitly to return clear 400 errors ──
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required.' });
    }
    if (price === undefined || price === null || Number(price) <= 0) {
      return res.status(400).json({ success: false, message: 'A valid selling price is required.' });
    }
    if (!category || !String(category).trim()) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }

    // ── Auto-generate a SKU if none supplied ──────────────────────────
    const resolvedSku = sku || skuCode || await (async () => {
      const count = await Product.countDocuments();
      return `SKU-${String(count + 1).padStart(3, '0')}`;
    })();

    // ── Resolve threshold (accept any of the three field names) ────────
    const resolvedMinStock = Number(minStock || minThreshold || lowStockThreshold) || 5;

    const product = await Product.create({
      name:         String(name).trim(),
      barcode:      String(barcode).trim(),
      sku:          resolvedSku,
      skuCode:      resolvedSku,
      category:     String(category).trim(),
      costPrice:    Number(costPrice)  || 0,
      price:        Number(price),
      stock:        Number(stock)      || 0,
      minStock:     resolvedMinStock,
      minThreshold: resolvedMinStock,
      lowStockThreshold: resolvedMinStock,
      unit:         unit   || 'pcs',
      image:        image  || '',
      status:       status || 'Active',
      supplier:     supplier || 'General Supplier',
    });

    console.log(`✅ Product created: ${product.name} | SKU: ${product.sku} | Price: Rs. ${product.price}`);

    return res.status(201).json({ success: true, message: 'Product created successfully.', data: product });
  } catch (error) {
    console.error('[productController.createProduct] ERROR:', error.stack);

    // Mongoose validation errors → 400
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message).join('; ');
      return res.status(400).json({ success: false, message: messages });
    }
    // Duplicate key (e.g., unique barcode) → 409
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      return res.status(409).json({ success: false, message: `Duplicate value for ${field}: ${error.keyValue?.[field]}` });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   UPDATE PRODUCT
   PUT /api/products/:id   (MongoDB ObjectId)
───────────────────────────────────────────────────────────── */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      barcode,
      sku,
      skuCode,
      category,
      costPrice,
      price,
      stock,
      minStock,
      minThreshold,
      lowStockThreshold,
      unit,
      image,
      status,
      supplier,
    } = req.body;

    const resolvedMinStock = Number(minStock || minThreshold || lowStockThreshold) || undefined;
    const resolvedSku = sku || skuCode || undefined;

    const updatePayload = {};
    if (name       !== undefined) updatePayload.name       = String(name).trim();
    if (barcode    !== undefined) updatePayload.barcode    = String(barcode).trim();
    if (resolvedSku !== undefined) { updatePayload.sku = resolvedSku; updatePayload.skuCode = resolvedSku; }
    if (category   !== undefined) updatePayload.category   = String(category).trim();
    if (costPrice  !== undefined) updatePayload.costPrice  = Number(costPrice) || 0;
    if (price      !== undefined) updatePayload.price      = Number(price);
    if (stock      !== undefined) updatePayload.stock      = Number(stock) || 0;
    if (resolvedMinStock !== undefined) {
      updatePayload.minStock = resolvedMinStock;
      updatePayload.minThreshold = resolvedMinStock;
      updatePayload.lowStockThreshold = resolvedMinStock;
    }
    if (unit       !== undefined) updatePayload.unit       = unit;
    if (image      !== undefined) updatePayload.image      = image;
    if (status     !== undefined) updatePayload.status     = status;
    if (supplier   !== undefined) updatePayload.supplier   = supplier;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: `Product not found with ID: ${id}` });
    }

    console.log(`✏️  Product updated: ${product.name} | ID: ${id}`);
    return res.status(200).json({ success: true, message: 'Product updated.', data: product });
  } catch (error) {
    console.error('[productController.updateProduct] ERROR:', error.stack);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message).join('; ');
      return res.status(400).json({ success: false, message: messages });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: `Invalid product ID format: ${error.value}` });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   DELETE PRODUCT
   DELETE /api/products/:id   (MongoDB ObjectId)
───────────────────────────────────────────────────────────── */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: `Product not found with ID: ${id}` });
    }

    console.log(`🗑️  Product deleted: ${product.name} | ID: ${id}`);
    return res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('[productController.deleteProduct] ERROR:', error.stack);

    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: `Invalid product ID format: ${error.value}` });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};
