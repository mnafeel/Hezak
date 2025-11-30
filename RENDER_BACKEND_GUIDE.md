# 🚀 Deploy Backend to Render - Step-by-Step

## ✅ Why Render?

- ✅ **Easier** than Vercel for Express.js
- ✅ **Always-on** (no cold starts)
- ✅ **Free tier** available
- ✅ **Simple** setup
- ✅ **Better** for traditional servers

---

## 📋 Step 1: Sign Up for Render

1. **Go to**: https://render.com
2. **Sign up** with GitHub (recommended)
3. **Verify** your email

---

## 🚀 Step 2: Create New Web Service

1. **Click**: **"New +"** (top right)
2. **Select**: **"Web Service"**
3. **Connect** your GitHub account (if not already connected)
4. **Select** repository: `Hezak`

---

## ⚙️ Step 3: Configure Service

### Basic Settings:

- **Name**: `hezak-backend` (or any name you like)
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run prisma:generate && npm run build`
- **Start Command**: `node dist/server.js`

### Environment:

- **Instance Type**: **Free** (or upgrade if needed)

---

## 🔑 Step 4: Add Environment Variables

**Click**: **"Advanced"** → **"Add Environment Variable"**

**Add these 6 variables:**

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | `file:./dev.db` |
| `ADMIN_EMAIL` | `admin@hezak.com` |
| `ADMIN_PASSWORD_HASH` | `$2b$10$6.qPgfLkKkBYtFNMD/rCNuOBl6Xrqi2NctYZspTtjRpL8MYpwU6y2` |
| `JWT_SECRET` | `a159c9fbdf6cde8450a1da73ef9c96f34010d50aa08575ee42b5630141bb5d34` |

**Click**: **"Save Changes"**

---

## 🗄️ Step 5: (Optional) Add PostgreSQL Database

**For production, use PostgreSQL instead of SQLite:**

1. **Click**: **"New +"** → **"PostgreSQL"**
2. **Name**: `hezak-db`
3. **Plan**: **Free** (or upgrade)
4. **Create** database
5. **Copy** **Internal Database URL**
6. **Go back** to your web service
7. **Add** environment variable:
   - **Name**: `DATABASE_URL`
   - **Value**: *(paste the PostgreSQL URL)*

**Then update Prisma schema** (if using PostgreSQL):
- Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`
- Run migrations: `npx prisma migrate deploy`

---

## 🚀 Step 6: Deploy

1. **Click**: **"Create Web Service"**
2. **Wait** 5-10 minutes for first deployment
3. **Watch** build logs in real-time

---

## ✅ Step 7: Get Your Backend URL

Once deployment completes:

1. **Copy** the service URL (e.g., `https://hezak-backend.onrender.com`)
2. **Test** in browser:
   ```
   https://your-backend-url.onrender.com/health
   ```
3. **Should return**: `{"status":"ok","timestamp":"..."}`

---

## 🔗 Step 8: Connect Frontend

### If Frontend is on Vercel:

1. **Go to**: Vercel → Frontend Project → **Settings** → **Environment Variables**
2. **Add**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com/api`
3. **Redeploy** frontend

### If Frontend is on GitHub Pages:

1. **Update** `frontend/.env` or GitHub Actions secrets:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
2. **Redeploy** frontend

---

## 🔧 Step 9: Configure Auto-Deploy

**Render automatically deploys** when you push to GitHub!

**Settings**:
- **Auto-Deploy**: **Yes** (default)
- **Branch**: `main`

---

## 📊 Step 10: Monitor Deployment

1. **Go to**: Your service dashboard
2. **View**:
   - **Logs** (real-time)
   - **Metrics** (CPU, memory)
   - **Events** (deployments)

---

## 🔍 Troubleshooting

### Problem: Build Fails

**Check**:
- Build logs for errors
- Environment variables are set
- Root directory is `backend`

### Problem: Service Won't Start

**Check**:
- Start command: `node dist/server.js`
- Port is set to `4000` (Render uses `PORT` env var)
- All environment variables are set

### Problem: Database Connection Error

**Solution**:
- Use PostgreSQL instead of SQLite
- Or ensure `dev.db` file is in repository (not recommended)

### Problem: Service Goes to Sleep (Free Tier)

**Solution**:
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Upgrade to paid plan for always-on

---

## 💡 Pro Tips

1. **Use PostgreSQL** for production (SQLite doesn't work well on Render)
2. **Monitor logs** regularly
3. **Set up alerts** for deployment failures
4. **Use custom domain** (optional)
5. **Enable SSL** (automatic on Render)

---

## 📝 Quick Checklist

- [ ] Render account created
- [ ] Web service created
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install && npm run prisma:generate && npm run build`
- [ ] Start command: `node dist/server.js`
- [ ] All 6 environment variables added
- [ ] Service deployed successfully
- [ ] `/health` endpoint works
- [ ] Frontend connected to backend URL

---

## 🎯 Summary

**Render URL**: `https://your-backend-url.onrender.com`  
**Frontend API URL**: `https://your-backend-url.onrender.com/api`

**That's it! Your backend is now on Render!** 🚀

---

**Render is much easier than Vercel for Express.js backends!** ✅

