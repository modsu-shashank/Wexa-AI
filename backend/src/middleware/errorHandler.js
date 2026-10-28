const errorHandler = (err, req, res, next) => {
  console.error('[Error caught in middleware]:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => el.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors,
    });
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    
    if (field === 'sku') {
      return res.status(409).json({
        success: false,
        message: `A product with SKU "${value}" already exists in your organization. SKUs must be unique.`,
      });
    }

    if (field === 'email') {
      return res.status(409).json({
        success: false,
        message: `An account with email "${value}" already exists.`,
      });
    }

    return res.status(409).json({
      success: false,
      message: `Duplicate entry for ${field}: "${value}".`,
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format for: ${err.path}`,
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;

