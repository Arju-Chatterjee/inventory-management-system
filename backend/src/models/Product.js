const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [200, 'Product name must not exceed 200 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9-]+$/, 'SKU can only contain alphanumeric characters and hyphens']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description must not exceed 1000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(value) {
        return Number.isFinite(value) && value >= 0;
      },
      message: 'Price must be a valid positive number'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be an integer'
    }
  },
  minStockLevel: {
    type: Number,
    required: [true, 'Minimum stock level is required'],
    default: 10,
    min: [0, 'Minimum stock level cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Minimum stock level must be an integer'
    }
  },
  imageUrl: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ quantity: 1 });
productSchema.index({ name: 'text', sku: 'text', description: 'text' });

// Virtual field for low stock status
productSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minStockLevel;
});

// Pre-save middleware to validate category exists
productSchema.pre('save', async function(next) {
  if (this.isModified('category')) {
    const Category = mongoose.model('Category');
    const categoryExists = await Category.findById(this.category);
    if (!categoryExists) {
      next(new Error('Invalid category reference'));
      return;
    }
  }

  if (this.isModified('supplier') && this.supplier) {
    const Supplier = mongoose.model('Supplier');
    const supplierExists = await Supplier.findById(this.supplier);
    if (!supplierExists) {
      next(new Error('Invalid supplier reference'));
      return;
    }
  }

  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
