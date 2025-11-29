# 🔧 Fix Vercel Auto-Detecting Express Framework

## ⚠️ Problem

When you set root directory to `backend`, Vercel automatically detects Express and locks the framework to "Express" - you can't change it!

## ✅ Solution: Override in vercel.json

The `backend/vercel.json` is now configured to use `"framework": "other"` which prevents auto-detection.

## 🚀 Steps to Fix

### Option 1: Delete and Recreate Project (Recommended)

1. **Delete** the current Vercel project
2. **Create New Project**
3. **Import** `Hezak` repository
4. **Before clicking Deploy**, click **"Configure Project"**
5. **Set Root Directory**: `backend`
6. **Framework** should now show as **"Other"** (not Express)
7. **Build Command**: `npm install && npm run build`
8. **Output Directory**: `dist`
9. **Deploy** ✅

### Option 2: Override via Settings

1. **Go to** your Vercel project
2. **Settings** → **General**
3. **Root Directory**: Make sure it's `backend`
4. **Scroll down** to **Build & Development Settings**
5. **Override** these manually:
   - **Framework Preset**: Click "Override" → Select **"Other"**
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. **Save**
7. **Redeploy**

### Option 3: Use vercel.json (Already Done!)

The `backend/vercel.json` file now has:
```json
{
  "framework": "other",
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist"
}
```

**After setting root to `backend`, Vercel should use these settings!**

---

## 🔍 Verify It's Fixed

After deployment, check the **Build Logs**:

✅ **Correct** (should see):
```
npm install
npm run build
Building TypeScript...
```

❌ **Wrong** (if you see):
```
cd frontend && npm install
```

---

## 🐛 If Still Showing Express

### Method 1: Ignore vercel.json Detection

1. In Vercel project settings
2. **General** → **Root Directory**: `backend`
3. **Build & Development Settings**:
   - **Override** Framework Preset → **"Other"**
   - **Override** Build Command → `npm install && npm run build`
   - **Override** Output Directory → `dist`
4. **Save** and **Redeploy**

### Method 2: Remove Express Detection

Vercel detects Express by looking for:
- `express` in `package.json` dependencies
- `app.listen()` or Express patterns

**You can't remove Express** (it's needed), but you can override the framework setting.

### Method 3: Use .vercelignore

Create `backend/.vercelignore`:
```
# Ignore auto-detection
```

This won't help with framework detection, but the `vercel.json` override should work.

---

## 📋 Correct Settings Checklist

When root is `backend`:

- [ ] **Root Directory**: `backend`
- [ ] **Framework Preset**: **"Other"** (not Express)
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Output Directory**: `dist`
- [ ] **Install Command**: `npm install`
- [ ] **Node.js Version**: 20.x

---

## ✅ Quick Fix

1. **Delete** Vercel project
2. **Create new** project
3. **Import** `Hezak`
4. **Set Root**: `backend`
5. **Framework**: Should show "Other" now (thanks to vercel.json)
6. **Deploy** ✅

---

## 💡 Why This Happens

Vercel auto-detects frameworks by:
1. Looking at `package.json` dependencies
2. Finding `express` → Detects as Express framework
3. Auto-configures build settings

**Solution**: `vercel.json` with `"framework": "other"` overrides this!

---

**The `backend/vercel.json` is now configured correctly!** 

**Delete and recreate the project, or override settings manually!** 🔧

