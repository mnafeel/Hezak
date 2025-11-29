// Vercel serverless function handler
// This file is used when deploying to Vercel
const { app } = require('../dist/app.js');

// Export the Express app for Vercel serverless functions
module.exports = app;

