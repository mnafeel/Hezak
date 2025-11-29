# 🔧 Vercel Backend Setup - Fix Build Settings

## ⚠️ Problem: Wrong Build Command

When you select `backend` as root directory, Vercel might still show frontend build commands.

## ✅ Solution: Manual Configuration

### Step 1: Create Backend Project

1. **Go to**: https://vercel.com
2. **Add New Project**
3. **Import** `Hezak` repository
4. **Click** "Configure Project"

### Step 2: Set Root Directory

1. **Root Directory**: Click "Edit" 
2. **Type**: `backend`
3. **Save**

### Step 3: Override Build Settings

**IMPORTANT**: After setting root directory, manually override these:

1. **Framework Preset**: Select **"Other"** or **"Node.js"**

2. **Build Command**: 
   ```
   npm install && npm run build
   ```

3. **Output Directory**: 
   ```
   dist
   ```

4. **Install Command**: 
   ```
   npm install
   ```

5. **Development Command**: (Leave empty or)
   ```
   npm run dev
   ```

### Step 4: Environment Variables

Add these in **Environment Variables** section:

```
JWT_SECRET=your-secret-key-here
NODE_ENV=production
PORT=4000
```

**Or use Vercel Postgres:**
1. Go to **Storage** tab
2. **Create** → **Postgres**
3. Vercel auto-adds `POSTGRES_URL`

### Step 5: Deploy

Click **"Deploy"** ✅

---

## 📋 Correct Settings Summary

When root directory is `backend`:

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Framework** | Other / Node.js |
| **Build Command** | `npm install && npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node.js Version** | 20.x (or latest) |

---

## 🔍 Verify Settings

After deployment, check:
1. **Deployment logs** should show:
   - `npm install` running
   - `npm run build` running
   - Building TypeScript files
   - Output in `dist/` folder

2. **If you see frontend commands**, the root directory is wrong!

---

## 🐛 Troubleshooting

### Issue: Still showing frontend commands

**Fix:**
1. Delete the project in Vercel
2. Create new project
3. **Before importing**, make sure to set root directory FIRST
4. Or manually edit after import

### Issue: Build fails

**Check:**
1. Root directory is `backend` (not empty)
2. Build command is `npm install && npm run build`
3. Output directory is `dist`
4. Node.js version is 20.x

### Issue: Can't find module errors

**Fix:**
1. Make sure `installCommand` is `npm install`
2. Check that `package.json` exists in `backend/` folder
3. Verify all dependencies are in `package.json`

---

## ✅ Quick Checklist

- [ ] Root Directory: `backend`
- [ ] Framework: Other/Node.js
- [ ] Build Command: `npm install && npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`
- [ ] Environment Variables: Added
- [ ] Deploy ✅

---

## 🚀 After Deployment

Your backend will be at:
`https://your-backend-project.vercel.app`

**Test it:**
- `https://your-backend-project.vercel.app/health` should return `{"status":"ok"}`

**Connect frontend:**
- Add `VITE_API_URL=https://your-backend-project.vercel.app/api` to frontend project

---

**Follow these steps to fix the build settings!** 🔧

