#!/bin/bash

# Firebase Configuration Setup Script
# This script helps you set up Firebase environment variables

echo "🔥 Firebase Configuration Setup"
echo "================================"
echo ""
echo "You provided this API Key: T5RzgmZ20sF2i9hMPoBCAPjVFLuE1BcZOi4Igf_gwFw"
echo ""
echo "To complete the setup, you need to get the following from Firebase Console:"
echo "1. Go to: https://console.firebase.google.com/"
echo "2. Select your project"
echo "3. Click ⚙️ → Project settings"
echo "4. Scroll to 'Your apps' → Click Web icon"
echo "5. Copy the config values"
echo ""
echo "Enter the following values (or press Enter to skip):"
echo ""

read -p "Firebase Auth Domain (e.g., your-project.firebaseapp.com): " AUTH_DOMAIN
read -p "Firebase Project ID: " PROJECT_ID
read -p "Firebase Storage Bucket (e.g., your-project.appspot.com): " STORAGE_BUCKET
read -p "Firebase Messaging Sender ID: " SENDER_ID
read -p "Firebase App ID: " APP_ID

# Create frontend .env file
if [ ! -z "$AUTH_DOMAIN" ] && [ ! -z "$PROJECT_ID" ]; then
  cat > frontend/.env << EOF
# Firebase Configuration
VITE_FIREBASE_API_KEY=T5RzgmZ20sF2i9hMPoBCAPjVFLuE1BcZOi4Igf_gwFw
VITE_FIREBASE_AUTH_DOMAIN=${AUTH_DOMAIN}
VITE_FIREBASE_PROJECT_ID=${PROJECT_ID}
VITE_FIREBASE_STORAGE_BUCKET=${STORAGE_BUCKET}
VITE_FIREBASE_MESSAGING_SENDER_ID=${SENDER_ID}
VITE_FIREBASE_APP_ID=${APP_ID}
EOF
  echo ""
  echo "✅ Created frontend/.env file!"
  echo ""
else
  echo ""
  echo "⚠️  Skipped creating .env file. Please create it manually."
  echo "   See frontend/.env.template for reference"
  echo ""
fi

echo "Next steps:"
echo "1. Enable Google Sign-In in Firebase Console → Authentication → Sign-in method"
echo "2. Get service account key for backend (see GOOGLE_LOGIN_SETUP.md)"
echo "3. Test Google login on your login page"
echo ""

