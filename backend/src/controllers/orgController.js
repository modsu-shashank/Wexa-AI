const Organization = require('../models/Organization');

exports.getOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found.',
      });
    }

    res.status(200).json({
      success: true,
      organization,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrganization = async (req, res, next) => {
  try {
    const { name, defaultLowStockThreshold } = req.body;

    const organization = await Organization.findById(req.organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found.',
      });
    }

    if (name && name.trim()) {
      organization.name = name.trim();
    }

    if (defaultLowStockThreshold !== undefined) {
      const threshold = Number(defaultLowStockThreshold);
      if (isNaN(threshold) || threshold < 0) {
        return res.status(400).json({
          success: false,
          message: 'Default low stock threshold must be a non-negative number.',
        });
      }
      organization.defaultLowStockThreshold = Math.round(threshold);
    }

    await organization.save();

    res.status(200).json({
      success: true,
      message: 'Organization settings updated successfully.',
      organization,
    });
  } catch (error) {
    next(error);
  }
};

