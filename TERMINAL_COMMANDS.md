# 🖥️ Terminal Commands - Run These in Order

## All Steps Are Done in Terminal!

**Step 4 deploys TO Firebase**, but you run the command in terminal.

---

## 📋 Step-by-Step Commands

### Step 1: Install Firebase CLI (Terminal)

```bash
npm install -g firebase-tools
```

**Then login**:
```bash
firebase login
```
*(This opens browser - log in with your Google account)*

---

### Step 2: Install Dependencies (Terminal)

```bash
cd functions
npm install
```

**Wait for installation** (2-3 minutes)

---

### Step 3: Build Functions (Terminal)

```bash
npm run build
```

**This compiles TypeScript** to JavaScript

---

### Step 4: Deploy to Firebase (Terminal)

```bash
cd ..
firebase deploy --only functions
```

**This deploys TO Firebase** (but you run it in terminal)

**⏱️ Takes 3-5 minutes** - wait for it to finish!

**📋 Copy the URL** from the output:
```
✔  functions[api(us-central1)]: Successful create operation.
Function URL (api): https://us-central1-hezak-f6fb3.cloudfunctions.net/api
```

---

## 🎯 Complete Command Sequence

Copy and paste these commands **one by one** in your terminal:

```bash
# Step 1: Install Firebase CLI
npm install -g firebase-tools

# Step 1b: Login (opens browser)
firebase login

# Step 2: Install dependencies
cd functions
npm install

# Step 3: Build
npm run build

# Step 4: Deploy (go back to root first)
cd ..
firebase deploy --only functions
```

---

## ✅ After Deployment

1. **Copy the Function URL** from terminal output
2. **Go to Vercel Dashboard** (in browser)
3. **Settings → Environment Variables**
4. **Add**: `VITE_API_URL=https://us-central1-hezak-f6fb3.cloudfunctions.net/api`
5. **Redeploy** frontend

---

## 🔍 Where to Run

- **All commands**: In your terminal (Terminal app, VS Code terminal, etc.)
- **Step 4 result**: Deploys TO Firebase (but command runs in terminal)
- **Vercel config**: In browser (Vercel Dashboard)

---

**Everything runs in terminal!** 🖥️

