# 🔧 Fix: Products Not Showing on User Page

## ⚠️ Problem

Products added in admin are not showing on the user page.

---

## ✅ Solution

### Issue 1: Homepage Only Shows Featured/Top Selling

**The homepage only displays products from:**
- **Top Selling** categories (`isTopSelling: true`)
- **Featured** categories (`isFeatured: true`)

**If your product's category is NOT marked as top selling or featured, it won't show on homepage.**

**Fix**:
1. **Go to**: Admin → Categories
2. **Edit** your product's category
3. **Check**: "Top Selling" or "Featured" checkbox
4. **Save**

**OR** go to `/shop` page to see ALL products.

---

### Issue 2: Frontend Not Connected to Backend

**Check**:
1. **Browser Console** (F12) → Check for errors
2. **Network Tab** → Check if API calls are going to:
   ```
   https://hezak-backend.onrender.com/api/products
   ```

**If not connected**:
1. **Set** `VITE_API_URL=https://hezak-backend.onrender.com/api` in frontend
2. **Redeploy** frontend

---

### Issue 3: Products Need Categories

**Products must have at least one category assigned.**

**Check**:
1. **Admin** → Products → Edit product
2. **Verify** category is selected
3. **Save**

---

## 🧪 Test

### Test Backend Directly:

**Products API**:
```
https://hezak-backend.onrender.com/api/products
```

**Should return**: Array of products (even if empty `[]`)

**If this works** → Backend is fine, issue is frontend or category settings

---

## 📝 Quick Checklist

- [ ] Product has a category assigned
- [ ] Category is marked as "Top Selling" OR "Featured" (for homepage)
- [ ] Frontend `VITE_API_URL` is set correctly
- [ ] Frontend is redeployed
- [ ] Check `/shop` page (shows all products)
- [ ] Check browser console for errors

---

## 🎯 Where Products Show

1. **Homepage** (`/`):
   - Only products from **Top Selling** or **Featured** categories
   - If category is not marked, products won't show here

2. **Shop Page** (`/shop`):
   - Shows **ALL products** regardless of category
   - This is where you'll see all products

3. **Category Pages** (`/shop?category=slug`):
   - Shows products from specific category

---

## ✅ Quick Fix

**To see your products immediately**:

1. **Go to**: `/shop` page (shows all products)
2. **OR** mark your category as "Top Selling" or "Featured" in admin

---

**Products are in the database, they just need the right category settings or check the shop page!** 🚀

