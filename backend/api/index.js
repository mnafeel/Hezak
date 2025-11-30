// Vercel serverless function handler
// This file is used when deploying to Vercel
const { app } = require('../dist/app.js');

// Export as Vercel serverless function
// Vercel will auto-detect this as a Node.js function
module.exports = app;
