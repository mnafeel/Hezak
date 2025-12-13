import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

// Initialize Firebase Admin (auto-initialized in Functions, but safe to call)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Create Express app
const app = express();

// CORS configuration - allow all origins in production
app.use(cors({
  origin: true, // Allow all origins, or specify: ['https://your-frontend.vercel.app']
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
    service: 'Firebase Functions',
    region: 'us-central1'
  });
});

// Import routes from backend (after copying backend code)
// Uncomment after running setup script:
// import { router } from './backend/routes';
// app.use('/api', router);

// Temporary route for testing
app.get('/api/test', (_req, res) => {
  res.json({ message: 'Firebase Functions backend is working!' });
});

// Export as Firebase Function
// Change region as needed (us-central1, us-east1, europe-west1, asia-northeast1, etc.)
export const api = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB' // Can be: 128MB, 256MB, 512MB, 1GB, 2GB, 4GB, 8GB
  })
  .https.onRequest(app);
