const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
      uppercase: true,
      maxlength: [60, 'SKU cannot exceed 60 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    quantityOnHand: {
      type: Number,
      required: true,
      default: 0,
      set: (v) => Math.round(Number(v) || 0),
    },
    costPrice: {
      type: Number,
      default: 0,
      min: [0, 'Cost price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      default: 0,
      min: [0, 'Selling price cannot be negative'],
    },
    lowStockThreshold: {
      type: Number,
      default: null,
      min: [0, 'Low stock threshold cannot be negative'],
    },
    lastUpdatedBy: {
      type: String,
      default: 'System',
    },
    lastStockAdjustmentNote: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index to enforce SKU uniqueness strictly per Organization (FR-3, Multi-tenant)
productSchema.index({ organizationId: 1, sku: 1 }, { unique: true });
// Index on organizationId and name for fast search
productSchema.index({ organizationId: 1, name: 1 });

module.exports = mongoose.model('Product', productSchema);
