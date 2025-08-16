const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Load all middleware into the app
function applyMiddleware(app) {
  // Enable CORS for all origins (you can restrict it later)
  app.use(cors());

  // Parse JSON bodies
  app.use(express.json());

  // Parse URL-encoded data (optional if using forms)
  app.use(express.urlencoded({ extended: true }));

  // Request logging (only in development)
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }

  // Custom middleware example: log request method + URL
  // app.use((req, res, next) => {
  //   console.log(`${req.method} ${req.path}`);
  //   next();
  // });
}

// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
}

module.exports = {
  applyMiddleware,
  errorHandler
};
