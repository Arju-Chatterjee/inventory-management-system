const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// @desc    Get all sales with filtering and pagination
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      soldBy,
      sortBy = 'saleDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Date range filter
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }

    // Filter by staff member
    if (soldBy) {
      query.soldBy = soldBy;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 100);

    // Sort
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const sales = await Sale.find(query)
      .populate('soldBy', 'username firstName lastName')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Sale.countDocuments(query);

    res.json({
      success: true,
      data: sales,
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

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
const getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('soldBy', 'username firstName lastName');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: sale
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Create sale (with transaction)
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, notes } = req.body;

    // Validation
    if (!items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // Process each item
    const processedItems = [];

    for (const item of items) {
      const { product: productId, quantity } = item;

      if (!productId || !quantity || quantity < 1) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Invalid item data: product and quantity (min 1) are required'
        });
      }

      // Fetch product
      const product = await Product.findById(productId).session(session);

      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: `Product not found`
        });
      }

      // Check stock availability
      if (product.quantity < quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${quantity}`
        });
      }

      // Reduce product quantity
      product.quantity -= quantity;
      await product.save({ session });

      // Add to processed items
      processedItems.push({
        product: product._id,
        productName: product.name,
        quantity: quantity,
        unitPrice: product.price,
        subtotal: quantity * product.price
      });
    }

    // Create sale
    const sale = await Sale.create([{
      items: processedItems,
      soldBy: req.user._id,
      notes: notes || ''
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // Populate and return
    const populatedSale = await Sale.findById(sale[0]._id)
      .populate('soldBy', 'username firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      data: populatedSale
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Delete/void sale (restore quantities)
// @route   DELETE /api/sales/:id
// @access  Private (Admin)
const deleteSale = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(req.params.id).session(session);

    if (!sale) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Restore product quantities
    for (const item of sale.items) {
      const product = await Product.findById(item.product).session(session);

      if (product) {
        product.quantity += item.quantity;
        await product.save({ session });
      }
    }

    // Delete sale
    await sale.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'Sale voided successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

module.exports = {
  getSales,
  getSale,
  createSale,
  deleteSale
};
