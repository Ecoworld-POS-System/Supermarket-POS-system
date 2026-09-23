import Product from '../models/Product.js';

/**
 * @desc    Fetch all inventory products with stock counts, min reorder thresholds, categories, and suppliers
 * @route   GET /api/inventory
 * @access  Public
 */
export const getInventory = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ name: 1 });

    const inventory = products.map((item) => {
      const doc = item.toObject ? item.toObject() : item;
      const minThresh = doc.minThreshold ?? doc.minStock ?? doc.lowStockThreshold ?? 5;
      return {
        ...doc,
        id: doc.id || doc._id,
        minThreshold: minThresh,
        minStock: minThresh,
        supplier: doc.supplier || 'General Supplier',
        category: doc.category || 'General',
        stock: doc.stock ?? 0,
      };
    });

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    console.error('[inventoryController.getInventory]', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message,
    });
  }
};

/**
 * @desc    Get low stock alerts (stock <= minThreshold)
 * @route   GET /api/inventory/alerts
 * @access  Public
 */
export const getLowStockAlerts = async (req, res) => {
  try {
    const products = await Product.find({});

    const lowStockItems = products
      .map((item) => {
        const doc = item.toObject ? item.toObject() : item;
        const minThresh = doc.minThreshold ?? doc.minStock ?? doc.lowStockThreshold ?? 5;
        return {
          ...doc,
          id: doc.id || doc._id,
          minThreshold: minThresh,
          minStock: minThresh,
          supplier: doc.supplier || 'General Supplier',
          category: doc.category || 'General',
          stock: doc.stock ?? 0,
        };
      })
      .filter((item) => item.stock <= item.minThreshold);

    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems,
    });
  } catch (error) {
    console.error('[inventoryController.getLowStockAlerts]', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock alerts',
      error: error.message,
    });
  }
};

/**
 * @desc    Restock item (add specified quantity to existing stock count)
 * @route   PUT /api/inventory/:id/restock
 * @access  Public
 */
export const restockItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { addedStock, quantity, qty } = req.body;

    const amountToAdd = Number(addedStock ?? quantity ?? qty);

    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restock quantity. Must be a positive number.',
      });
    }

    let product = null;

    // Check if id is valid ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }

    if (!product) {
      product = await Product.findOne({
        $or: [{ id: id }, { sku: id }, { skuCode: id }, { barcode: id }],
      });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with identifier: ${id}`,
      });
    }

    product.stock = (product.stock || 0) + amountToAdd;
    await product.save();

    const doc = product.toObject();
    const minThresh = doc.minThreshold ?? doc.minStock ?? doc.lowStockThreshold ?? 5;

    res.status(200).json({
      success: true,
      message: `Successfully restocked ${product.name} by ${amountToAdd} units.`,
      data: {
        ...doc,
        id: doc.id || doc._id,
        minThreshold: minThresh,
        minStock: minThresh,
        stock: product.stock,
      },
    });
  } catch (error) {
    console.error('[inventoryController.restockItem]', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to restock item',
      error: error.message,
    });
  }
};
