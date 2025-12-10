# 🔑 Firebase Service Account JSON Setup

## 📋 Step-by-Step: Get and Add Service Account JSON

---

## ✅ Step 1: Get Service Account JSON from Firebase

### 1.1 Go to Firebase Console

1. **Open**: https://console.firebase.google.com
2. **Select** your project: `hezak-f6fb3`
3. **Click**: Settings (gear icon) → **Project settings**

### 1.2 Generate Service Account Key

1. **Go to**: **Service accounts** tab
2. **Click**: **"Generate new private key"** button
3. **Click**: **"Generate key"** in the popup
4. **Download** the JSON file (e.g., `hezak-f6fb3-firebase-adminsdk-xxxxx.json`)

---

## ✅ Step 2: Open and Copy JSON Content

### 2.1 Open the Downloaded File

**The file will look like this**:

```json
{
  "type": "service_account",
  "project_id": "hezak-f6fb3",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@hezak-f6fb3.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40hezak-f6fb3.iam.gserviceaccount.com"
}
```

### 2.2 Copy Entire JSON

**Select ALL** the JSON content (from `{` to `}`) and **copy** it.

---

## ✅ Step 3: Format for Render (Single Line)

### Option A: Use Online Tool (Easiest)

1. **Go to**: https://www.freeformatter.com/json-formatter.html
2. **Paste** your JSON
3. **Click**: "Minify" or "Compress"
4. **Copy** the single-line version

### Option B: Manual Format

**Remove all line breaks and spaces**:

**Before** (multi-line):
```json
{
  "type": "service_account",
  "project_id": "hezak-f6fb3"
}
```

**After** (single line):
```json
{"type":"service_account","project_id":"hezak-f6fb3"}
```

---

## ✅ Step 4: Add to Render

### 4.1 Go to Render Dashboard

1. **Open**: https://render.com
2. **Find** your `hezak-backend` service
3. **Click**: **Settings** → **Environment**

### 4.2 Add Environment Variable

1. **Click**: **"Add Environment Variable"**
2. **Name**: `FIREBASE_SERVICE_ACCOUNT`
3. **Value**: *(Paste the single-line JSON)*
4. **Environment**: Select **All** (Production, Preview, Development)
5. **Click**: **"Save Changes"**

---

## 📝 Example Format

**What to paste in Render** (single line, no spaces/breaks):

```
{"type":"service_account","project_id":"hezak-f6fb3","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@hezak-f6fb3.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40hezak-f6fb3.iam.gserviceaccount.com"}
```

**Important**: 
- ✅ **Single line** (no line breaks)
- ✅ **All quotes** preserved
- ✅ **All content** from `{` to `}`

---

## 🔧 Quick Format Tool

**If you have the JSON file**, you can format it using:

### Terminal (Mac/Linux):
```bash
cat your-service-account.json | jq -c
```

### Online:
1. **Go to**: https://jsonformatter.org/minify
2. **Paste** your JSON
3. **Click**: "Minify"
4. **Copy** result

---

## ✅ Verify It Works

**After adding to Render**:

1. **Redeploy** backend
2. **Check** logs for:
   - ✅ "Firebase Admin initialized" (success)
   - ❌ "Firebase Admin not initialized" (error - check JSON format)

---

## ⚠️ Common Mistakes

### ❌ Wrong: Multi-line JSON
```
{
  "type": "service_account"
}
```

### ✅ Correct: Single-line JSON
```
{"type":"service_account","project_id":"hezak-f6fb3",...}
```

### ❌ Wrong: Missing quotes
```
{type:service_account}
```

### ✅ Correct: All quotes preserved
```
{"type":"service_account"}
```

---

## 🎯 Summary

1. **Download** service account JSON from Firebase
2. **Minify** to single line (remove line breaks)
3. **Paste** into Render as `FIREBASE_SERVICE_ACCOUNT`
4. **Save** and **redeploy**

---

**Paste the entire JSON as a single line in Render!** 🔑
