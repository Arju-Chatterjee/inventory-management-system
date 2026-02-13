const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters'],
    maxlength: [100, 'Category name must not exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description must not exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for unique name
categorySchema.index({ name: 1 });

// Virtual for product count (will be populated when needed)
categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
