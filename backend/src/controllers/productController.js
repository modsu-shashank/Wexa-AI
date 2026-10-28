const Product = require('../models/Product');
const Organization = require('../models/Organization');
const StockLog = require('../models/StockLog');

// Helper to determine low stock threshold
const getEffectiveThreshold = (productThreshold, orgDefault = 5) => {
  return productThreshold !== null && productThreshold !== undefined && productThreshold !== ''
    ? Number(productThreshold)
    : Number(orgDefault);
};

// GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const {
      search = '',
      status = 'all',
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const organization = await Organization.findById(req.organizationId);
    const orgDefaultThreshold = organization ? organization.defaultLowStockThreshold : 5;

    // Base query scoped to organization
    const query = { organizationId: req.organizationId };

    // Search filter across SKU, Name, Description
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { description: searchRegex },
      ];
    }

    // Status filter: in, low, out
    if (status === 'out') {
      query.quantityOnHand = { $lte: 0 };
    }

    // Sort order
    const sort = {};
    const validSortFields = ['name', 'sku', 'quantityOnHand', 'costPrice', 'sellingPrice', 'updatedAt', 'createdAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'updatedAt';
    sort[field] = sortOrder === 'asc' ? 1 : -1;

    // Fetch products
    let products = await Product.find(query).sort(sort).lean();

    // Compute status flags for each product
    products = products.map((prod) => {
      const effectiveThreshold = getEffectiveThreshold(prod.lowStockThreshold, orgDefaultThreshold);
      const isOutOfStock = prod.quantityOnHand <= 0;
      const isLowStock = !isOutOfStock && prod.quantityOnHand <= effectiveThreshold;
      return {
        ...prod,
        effectiveThreshold,
        isOutOfStock,
        isLowStock,
        status: isOutOfStock ? 'OUT_OF_STOCK' : isLowStock ? 'LOW_STOCK' : 'IN_STOCK',
      };
    });

    // In-memory filter for low-stock and in-stock if status requested
    if (status === 'low') {
      products = products.filter((p) => p.isLowStock);
    } else if (status === 'in') {
      products = products.filter((p) => p.status === 'IN_STOCK');
    }

    // Aggregate counts for summary stats
    const allOrgProducts = await Product.find({ organizationId: req.organizationId }).lean();
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalStockValueCost = 0;
    let totalStockValueRetail = 0;

    allOrgProducts.forEach((p) => {
      const thr = getEffectiveThreshold(p.lowStockThreshold, orgDefaultThreshold);
      const qty = p.quantityOnHand || 0;
      if (qty <= 0) {
        outOfStockCount++;
      } else if (qty <= thr) {
        lowStockCount++;
      }
      totalStockValueCost += qty * (p.costPrice || 0);
      totalStockValueRetail += qty * (p.sellingPrice || 0);
    });

    // Pagination
    const totalCount = products.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = products.slice(startIndex, startIndex + limitNum);

    res.status(200).json({
      success: true,
      products: paginatedProducts,
      pagination: {
        total: totalCount,
        page: pageNum,
        pages: Math.ceil(totalCount / limitNum) || 1,
        limit: limitNum,
      },
      summary: {
        totalSkus: allOrgProducts.length,
        lowStockCount,
        outOfStockCount,
        inStockCount: allOrgProducts.length - lowStockCount - outOfStockCount,
        totalStockValueCost: Math.round(totalStockValueCost * 100) / 100,
        totalStockValueRetail: Math.round(totalStockValueRetail * 100) / 100,
        orgDefaultThreshold,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in your organization.',
      });
    }

    const organization = await Organization.findById(req.organizationId);
    const orgDefaultThreshold = organization ? organization.defaultLowStockThreshold : 5;
    const effectiveThreshold = getEffectiveThreshold(product.lowStockThreshold, orgDefaultThreshold);

    // Fetch stock logs for this product
    const stockHistory = await StockLog.find({
      organizationId: req.organizationId,
      productId: product._id,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const isOutOfStock = product.quantityOnHand <= 0;
    const isLowStock = !isOutOfStock && product.quantityOnHand <= effectiveThreshold;

    res.status(200).json({
      success: true,
      product: {
        ...product,
        effectiveThreshold,
        isOutOfStock,
        isLowStock,
        status: isOutOfStock ? 'OUT_OF_STOCK' : isLowStock ? 'LOW_STOCK' : 'IN_STOCK',
      },
      stockHistory,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      description = '',
      quantityOnHand = 0,
      costPrice = 0,
      sellingPrice = 0,
      lowStockThreshold = null,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required.',
      });
    }

    if (!sku || !sku.trim()) {
      return res.status(400).json({
        success: false,
        message: 'SKU (Stock Keeping Unit) is required.',
      });
    }

    const cleanSku = sku.trim().toUpperCase();

    // Check SKU uniqueness within this organization
    const existingSku = await Product.findOne({
      organizationId: req.organizationId,
      sku: cleanSku,
    });

    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: `SKU "${cleanSku}" already exists in your organization. Each product must have a unique SKU.`,
      });
    }

    const parsedQty = Math.max(0, Math.round(Number(quantityOnHand) || 0));
    const parsedCost = Math.max(0, Number(costPrice) || 0);
    const parsedSelling = Math.max(0, Number(sellingPrice) || 0);
    const parsedThreshold =
      lowStockThreshold !== null && lowStockThreshold !== '' && lowStockThreshold !== undefined
        ? Math.max(0, Number(lowStockThreshold))
        : null;

    const product = await Product.create({
      organizationId: req.organizationId,
      name: name.trim(),
      sku: cleanSku,
      description: (description || '').trim(),
      quantityOnHand: parsedQty,
      costPrice: parsedCost,
      sellingPrice: parsedSelling,
      lowStockThreshold: parsedThreshold,
      lastUpdatedBy: req.user.email,
      lastStockAdjustmentNote: 'Initial stock creation',
    });

    // Record initial stock log
    if (parsedQty > 0) {
      await StockLog.create({
        organizationId: req.organizationId,
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        action: 'INITIAL',
        previousQuantity: 0,
        quantityDelta: parsedQty,
        newQuantity: parsedQty,
        reason: 'Initial inventory entry',
        performedBy: req.user.email,
      });
    }

    res.status(201).json({
      success: true,
      message: `Product "${product.name}" created successfully.`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const { name, sku, description, costPrice, sellingPrice, lowStockThreshold } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in your organization.',
      });
    }

    if (name) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();

    if (sku) {
      const cleanSku = sku.trim().toUpperCase();
      if (cleanSku !== product.sku) {
        const skuExists = await Product.findOne({
          organizationId: req.organizationId,
          sku: cleanSku,
          _id: { $ne: product._id },
        });

        if (skuExists) {
          return res.status(409).json({
            success: false,
            message: `SKU "${cleanSku}" is already taken by another product in your organization.`,
          });
        }
        product.sku = cleanSku;
      }
    }

    if (costPrice !== undefined) product.costPrice = Math.max(0, Number(costPrice) || 0);
    if (sellingPrice !== undefined) product.sellingPrice = Math.max(0, Number(sellingPrice) || 0);
    if (lowStockThreshold !== undefined) {
      product.lowStockThreshold =
        lowStockThreshold === null || lowStockThreshold === ''
          ? null
          : Math.max(0, Number(lowStockThreshold));
    }

    product.lastUpdatedBy = req.user.email;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/products/:id/adjust-stock
exports.adjustStock = async (req, res, next) => {
  try {
    const { type, amount, reason } = req.body;

    if (!type || !['ADD', 'REMOVE', 'SET'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid adjustment type. Must be one of ADD, REMOVE, or SET.',
      });
    }

    const parsedAmount = Math.round(Number(amount));
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment amount must be a positive number.',
      });
    }

    const note = (reason || '').trim() || `Manual stock ${type.toLowerCase()}`;

    const product = await Product.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const previousQuantity = product.quantityOnHand;
    let newQuantity = previousQuantity;
    let delta = 0;

    if (type === 'ADD') {
      delta = parsedAmount;
      newQuantity = previousQuantity + parsedAmount;
    } else if (type === 'REMOVE') {
      if (parsedAmount > previousQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot remove ${parsedAmount} units. Only ${previousQuantity} units available in stock.`,
        });
      }
      delta = -parsedAmount;
      newQuantity = previousQuantity - parsedAmount;
    } else if (type === 'SET') {
      delta = parsedAmount - previousQuantity;
      newQuantity = parsedAmount;
    }

    product.quantityOnHand = newQuantity;
    product.lastStockAdjustmentNote = `${type} (${delta >= 0 ? '+' : ''}${delta}): ${note}`;
    product.lastUpdatedBy = req.user.email;
    await product.save();

    // Log the transaction
    const log = await StockLog.create({
      organizationId: req.organizationId,
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      action: type,
      previousQuantity,
      quantityDelta: delta,
      newQuantity,
      reason: note,
      performedBy: req.user.email,
    });

    res.status(200).json({
      success: true,
      message: `Stock updated successfully. New quantity: ${newQuantity}`,
      product,
      log,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or already deleted.',
      });
    }

    // Clean up stock logs for this product
    await StockLog.deleteMany({
      productId: product._id,
      organizationId: req.organizationId,
    });

    res.status(200).json({
      success: true,
      message: `Product "${product.name}" (SKU: ${product.sku}) was deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

