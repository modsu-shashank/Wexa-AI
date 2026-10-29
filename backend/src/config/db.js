
const mongoose = require('mongoose');

let isConnected = false;

const autoSeedIfEmpty = async () => {
  const Product = require('../models/Product');
  const User = require('../models/User');
  const Organization = require('../models/Organization');
  const StockLog = require('../models/StockLog');

  const productCount = await Product.countDocuments();

  if (productCount > 0) {
    console.log('[Auto-Seed]: Products already exist. Skipping seed.');
    return;
  }

  console.log('[Auto-Seed]: Database is empty. Creating demo store...');

  const org = await Organization.create({
    name: 'Apex Logistics & Supplies',
    defaultLowStockThreshold: 8,
  });

  const user = await User.create({
    email: 'demo@stockflow.io',
    password: 'password123',
    organizationId: org._id,
    name: 'Alex Morgan',
  });

  const products = [
    {
      name: 'Industrial Barcode Scanner 2D',
      sku: 'BCS-2000-HD',
      description: 'Rugged handheld 2D QR/Barcode scanner with Bluetooth and USB cradle',
      quantityOnHand: 42,
      costPrice: 85,
      sellingPrice: 159.99,
      lowStockThreshold: 10,
    },
    {
      name: 'Heavy-Duty Thermal Shipping Label Printer',
      sku: 'PRN-TH-4X6',
      description: 'Direct thermal 4x6 commercial label maker, 300 DPI high-speed print engine',
      quantityOnHand: 18,
      costPrice: 120,
      sellingPrice: 229.5,
      lowStockThreshold: 6,
    },
    {
      name: 'Ergonomic Packing Tape Dispenser 3-Inch',
      sku: 'PKG-DISP-03',
      description: 'Comfort pistol grip tape gun with adjustable tension brake',
      quantityOnHand: 65,
      costPrice: 7.5,
      sellingPrice: 18.99,
      lowStockThreshold: null,
    },
    {
      name: 'Precision Digital Platform Scale 150kg',
      sku: 'SCL-DIGI-150',
      description: 'Heavy gauge stainless steel platform with remote LCD wall readout',
      quantityOnHand: 7,
      costPrice: 95,
      sellingPrice: 189,
      lowStockThreshold: null,
    },
    {
      name: 'High-Visibility Safety Vests (Pack of 10)',
      sku: 'SAF-VEST-L10',
      description: 'Reflective neon yellow safety vests with zipper',
      quantityOnHand: 4,
      costPrice: 24,
      sellingPrice: 49.99,
      lowStockThreshold: 12,
    },
    {
      name: 'Rechargeable LED Work Floodlight 50W',
      sku: 'LGT-FLD-50W',
      description: 'Waterproof cordless LED work floodlight',
      quantityOnHand: 2,
      costPrice: 32,
      sellingPrice: 69.95,
      lowStockThreshold: 5,
    },
    {
      name: 'Commercial Hand Truck Dolly 600lb',
      sku: 'TRK-DOL-600',
      description: 'Convertible aluminum hand truck and flatbed cart',
      quantityOnHand: 0,
      costPrice: 110,
      sellingPrice: 219,
      lowStockThreshold: 4,
    },
    {
      name: 'Standard Stretch Wrap Roll 80-Gauge',
      sku: 'PKG-WRAP-80G',
      description: 'Industrial pallet shrink wrap film',
      quantityOnHand: 0,
      costPrice: 11.2,
      sellingPrice: 24.5,
      lowStockThreshold: 15,
    },
    {
      name: 'Nitrile Tough Work Gloves (Box of 100)',
      sku: 'SAF-GLV-NIT-L',
      description: 'Heavy-duty textured grip disposable nitrile gloves',
      quantityOnHand: 85,
      costPrice: 9.8,
      sellingPrice: 22,
      lowStockThreshold: 10,
    },
    {
      name: 'Hydraulic Pallet Jack 5500lb Capacity',
      sku: 'EQP-PAL-5500',
      description: 'Heavy-duty pallet jack with polyurethane load wheels',
      quantityOnHand: 5,
      costPrice: 310,
      sellingPrice: 499,
      lowStockThreshold: 2,
    },
    {
      name: 'Corrugated Shipping Boxes 12x12x12',
      sku: 'BOX-CORR-12X',
      description: 'Single-wall kraft corrugated packing cartons',
      quantityOnHand: 110,
      costPrice: 14.5,
      sellingPrice: 32,
      lowStockThreshold: 20,
    },
    {
      name: 'Anti-Static Bubble Cushioning Roll',
      sku: 'PKG-BUB-AST',
      description: 'Anti-static bubble cushioning for electronics',
      quantityOnHand: 3,
      costPrice: 16,
      sellingPrice: 34.99,
      lowStockThreshold: 10,
    },
  ];

  for (const product of products) {
    const created = await Product.create({
      ...product,
      organizationId: org._id,
      lastUpdatedBy: user.email,
      lastStockAdjustmentNote: 'Initial warehouse intake',
    });

    if (product.quantityOnHand > 0) {
      await StockLog.create({
        organizationId: org._id,
        productId: created._id,
        productName: created.name,
        sku: created.sku,
        action: 'INITIAL',
        previousQuantity: 0,
        quantityDelta: product.quantityOnHand,
        newQuantity: product.quantityOnHand,
        reason: 'Initial warehouse inventory intake',
        performedBy: user.email,
      });
    }
  }

  console.log(`[Auto-Seed]: Created ${products.length} demo products.`);
};

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;

    console.log(
      `[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`
    );

    await autoSeedIfEmpty();
  } catch (error) {
    isConnected = false;
    console.error('[MongoDB Connection Error]:', error.message);
    throw error;
  }
};

module.exports = connectDB;
