const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  quantity: Number,
  unitPrice: Number,
  subtotal: Number
});

const saleSchema = new mongoose.Schema({

  serialNumber: {
    type: Number,
    unique: true
  },

  customerName: String,
  customerLocation: String,
  customerPhone: String,

  amountReceived: Number,
  notes: String,

  items: [saleItemSchema],

  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
