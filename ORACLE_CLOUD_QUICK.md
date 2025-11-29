# ⚡ Oracle Cloud Quick Setup

## 🎯 Why Oracle Cloud is BEST for Free Hosting

- ✅ **FOREVER FREE** - Not a trial, actual free tier
- ✅ **2 VMs** - More than enough for your backend
- ✅ **10TB Storage** - Massive free storage
- ✅ **10GB Database** - Free PostgreSQL/MySQL
- ✅ **No Credit Card** - Sign up without payment
- ✅ **Enterprise Grade** - Used by big companies

---

## 🚀 Quick Setup (15 minutes)

### 1. Sign Up (2 min)
- Go to: **https://cloud.oracle.com**
- Click "Start for Free"
- **No credit card needed!**

### 2. Create VM (3 min)
- **Compute** → **Instances** → **Create**
- **Name**: `hezak-backend`
- **Image**: Ubuntu 22.04
- **Shape**: Always Free (VM.Standard.E2.1.Micro)
- **Create** ✅

### 3. Open Port 4000 (2 min)
- **Networking** → **Security Lists**
- **Add Ingress Rule**:
  - Port: `4000`
  - Source: `0.0.0.0/0`

### 4. SSH & Install (5 min)
```bash
# Connect
ssh opc@your-instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git
```

### 5. Deploy Backend (3 min)
```bash
# Clone
git clone https://github.com/mnafeel/Hezak.git
cd Hezak/backend

# Install & Build
npm install
npm run build

# Install PM2
sudo npm install -g pm2

# Start
pm2 start dist/server.js --name backend
pm2 save
pm2 startup
```

### 6. Connect Frontend
- Get your **Public IP** from OCI console
- In Vercel/Netlify, add:
  - `VITE_API_URL=http://your-ip:4000/api`

---

## ✅ Done!

Your backend is live on Oracle Cloud! 🎉

**Total cost: $0/month FOREVER!**

---

## 🔄 Auto-Deploy (Optional)

Setup GitHub Actions to auto-deploy on push.

See `ORACLE_CLOUD_GUIDE.md` for full instructions.

---

**Oracle Cloud = Best free hosting forever!** ☁️

