const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be an integer'
    }
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  subtotal: {
    type: Number,
    required: true
  }
}, { _id: false });

const saleSchema = new mongoose.Schema({
  saleDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  items: {
    type: [saleItemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'At least one item is required'
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes must not exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes
saleSchema.index({ saleDate: -1 });
saleSchema.index({ soldBy: 1 });

// Calculate subtotal and total before saving
saleSchema.pre('save', function(next) {
  // Calculate subtotals
  this.items.forEach(item => {
    item.subtotal = item.quantity * item.unitPrice;
  });

  // Calculate total amount
  this.totalAmount = this.items.reduce((sum, item) => sum + item.subtotal, 0);

  next();
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
