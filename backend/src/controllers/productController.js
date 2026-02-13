const Product = require('../models/Product');

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      lowStock,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Search by name, SKU, or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by low stock
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$minStockLevel'] };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 100);

    // Sort
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .populate('createdBy', 'username')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description')
      .populate('supplier', 'name contactPerson email phone')
      .populate('createdBy', 'username firstName lastName');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin, Manager)
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      supplier,
      price,
      quantity,
      minStockLevel,
      imageUrl
    } = req.body;

    // Validation
    if (!name || !sku || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, SKU, category, price, and quantity are required'
      });
    }

    const product = await Product.create({
      name,
      sku: sku.toUpperCase(),
      description,
      category,
      supplier,
      price,
      quantity,
      minStockLevel: minStockLevel || 10,
      imageUrl,
      createdBy: req.user._id
    });

    await product.populate(['category', 'supplier']);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin, Manager)
const updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      supplier,
      price,
      quantity,
      minStockLevel,
      imageUrl
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check for duplicate SKU if changed
    if (sku && sku.toUpperCase() !== product.sku) {
      const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: 'SKU already exists'
        });
      }
      product.sku = sku.toUpperCase();
    }

    // Update fields
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (supplier !== undefined) product.supplier = supplier;
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (minStockLevel !== undefined) product.minStockLevel = minStockLevel;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;

    await product.save();
    await product.populate(['category', 'supplier']);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product has sales history
    const Sale = require('../models/Sale');
    const salesCount = await Sale.countDocuments({ 'items.product': product._id });

    if (salesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product with existing sales history. Consider marking as discontinued instead.'
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
