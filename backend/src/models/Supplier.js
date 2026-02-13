const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    minlength: [2, 'Supplier name must be at least 2 characters'],
    maxlength: [200, 'Supplier name must not exceed 200 characters']
  },
  contactPerson: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Virtual for product count
supplierSchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'supplier',
  count: true
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
