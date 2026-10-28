const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[StockFlow Backend API] running on port ${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
});
