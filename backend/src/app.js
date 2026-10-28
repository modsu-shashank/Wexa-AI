require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const orgRoutes = require('./routes/orgRoutes');

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// Database connection middleware for serverless invocations
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware Error]:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Database connection error. Please ensure MONGODB_URI is configured.',
      error: err.message,
    });
  }
});

// Health check
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'stockflow-backend',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount routes on both /api/* and root /* to ensure seamless compatibility with Netlify Functions rewrites
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/dashboard', dashboardRoutes);

app.use('/api/organization', orgRoutes);
app.use('/organization', orgRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;

