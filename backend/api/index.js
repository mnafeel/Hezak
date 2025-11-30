// Vercel serverless function handler
// This file is used when deploying to Vercel
const { app } = require('../dist/app.js');

// Vercel serverless functions need to export a handler
// that receives (req, res) and passes them to Express
module.exports = (req, res) => {
  // Vercel sends requests with the full path including /api
  // Express app already has /api prefix, so we need to adjust the path
  // If the path starts with /api, keep it as is (Express will handle it)
  // Otherwise, pass through as is
  return app(req, res);
};

