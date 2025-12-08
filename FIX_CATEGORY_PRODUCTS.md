# 🔧 Fix: Category Shows Product Count But Products Not Displaying

## ⚠️ Problem

Category shows product count (e.g., "1") but when clicking the category, products don't show.

---

## ✅ Solution

### Issue: Frontend Not Properly Filtering

The backend is working correctly. The issue is likely:

1. **Frontend not connected to backend** - Check `VITE_API_URL` is set
2. **Category slug mismatch** - URL parameter doesn't match category slug
3. **Products not loading** - Check browser console for errors

---

## 🧪 Test Backend

**Test category filter directly**:
```
https://hezak-backend.onrender.com/api/products?category=dgfb
```

**Should return**: Array with your product

**If this works** → Backend is fine, issue is frontend

---

## 🔍 Debug Steps

### Step 1: Check Browser Console

1. **Open** your frontend
2. **Press** F12 (Developer Tools)
3. **Console** tab → Look for errors
4. **Network** tab → Check API calls:
   - Should see: `GET /api/products?category=dgfb`
   - Check response status (200 = success)

### Step 2: Check URL

**When you click a category**, the URL should be:
```
https://your-frontend-url.com/shop?category=dgfb
```

**Verify**:
- Category slug in URL matches category slug in database
- No typos in slug

### Step 3: Check Frontend API URL

**In browser console**:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

**Should show**: `https://hezak-backend.onrender.com/api`

---

## 🔧 Quick Fixes

### Fix 1: Verify Category Slug

1. **Admin** → Categories
2. **Check** the slug of your category (e.g., "dgfb")
3. **Verify** it matches what's in the URL when you click it

### Fix 2: Clear Cache

1. **Hard refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Or** clear browser cache

### Fix 3: Check Network Tab

1. **F12** → **Network** tab
2. **Click** a category
3. **Look for** API call to `/api/products?category=...`
4. **Check**:
   - Status: 200 ✅
   - Response: Contains products ✅

---

## 📝 Common Issues

### Issue 1: Frontend Not Connected

**Symptom**: Network tab shows calls to `/api/products` (no domain)

**Fix**: Set `VITE_API_URL=https://hezak-backend.onrender.com/api` and redeploy

---

### Issue 2: Category Slug Mismatch

**Symptom**: Products exist but don't show for category

**Fix**: 
1. Check category slug in admin
2. Verify it matches URL parameter
3. Update if needed

---

### Issue 3: Products Not Loading

**Symptom**: Loading spinner never stops

**Fix**:
1. Check backend is running
2. Check CORS settings
3. Check browser console for errors

---

## ✅ Checklist

- [ ] Backend API works (`/api/products?category=slug` returns products)
- [ ] Frontend `VITE_API_URL` is set correctly
- [ ] Category slug matches URL parameter
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls
- [ ] Products are actually in that category (check admin)

---

**The backend is working - check frontend connection and category slug matching!** 🚀

