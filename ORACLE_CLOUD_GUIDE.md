# ☁️ Oracle Cloud Infrastructure (OCI) - Backend Hosting Guide

## 🏆 Why Oracle Cloud is EXCELLENT

**Oracle Cloud Advantages:**
- ✅ **ALWAYS FREE TIER** - Forever free (not just trial!)
- ✅ **Generous resources** - 2 VMs, 10TB storage, 10GB database
- ✅ **No credit card required** for free tier
- ✅ **Enterprise-grade** infrastructure
- ✅ **High performance** - Fast and reliable
- ✅ **Global network** - Data centers worldwide
- ✅ **PostgreSQL/MySQL** - Free database included
- ✅ **Great for production** - Enterprise ready

**Free Tier Includes:**
- 2 AMD-based Compute VMs (1/8 OCPU, 1GB RAM each)
- 10TB object storage
- 10GB Autonomous Database
- 10GB block storage
- Load balancer
- 10TB outbound data transfer/month

**Perfect for:** Production apps, long-term hosting, cost-effective

---

## 🚀 Setup Guide (15-20 minutes)

### Step 1: Sign Up for Oracle Cloud

1. **Go to**: https://cloud.oracle.com
2. **Click** "Start for Free"
3. **Create account** (no credit card needed for free tier!)
4. **Verify email** and complete registration

### Step 2: Create Compute Instance

1. **Navigate to**: Compute → Instances
2. **Click** "Create Instance"
3. **Configure**:
   - **Name**: `hezak-backend`
   - **Image**: Oracle Linux 8 or Ubuntu 22.04
   - **Shape**: Always Free eligible (VM.Standard.E2.1.Micro)
   - **Networking**: Create new VCN (Virtual Cloud Network)
   - **SSH Keys**: Generate new key pair (save private key!)
4. **Click** "Create"

### Step 3: Configure Security (IMPORTANT!)

1. **Go to**: Networking → Virtual Cloud Networks
2. **Select** your VCN → Security Lists
3. **Edit** Ingress Rules:
   - **Source**: 0.0.0.0/0
   - **IP Protocol**: TCP
   - **Destination Port**: 4000 (your backend port)
   - **Description**: Allow backend API
4. **Save**

### Step 4: Connect to Your Instance

**Using SSH:**
```bash
ssh -i your-private-key.key opc@your-instance-ip
```

**Or use Cloud Shell** (browser-based terminal in OCI console)

### Step 5: Install Node.js

**On Oracle Linux/Ubuntu:**
```bash
# Update system
sudo yum update -y  # Oracle Linux
# or
sudo apt update && sudo apt upgrade -y  # Ubuntu

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs  # Oracle Linux
# or
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs  # Ubuntu

# Verify
node --version
npm --version
```

### Step 6: Clone and Setup Your Backend

```bash
# Install Git
sudo yum install -y git  # Oracle Linux
# or
sudo apt install -y git  # Ubuntu

# Clone your repository
git clone https://github.com/mnafeel/Hezak.git
cd Hezak/backend

# Install dependencies
npm install

# Build
npm run build
```

### Step 7: Setup Environment Variables

```bash
# Create .env file
nano .env
```

Add:
```
PORT=4000
JWT_SECRET=your-secret-key-here
DATABASE_URL=file:./dev.db
NODE_ENV=production
```

### Step 8: Setup PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start your app
pm2 start dist/server.js --name hezak-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it gives you
```

### Step 9: Setup Firewall

```bash
# Allow port 4000
sudo firewall-cmd --permanent --add-port=4000/tcp
sudo firewall-cmd --reload

# Or for Ubuntu
sudo ufw allow 4000/tcp
sudo ufw reload
```

### Step 10: Get Your Public IP

1. **Go to**: Compute → Instances
2. **Find** your instance
3. **Copy** the Public IP address

Your backend will be at: `http://your-public-ip:4000`

---

## 🗄️ Setup Database (Optional - Recommended)

### Option 1: Use Autonomous Database (Free Tier)

1. **Navigate to**: Autonomous Database → Create
2. **Choose**: Always Free
3. **Configure**:
   - **Name**: `hezak-db`
   - **Database Type**: Transaction Processing
   - **Password**: Set strong password
4. **Create** and wait for provisioning
5. **Get connection string** from database details
6. **Update** `DATABASE_URL` in your `.env`

### Option 2: Install PostgreSQL on VM

```bash
# Install PostgreSQL
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE hezak;
CREATE USER hezak_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE hezak TO hezak_user;
\q

# Update DATABASE_URL
DATABASE_URL="postgresql://hezak_user:your-password@localhost:5432/hezak"
```

---

## 🔒 Setup Domain (Optional)

### Using Oracle Cloud DNS

1. **Navigate to**: Networking → DNS Management
2. **Create Zone** for your domain
3. **Add A Record** pointing to your instance IP
4. **Update nameservers** at your domain registrar

### Using Cloudflare (Free)

1. **Add domain** to Cloudflare
2. **Point A record** to your OCI instance IP
3. **Enable proxy** for DDoS protection

---

## 🔄 Auto-Deploy Setup

### Using GitHub Actions

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to OCI

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to OCI
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.OCI_HOST }}
          username: opc
          key: ${{ secrets.OCI_SSH_KEY }}
          script: |
            cd Hezak
            git pull
            cd backend
            npm install
            npm run build
            pm2 restart hezak-backend
```

Add secrets in GitHub:
- `OCI_HOST`: Your instance public IP
- `OCI_SSH_KEY`: Your private SSH key

---

## 📊 Oracle Cloud vs Others

| Feature | Oracle Cloud | Railway | Render |
|---------|--------------|---------|--------|
| **Free Tier** | ✅ Forever Free | ✅ $5 credit/month | ✅ Limited |
| **Resources** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Setup Time** | 15-20 min | 2 min | 3 min |
| **Ease of Use** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Production Ready** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Database** | ✅ Free 10GB | ✅ Free | ✅ Free |
| **Storage** | ✅ 10TB Free | ❌ Limited | ❌ Limited |

---

## ✅ Advantages of Oracle Cloud

1. **Truly Free Forever** - Not a trial, actual free tier
2. **More Resources** - 2 VMs, 10TB storage
3. **Enterprise Grade** - Used by Fortune 500 companies
4. **Global Network** - Fast worldwide
5. **No Credit Card** - Sign up without payment
6. **Cost Effective** - Free tier covers most small apps

---

## ⚠️ Considerations

1. **Setup Time** - Takes 15-20 minutes (vs 2 min for Railway)
2. **More Technical** - Requires SSH, Linux knowledge
3. **Manual Updates** - Need to SSH in for updates (or use CI/CD)
4. **Security** - Need to configure firewall yourself

---

## 🎯 When to Use Oracle Cloud

**Use Oracle Cloud if:**
- ✅ You want **truly free** hosting (forever)
- ✅ You need **more resources** (2 VMs, 10TB storage)
- ✅ You're comfortable with **Linux/SSH**
- ✅ You want **enterprise-grade** infrastructure
- ✅ You're building for **long-term** production

**Use Railway if:**
- ✅ You want **fastest setup** (2 minutes)
- ✅ You prefer **simpler** deployment
- ✅ You want **auto-deploy** from GitHub
- ✅ You're okay with **$5/month** after free credit

---

## 🚀 Quick Start Summary

1. **Sign up**: https://cloud.oracle.com (free, no credit card)
2. **Create VM**: Compute → Instances → Create
3. **Configure firewall**: Allow port 4000
4. **SSH in**: Connect to your instance
5. **Install Node.js**: Setup Node.js 20
6. **Deploy**: Clone repo, install, build, start with PM2
7. **Connect frontend**: Use your public IP in `VITE_API_URL`

---

## 💡 Pro Tips

1. **Use PM2** for process management (auto-restart on crash)
2. **Setup Nginx** as reverse proxy (optional, for port 80/443)
3. **Enable monitoring** in OCI console
4. **Setup backups** for database
5. **Use Cloudflare** for free SSL and DDoS protection

---

## 📚 Resources

- **Oracle Cloud Docs**: https://docs.oracle.com/en-us/iaas/
- **Free Tier Guide**: https://www.oracle.com/cloud/free/
- **OCI Tutorials**: https://docs.oracle.com/en-us/iaas/Content/GSG/Concepts/baremetalintro.htm

---

**Oracle Cloud is EXCELLENT for free, long-term hosting!** ☁️

**Best for production apps that need reliable, free hosting forever!**

