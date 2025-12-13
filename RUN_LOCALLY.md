# Running the Application Locally

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Create .env file (if not exists)
# Copy the example below and fill in your values
```

**Backend `.env` file:**
```env
# Server
PORT=4000
NODE_ENV=development

# Database (SQLite for local development)
DATABASE_URL="file:./dev.db"

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Admin credentials (default)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Firebase (optional - for Google login and Firestore)
# If you want to use Firestore, set USE_FIRESTORE=true
USE_FIRESTORE=false
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
USE_FIREBASE_STORAGE=false
```

**Start Backend:**
```bash
# Development mode (with auto-reload)
npm run dev

# The backend will run on http://localhost:4000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# The frontend will run on http://localhost:5173
```

**Frontend `.env` file (optional):**
```env
# If you want to use a different backend URL
VITE_API_URL=http://localhost:4000/api
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **API Health Check**: http://localhost:4000/health

## Default Admin Login

- **Email**: `admin@example.com`
- **Password**: `admin123` (or whatever you set in `.env`)

## Troubleshooting

### Backend won't start

1. **Check if port 4000 is available:**
   ```bash
   lsof -i :4000
   # If something is using it, kill it or change PORT in .env
   ```

2. **Check database:**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Push database schema
   npx prisma db push
   ```

3. **Check environment variables:**
   ```bash
   # Make sure .env file exists in backend directory
   ls -la backend/.env
   ```

### Frontend can't connect to backend

1. **Check if backend is running:**
   ```bash
   curl http://localhost:4000/health
   # Should return: {"status":"ok",...}
   ```

2. **Check Vite proxy:**
   - The frontend uses Vite proxy to forward `/api` requests to `http://localhost:4000`
   - Check `frontend/vite.config.ts` - proxy should be configured

3. **Check browser console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab to see if API calls are being made

### Products not showing

1. **Check backend logs:**
   - Look for errors in the backend terminal
   - Check if products are being returned: `curl http://localhost:4000/api/products`

2. **Check browser console:**
   - Look for the debug logs we added
   - Check for CORS errors
   - Check for network errors

3. **Verify database:**
   ```bash
   # Open Prisma Studio to view database
   cd backend
   npm run prisma:studio
   # This opens a GUI at http://localhost:5555
   ```

## Using Firestore Locally

If you want to use Firestore instead of SQLite:

1. **Set in backend `.env`:**
   ```env
   USE_FIRESTORE=true
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   ```

2. **Restart backend:**
   ```bash
   npm run dev
   ```

## Using Firebase Storage Locally

If you want to use Firebase Storage for images:

1. **Set in backend `.env`:**
   ```env
   USE_FIREBASE_STORAGE=true
   ```

2. **Make sure `FIREBASE_SERVICE_ACCOUNT` is set**

3. **Restart backend**

## Development Tips

- **Backend auto-reloads** when you change files (using `ts-node-dev`)
- **Frontend hot-reloads** when you change files (using Vite)
- **Check logs** in both terminals for errors
- **Use Prisma Studio** to view/edit database: `npm run prisma:studio`

## Common Commands

### Backend
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Open database GUI
```

### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

