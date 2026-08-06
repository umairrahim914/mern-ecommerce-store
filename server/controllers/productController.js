const Product = require('../models/Product');

// @desc    Get all products (with filtering, search, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;

    // Build query object dynamically based on which filters were provided
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      // Case-insensitive partial match on product name
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      products,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalProducts: total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching products', error: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    // Handle malformed ObjectId (e.g., someone passes "abc" instead of a real ID)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    res.status(500).json({ message: 'Server error fetching product', error: error.message });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    // Mongoose validation errors (e.g., missing required field, no variants)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    // Duplicate key error (e.g., slug or SKU already exists)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A product with this slug or SKU already exists' });
    }
    res.status(500).json({ message: 'Server error creating product', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,            // return the UPDATED document, not the original
      runValidators: true,  // enforce schema rules (min, required, enum) on update too
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    res.status(500).json({ message: 'Server error updating product', error: error.message });
  }
};

// @desc    Soft-delete a product (deactivate, don't destroy)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deactivated successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    res.status(500).json({ message: 'Server error deleting product', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

