# 🔧 Fix Firestore Index Error

## ❌ Error

```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

**Cause**: Firestore requires composite indexes for queries with multiple `orderBy` clauses.

---

## ✅ Solution Applied

**Fixed**: Changed query to fetch all categories and sort in memory instead of using multiple `orderBy` clauses.

**Before**:
```typescript
.orderBy('isTopSelling', 'desc')
.orderBy('name', 'asc')
```

**After**:
```typescript
// Fetch all, then sort in memory
categories.sort((a, b) => {
  if (a.isTopSelling !== b.isTopSelling) {
    return a.isTopSelling ? -1 : 1;
  }
  return a.name.localeCompare(b.name);
});
```

---

## 🎯 Alternative: Create Index (Optional)

If you want to use Firestore's native sorting (better for large datasets):

1. **Click the link** in the error message:
   ```
   https://console.firebase.google.com/v1/r/project/hezak-f6fb3/firestore/indexes?create_composite=...
   ```

2. **Or manually create**:
   - Go to: https://console.firebase.google.com
   - Select: `hezak-f6fb3` project
   - **Firestore Database** → **Indexes** tab
   - **Create Index**
   - Collection: `categories`
   - Fields:
     - `isTopSelling` (Descending)
     - `name` (Ascending)
   - **Create**

---

## ✅ Current Status

- ✅ **Fixed**: Query simplified to avoid index requirement
- ✅ **Works**: Categories will load without index
- ⏳ **Optional**: Create index for better performance (if you have many categories)

---

**The error is fixed! Categories should load now.** ✅

