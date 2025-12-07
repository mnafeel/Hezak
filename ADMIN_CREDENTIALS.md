# 🔑 Admin Login Credentials

## 📋 Default Admin Credentials

**Email**: `admin@hezak.com`  
**Password**: `admin123`

---

## 🔐 Where to Use

### Admin Panel Login:
- **URL**: `https://your-frontend-url.com/admin` (or your admin path)
- **Email**: `admin@hezak.com`
- **Password**: `admin123`

---

## 🔧 Change Admin Password

### Option 1: Generate New Password Hash

**Run in terminal**:
```bash
cd backend
node scripts/generate-env.js your-new-password
```

This will generate a new `ADMIN_PASSWORD_HASH`.

### Option 2: Update in Render

1. **Render Dashboard** → Your backend service
2. **Environment** → **Environment Variables**
3. **Find**: `ADMIN_PASSWORD_HASH`
4. **Update** with new hash from script
5. **Redeploy** backend

---

## ⚠️ Security Notes

- **Change password** in production!
- **Don't share** these credentials publicly
- **Use strong password** for production

---

## 📝 Current Configuration

**Backend Environment Variables** (Render):
- `ADMIN_EMAIL=admin@hezak.com`
- `ADMIN_PASSWORD_HASH=$2b$10$6.qPgfLkKkBYtFNMD/rCNuOBl6Xrqi2NctYZspTtjRpL8MYpwU6y2`
- `JWT_SECRET=a159c9fbdf6cde8450a1da73ef9c96f34010d50aa08575ee42b5630141bb5d34`

---

**Use these credentials to login to your admin panel!** 🔐

