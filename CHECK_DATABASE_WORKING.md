# ✅ Check if Database is Working

## 🧪 Quick Tests

### Test 1: Health Endpoint

**Test backend is running**:
```bash
curl https://hezak-backend.onrender.com/health
```

**Should return**:
```json
{"status":"ok","timestamp":"2025-12-06T..."}
```

**If this works** → Backend is running ✅

---

### Test 2: Products API

**Test database connection**:
```bash
curl https://hezak-backend.onrender.com/api/products
```

**Should return**:
- `[]` (empty array) = Database working, no products yet ✅
- `[{...}]` (array with products) = Database working with data ✅
- Error = Database issue ❌

---

### Test 3: Categories API

**Test database connection**:
```bash
curl https://hezak-backend.onrender.com/api/categories
```

**Should return**:
- `[]` (empty array) = Database working, no categories yet ✅
- `[{...}]` (array with categories) = Database working with data ✅
- Error = Database issue ❌

---

## 🔍 Check Database Status

### Option 1: Test via Browser

**Open in browser**:

1. **Health**: `https://hezak-backend.onrender.com/health`
   - Should show: `{"status":"ok",...}`

2. **Products**: `https://hezak-backend.onrender.com/api/products`
   - Should show: `[]` or array of products

3. **Categories**: `https://hezak-backend.onrender.com/api/categories`
   - Should show: `[]` or array of categories

---

### Option 2: Check Render Logs

1. **Render Dashboard** → Backend service
2. **Logs** tab
3. **Look for**:
   - ✅ "API server ready" = Server started
   - ✅ No database errors = Database working
   - ❌ "Cannot find module" = Missing dependency
   - ❌ "Table does not exist" = Database not initialized

---

### Option 3: Test Admin Panel

1. **Login** to admin panel
2. **Try to**:
   - View products
   - Add a product
   - View categories
3. **If it works** → Database is working ✅

---

## 🗄️ View Database Data

### Option 1: Use Admin Panel

1. **Login** to admin
2. **Go to**: Products / Categories / Orders
3. **View** your data

---

### Option 2: Use Prisma Studio (Local Only)

**For local development**:

```bash
cd backend
npx prisma studio
```

**Opens at**: `http://localhost:5555`

**View**:
- Products
- Categories
- Orders
- Users
- Banners

---

### Option 3: Test API Endpoints

**Create a test product via API**:

```bash
curl -X POST https://hezak-backend.onrender.com/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "Testing database",
    "price": 1000,
    "imageUrl": "https://example.com/image.jpg",
    "itemType": "test"
  }'
```

**Then check**:
```bash
curl https://hezak-backend.onrender.com/api/products
```

**If product appears** → Database is working! ✅

---

## ✅ Database Working Checklist

- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Products API returns `[]` or products array
- [ ] Categories API returns `[]` or categories array
- [ ] No errors in Render logs
- [ ] Can add products via admin panel
- [ ] Can view products via admin panel
- [ ] Data persists after redeployment

---

## 🔧 If Database Not Working

### Issue 1: "Table does not exist"

**Fix**: Database not initialized

**Solution**:
1. **Render** → Backend → **Manual Deploy**
2. **Or** check build logs for `prisma db push` success

---

### Issue 2: "Cannot connect to database"

**Fix**: Database file not accessible

**Solution**:
1. **Check** `DATABASE_URL` environment variable
2. **Verify** it's set to `file:./dev.db`
3. **Redeploy** backend

---

### Issue 3: Data not persisting

**Fix**: Database file location issue

**Solution**:
1. **Check** Render logs for database path
2. **Verify** `dev.db` is in correct location
3. **Check** if database persists between deployments

---

## 📊 Current Database Status

**Your database is**: SQLite  
**Location**: Render server → `backend/prisma/dev.db`  
**Status**: ✅ Working (tested)

---

## 🧪 Quick Test Commands

**Run these to test**:

```bash
# Test health
curl https://hezak-backend.onrender.com/health

# Test products
curl https://hezak-backend.onrender.com/api/products

# Test categories  
curl https://hezak-backend.onrender.com/api/categories
```

**All should return JSON** (even if empty arrays) ✅

---

**Your database is working! Test it using the methods above!** 🚀

