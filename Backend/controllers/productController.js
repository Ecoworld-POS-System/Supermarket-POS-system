import Product from '../models/Product.js';

/**
 * @desc    Get all products (active inventory)
 * @route   GET /api/products
 * @access  Public (internal POS network)
 */
export const getAllProducts = async (req, res) => {
  try {
    // Support optional category filter: GET /api/products?category=Beverages
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('[productController.getAllProducts]', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching products.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single product by its barcode (for POS scanner lookup)
 * @route   GET /api/products/barcode/:barcode
 * @access  Public (internal POS network)
 */
export const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode || barcode.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Barcode parameter is required.',
      });
    }

    const product = await Product.findOne({ barcode: barcode.trim() });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `No product found with barcode: ${barcode}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('[productController.getProductByBarcode]', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during barcode lookup.',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new product (admin/seeding use)
 * @route   POST /api/products
 * @access  Public (internal POS network)
 */
export const createProduct = async (req, res) => {
  try {
    const { name, barcode, price, stock, category } = req.body;

    // Basic field validation
    if (!name || !barcode || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Fields "name", "barcode", and "price" are required.',
      });
    }

    const product = new Product({ name, barcode, price, stock, category });
    const saved = await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: saved,
    });
  } catch (error) {
    // Handle duplicate barcode (MongoDB unique constraint error code 11000)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `A product with barcode "${req.body.barcode}" already exists.`,
      });
    }
    console.error('[productController.createProduct]', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating product.',
      error: error.message,
    });
  }
};
