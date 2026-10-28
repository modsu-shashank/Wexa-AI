const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['INITIAL', 'ADD', 'REMOVE', 'SET', 'MANUAL_EDIT'],
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    quantityDelta: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: 'Inventory adjustment',
      trim: true,
    },
    performedBy: {
      type: String,
      default: 'System',
    },
  },
  { timestamps: true }
);

stockLogSchema.index({ organizationId: 1, createdAt: -1 });

module.exports = mongoose.model('StockLog', stockLogSchema);

