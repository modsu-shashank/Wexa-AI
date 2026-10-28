require('dotenv').config();
const mongoose = require('mongoose');
const Organization = require('./models/Organization');
const User = require('./models/User');
const Product = require('./models/Product');
const StockLog = require('./models/StockLog');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stockflow';
    await mongoose.connect(mongoUri);
    console.log('[Seed]: Connected to MongoDB at', mongoUri);

    // Clean existing demo data
    const existingOrg = await Organization.findOne({ name: 'Apex Logistics & Supplies' });
    if (existingOrg) {
      await User.deleteMany({ organizationId: existingOrg._id });
      await Product.deleteMany({ organizationId: existingOrg._id });
      await StockLog.deleteMany({ organizationId: existingOrg._id });
      await Organization.deleteOne({ _id: existingOrg._id });
      console.log('[Seed]: Cleaned prior Apex Logistics demo data');
    }

    await User.deleteMany({ email: { $in: ['demo@stockflow.io', 'admin@apexlogistics.com', 'staff@apexlogistics.com', 'demo@apexlogistics.com'] } });

    // 1. Create Organization
    const org = await Organization.create({
      name: 'Apex Logistics & Supplies',
      defaultLowStockThreshold: 8,
    });
    console.log('[Seed]: Created Organization:', org.name, `(ID: ${org._id})`);

    // 2. Create Demo User (Owner)
    const user = await User.create({
      email: 'demo@stockflow.io',
      password: 'password123',
      organizationId: org._id,
      name: 'Alex Morgan',
    });
    console.log('[Seed]: Created Demo User:', user.email, `(Password: password123)`);

    // 3. Create Sample Products
    const productsToCreate = [
      {
        name: 'Industrial Barcode Scanner 2D',
        sku: 'BCS-2000-HD',
        description: 'Rugged handheld 2D QR/Barcode scanner with Bluetooth and USB cradle',
        quantityOnHand: 42,
        costPrice: 85.0,
        sellingPrice: 159.99,
        lowStockThreshold: 10,
      },
      {
        name: 'Heavy-Duty Thermal Shipping Label Printer',
        sku: 'PRN-TH-4X6',
        description: 'Direct thermal 4x6 commercial label maker, 300 DPI high-speed print engine',
        quantityOnHand: 18,
        costPrice: 120.0,
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
        lowStockThreshold: null, // Uses org default (8)
      },
      {
        name: 'Precision Digital Platform Scale 150kg',
        sku: 'SCL-DIGI-150',
        description: 'Heavy gauge stainless steel platform with remote LCD wall readout',
        quantityOnHand: 7, // Below org default (8) -> LOW STOCK
        costPrice: 95.0,
        sellingPrice: 189.0,
        lowStockThreshold: null,
      },
      {
        name: 'High-Visibility Safety Vests (Pack of 10)',
        sku: 'SAF-VEST-L10',
        description: 'ANSI Class 2 certified reflective neon yellow safety vests with zipper',
        quantityOnHand: 4, // Below lowStockThreshold (12) -> LOW STOCK
        costPrice: 24.0,
        sellingPrice: 49.99,
        lowStockThreshold: 12,
      },
      {
        name: 'Rechargeable LED Work Floodlight 50W',
        sku: 'LGT-FLD-50W',
        description: 'Magnetic base waterproof IP65 cordless floodlight with power bank function',
        quantityOnHand: 2, // LOW STOCK
        costPrice: 32.0,
        sellingPrice: 69.95,
        lowStockThreshold: 5,
      },
      {
        name: 'Commercial Hand Truck Dolly 600lb',
        sku: 'TRK-DOL-600',
        description: 'Pneumatic tire convertible aluminum hand truck and flatbed cart',
        quantityOnHand: 0, // OUT OF STOCK
        costPrice: 110.0,
        sellingPrice: 219.0,
        lowStockThreshold: 4,
      },
      {
        name: 'Standard Stretch Wrap Roll 80-Gauge',
        sku: 'PKG-WRAP-80G',
        description: '18 inch x 1500 ft industrial pallet shrink wrap film',
        quantityOnHand: 0, // OUT OF STOCK
        costPrice: 11.2,
        sellingPrice: 24.5,
        lowStockThreshold: 15,
      },
      {
        name: 'Nitrile Tough Work Gloves (Box of 100)',
        sku: 'SAF-GLV-NIT-L',
        description: '6 mil heavy-duty textured grip diamond pattern disposable nitrile gloves',
        quantityOnHand: 85,
        costPrice: 9.8,
        sellingPrice: 22.0,
        lowStockThreshold: 10,
      },
      {
        name: 'Hydraulic Pallet Jack 5500lb Capacity',
        sku: 'EQP-PAL-5500',
        description: 'Heavy duty polyurethane load wheels with standard 27x48 forks',
        quantityOnHand: 5,
        costPrice: 310.0,
        sellingPrice: 499.0,
        lowStockThreshold: 2,
      },
      {
        name: 'Corrugated Shipping Boxes 12x12x12 (Bundle of 25)',
        sku: 'BOX-CORR-12X',
        description: 'ECT-32 single-wall kraft corrugated packing cartons',
        quantityOnHand: 110,
        costPrice: 14.5,
        sellingPrice: 32.0,
        lowStockThreshold: 20,
      },
      {
        name: 'Anti-Static Bubble Cushioning Roll 12x175ft',
        sku: 'PKG-BUB-AST',
        description: 'Pink anti-static air bubble protection for electronics shipping',
        quantityOnHand: 3, // LOW STOCK
        costPrice: 16.0,
        sellingPrice: 34.99,
        lowStockThreshold: 10,
      },
    ];

    for (const p of productsToCreate) {
      const createdProd = await Product.create({
        ...p,
        organizationId: org._id,
        lastUpdatedBy: user.email,
        lastStockAdjustmentNote: 'Initial warehouse intake',
      });

      if (p.quantityOnHand > 0) {
        await StockLog.create({
          organizationId: org._id,
          productId: createdProd._id,
          productName: createdProd.name,
          sku: createdProd.sku,
          action: 'INITIAL',
          previousQuantity: 0,
          quantityDelta: p.quantityOnHand,
          newQuantity: p.quantityOnHand,
          reason: 'Initial warehouse inventory intake',
          performedBy: user.email,
        });
      }
    }

    console.log(`[Seed]: Created ${productsToCreate.length} products with stock logs successfully.`);
    console.log('\n--- DEMO STORE CREDENTIALS ---');
    console.log('Email:        demo@stockflow.io');
    console.log('Password:     password123');
    console.log('Organization: Apex Logistics & Supplies');
    console.log('------------------------------\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();

