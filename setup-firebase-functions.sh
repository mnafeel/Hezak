#!/bin/bash

# Setup script to migrate backend to Firebase Functions

echo "🔥 Setting up Firebase Functions backend..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if already initialized
if [ ! -f "firebase.json" ]; then
    echo "📦 Initializing Firebase..."
    firebase init functions firestore storage
else
    echo "✅ Firebase already initialized"
fi

# Create functions directory structure
echo "📁 Creating functions directory structure..."
mkdir -p functions/src/backend

# Copy backend source code
echo "📋 Copying backend code..."
cp -r backend/src/* functions/src/backend/

# Create functions package.json if it doesn't exist
if [ ! -f "functions/package.json" ]; then
    echo "📝 Creating functions/package.json..."
    cat > functions/package.json << 'EOF'
{
  "name": "functions",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "lib/index.js",
  "dependencies": {
    "firebase-admin": "^13.6.0",
    "firebase-functions": "^5.1.1",
    "express": "^5.1.0",
    "cors": "^2.8.5",
    "bcrypt": "^6.0.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^2.0.2",
    "zod": "^4.1.12"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "@types/express": "^5.0.5",
    "@types/cors": "^2.8.19",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/multer": "^2.0.0"
  },
  "private": true
}
EOF
fi

# Create firebase.json if it doesn't exist
if [ ! -f "firebase.json" ]; then
    echo "📝 Creating firebase.json..."
    cat > firebase.json << 'EOF'
{
  "functions": {
    "source": "functions",
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
EOF
fi

# Create .firebaserc if it doesn't exist
if [ ! -f ".firebaserc" ]; then
    echo "📝 Creating .firebaserc..."
    cat > .firebaserc << 'EOF'
{
  "projects": {
    "default": "hezak-f6fb3"
  }
}
EOF
    echo "⚠️  Please update .firebaserc with your Firebase project ID!"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .firebaserc with your Firebase project ID"
echo "2. cd functions && npm install"
echo "3. Update functions/src/backend/src/utils/firebaseAdmin.ts (see guide)"
echo "4. Update functions/src/backend/src/config/database.ts (set USE_FIRESTORE=true)"
echo "5. firebase deploy --only functions"

