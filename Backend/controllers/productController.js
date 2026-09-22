import Product from '../models/Product.js';

// GET all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// CREATE a new product
export const createProduct = async (req, res) => {
  try {
    const { name, barcode, category, price, stock, lowStockThreshold, status, image } = req.body;

    // Auto-generate SKU code
    const count = await Product.countDocuments();
    const skuCode = `mp${String(count + 1).padStart(3, '0')}`;

    const product = await Product.create({
      name,
      skuCode,
      barcode,
      category,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 10,
      status: status || 'Active',
      image: image || '',
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

// UPDATE a product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, barcode, category, price, stock, lowStockThreshold, status, image } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        barcode,
        category,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        lowStockThreshold: Number(lowStockThreshold) || 10,
        status,
        image,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

// DELETE a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};
