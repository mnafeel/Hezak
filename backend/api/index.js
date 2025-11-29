// Vercel serverless function handler
// This file is used when deploying to Vercel
const { app } = require('../dist/app.js');

// Vercel serverless functions need to export a handler
// that receives (req, res) and passes them to Express
module.exports = (req, res) => {
  // Remove /api prefix if present (Vercel routes handle it)
  // The app already has /api prefix in routes, so we need to handle this
  return app(req, res);
};

