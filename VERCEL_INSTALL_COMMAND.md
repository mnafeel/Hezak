# 📦 Vercel Backend Install Command

## ✅ Correct Install Command

For backend root directory (`backend`), the install command should be:

```
npm install
```

**That's it!** Simple and straightforward.

---

## 📋 Complete Vercel Backend Settings

When root directory is `backend`, use these settings:

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Framework Preset** | `Other` |
| **Install Command** | `npm install` |
| **Build Command** | `npm install && npm run build` |
| **Output Directory** | `dist` |
| **Development Command** | `npm run dev` (optional) |

---

## 🔍 Why This Works

1. **Root Directory**: `backend` - Vercel knows to look in the backend folder
2. **Install Command**: `npm install` - Installs all dependencies from `backend/package.json`
3. **Build Command**: `npm install && npm run build` - Installs then builds TypeScript
4. **Output Directory**: `dist` - Where compiled JavaScript files go

---

## ⚠️ Common Mistakes

### ❌ Wrong:
```
cd frontend && npm install
```
This is for frontend, not backend!

### ❌ Wrong:
```
npm install --prefix backend
```
Not needed when root directory is already `backend`

### ✅ Correct:
```
npm install
```
Simple! Vercel automatically runs this in the `backend` folder.

---

## 🚀 Quick Setup

1. **Root Directory**: `backend`
2. **Install Command**: `npm install`
3. **Build Command**: `npm install && npm run build`
4. **Output Directory**: `dist`
5. **Deploy** ✅

---

## 💡 Notes

- The install command runs **automatically** in the root directory you set
- If root is `backend`, `npm install` runs in the `backend/` folder
- No need for `cd` commands when root directory is set correctly
- The build command includes `npm install` to ensure dependencies are installed

---

**Install Command: `npm install` - That's all you need!** 📦

