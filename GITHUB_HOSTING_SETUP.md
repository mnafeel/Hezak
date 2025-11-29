# 🚀 GitHub Pages Hosting Setup Guide

## Step 1: Initialize Git Repository

Run these commands in your terminal:

```bash
cd "/Users/admin/Ecommerce Web hezak"

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: E-commerce website"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `Ecommerce-Web-hezak` (or your preferred name)
3. Description: "E-commerce website with admin panel"
4. Choose: **Public** (for free GitHub Pages) or **Private**
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

## Step 3: Update Base Path (IMPORTANT!)

**Before pushing**, update the base path in `frontend/vite.config.ts`:

If your repository name is `Ecommerce-Web-hezak`, the base should be:
```typescript
const base = '/Ecommerce-Web-hezak/';
```

If your repository name is different, change it to match:
```typescript
const base = '/your-repo-name/';
```

For a custom domain (root), use:
```typescript
const base = '/';
```

## Step 4: Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/Ecommerce-Web-hezak.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Source**: `GitHub Actions`
4. Save

## Step 6: Configure API URL (Optional)

If your backend is hosted elsewhere, add it as a secret:

1. Go to repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `VITE_API_URL`
4. Value: `https://your-backend-url.com/api`
5. Click **Add secret**

## Step 7: Deploy

After pushing, GitHub Actions will automatically:
1. Build your frontend
2. Deploy to GitHub Pages

**Your site will be live at:**
- `https://YOUR_USERNAME.github.io/Ecommerce-Web-hezak/`

## 🔄 Updating Your Site

Every time you push to the `main` branch, your site will automatically rebuild and deploy:

```bash
git add .
git commit -m "Update website"
git push
```

## 🎯 Custom Domain (Optional)

1. In your repository → **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Add a `CNAME` file in `frontend/public/` with your domain
4. Update DNS records as instructed by GitHub

## ⚠️ Important Notes

1. **Base Path**: Make sure the base path in `vite.config.ts` matches your repository name
2. **API URL**: Set `VITE_API_URL` secret if your backend is on a different server
3. **Build Time**: First deployment takes 2-3 minutes
4. **Updates**: Changes appear within 1-2 minutes after push

## 🐛 Troubleshooting

**"404 on routes":**
- Check base path in `vite.config.ts` matches repository name
- Make sure it starts and ends with `/`

**"API errors":**
- Set `VITE_API_URL` secret in GitHub repository settings
- Or update `.env.production` before building

**"Build fails":**
- Check GitHub Actions tab for error logs
- Make sure all dependencies are in `package.json`

---

**Follow these steps to get your site live on GitHub Pages!** 🚀

