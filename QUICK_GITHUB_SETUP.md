# ⚡ Quick GitHub Pages Setup

## 🚀 3 Simple Steps

### Step 1: Update Repository Name

**IMPORTANT:** Open `frontend/vite.config.ts` and change:
```typescript
const REPO_NAME = 'Ecommerce-Web-hezak'; // ⚠️ CHANGE THIS
```
To match your GitHub repository name!

### Step 2: Initialize Git & Push

```bash
cd "/Users/admin/Ecommerce Web hezak"

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. **Settings** → **Pages**
3. **Source**: Select `GitHub Actions`
4. Done! 🎉

## ✅ Your Site Will Be Live At:

`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## 🔄 Auto-Deploy

Every push to `main` branch automatically deploys your site!

---

**That's it! Your site will be live in 2-3 minutes!** 🚀

