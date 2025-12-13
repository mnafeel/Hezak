import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import path from 'path';

// Initialize Firebase Admin (auto-initialized in Functions, but safe to call)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import routes
import { router } from './backend/routes';

// Create Express app
const app = express();

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins in production, or specify: ['https://your-frontend.vercel.app']
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Firebase Functions'
  });
});

// API routes
app.use('/api', router);

// Export as Firebase Function
// Change region as needed (us-central1, us-east1, europe-west1, etc.)
export const api = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB' // Increase if needed (128MB, 256MB, 512MB, 1GB, 2GB, 4GB, 8GB)
  })
  .https.onRequest(app);

