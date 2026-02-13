const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });

    // Get product count for each supplier
    const suppliersWithCount = await Promise.all(
      suppliers.map(async (supplier) => {
        const productCount = await Product.countDocuments({ supplier: supplier._id });
        return {
          ...supplier.toObject(),
          productCount
        };
      })
    );

    res.json({
      success: true,
      data: suppliersWithCount
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private (Admin, Manager)
const createSupplier = async (req, res, next) => {
  try {
    const { name, contactPerson, email, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Supplier name is required'
      });
    }

    const supplier = await Supplier.create({
      name,
      contactPerson,
      email,
      phone,
      address
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin, Manager)
const updateSupplier = async (req, res, next) => {
  try {
    const { name, contactPerson, email, phone, address } = req.body;

    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    if (name) supplier.name = name;
    if (contactPerson !== undefined) supplier.contactPerson = contactPerson;
    if (email !== undefined) supplier.email = email;
    if (phone !== undefined) supplier.phone = phone;
    if (address !== undefined) supplier.address = address;

    await supplier.save();

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin)
const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Set supplier to null for associated products
    await Product.updateMany(
      { supplier: supplier._id },
      { $set: { supplier: null } }
    );

    await supplier.deleteOne();

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
