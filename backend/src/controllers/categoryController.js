const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    // Get product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ category: category._id });
        return {
          ...category.toObject(),
          productCount
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCount
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin, Manager)
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const category = await Category.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin, Manager)
const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check for duplicate name if changed
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: 'Category name already exists'
        });
      }
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: category._id });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing products. Reassign products first.'
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
