const Product = require('../models/Product');
const Organization = require('../models/Organization');
const StockLog = require('../models/StockLog');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.organizationId);
    const orgDefaultThreshold = organization ? organization.defaultLowStockThreshold : 5;

    // Fetch all products for this organization
    const products = await Product.find({ organizationId: req.organizationId }).lean();

    let totalUnits = 0;
    let totalCostValuation = 0;
    let totalRetailValuation = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    const lowStockItems = [];

    products.forEach((product) => {
      const qty = product.quantityOnHand || 0;
      const cost = product.costPrice || 0;
      const retail = product.sellingPrice || 0;
      const threshold =
        product.lowStockThreshold !== null && product.lowStockThreshold !== undefined
          ? product.lowStockThreshold
          : orgDefaultThreshold;

      totalUnits += qty;
      totalCostValuation += qty * cost;
      totalRetailValuation += qty * retail;

      const isOut = qty <= 0;
      const isLow = !isOut && qty <= threshold;

      if (isOut) {
        outOfStockCount++;
        lowStockItems.push({
          ...product,
          status: 'OUT_OF_STOCK',
          effectiveThreshold: threshold,
        });
      } else if (isLow) {
        lowStockCount++;
        lowStockItems.push({
          ...product,
          status: 'LOW_STOCK',
          effectiveThreshold: threshold,
        });
      }
    });

    // Sort low stock items: out of stock first, then lowest quantity
    lowStockItems.sort((a, b) => a.quantityOnHand - b.quantityOnHand);

    // Top products by total inventory valuation
    const topValueProducts = [...products]
      .map((p) => ({
        _id: p._id,
        name: p.name,
        sku: p.sku,
        quantityOnHand: p.quantityOnHand,
        totalValuation: (p.quantityOnHand || 0) * (p.costPrice || 0),
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
      }))
      .sort((a, b) => b.totalValuation - a.totalValuation)
      .slice(0, 5);

    // Recent stock activity logs
    const recentActivity = await StockLog.find({ organizationId: req.organizationId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      stats: {
        totalSkus: products.length,
        totalUnits,
        totalCostValuation: Math.round(totalCostValuation * 100) / 100,
        totalRetailValuation: Math.round(totalRetailValuation * 100) / 100,
        estimatedProfitMargin:
          totalRetailValuation > 0
            ? Math.round(((totalRetailValuation - totalCostValuation) / totalRetailValuation) * 100)
            : 0,
        lowStockCount,
        outOfStockCount,
        healthyStockCount: products.length - lowStockCount - outOfStockCount,
        orgDefaultThreshold,
      },
      lowStockAlerts: lowStockItems.slice(0, 8),
      topValueProducts,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

