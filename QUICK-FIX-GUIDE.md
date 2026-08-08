# ⚡ Quick Fix: Google OAuth Error

## 🚨 The Error You Saw

```
Error 400: redirect_uri_mismatch
Access blocked: This app's request is invalid
```

---

## ✅ What I Already Fixed

✅ Updated your `.env` file:
```env
OLD: GOOGLE_REDIRECT_URI=https://cheer-pledge-lend.ngrok-free.dev/api/auth/google/callback
NEW: GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

✅ Restarted your server on port 3001

---

## 🎯 What YOU Need to Do (2 minutes)

### Step 1: Open Google Cloud Console

👉 **Click here:** https://console.cloud.google.com/apis/credentials

Login with: **orozbekovaktan4@gmail.com**

### Step 2: Find Your OAuth Client

Look for: `905391892206-84eas1ccsundodevspaaufqj07l9bnlf`

Click the **✏️ pencil icon** to edit it.

### Step 3: Add Redirect URI

Scroll to **"Authorized redirect URIs"**

Click **"+ ADD URI"**

Paste this EXACT URL:
```
http://localhost:3001/api/auth/google/callback
```

### Step 4: Save

Click **"SAVE"** at the bottom.

Wait 10 seconds for changes to take effect.

### Step 5: Test Again

1. Go to: http://localhost:3001
2. Click "Sign in with Google"
3. ✅ Should work now!

---

## 🔄 Alternative: Use Email Login (Works Now!)

While fixing Google OAuth, you can login immediately with:

```
📧 Email: admin@replai.com
🔑 Password: admin123
```

👉 Go to: http://localhost:3001

---

## 📸 Visual Guide

```
┌─────────────────────────────────────────────────┐
│  Google Cloud Console                           │
│  console.cloud.google.com/apis/credentials      │
├─────────────────────────────────────────────────┤
│                                                 │
│  OAuth 2.0 Client IDs                           │
│  ├─ Your Client ID: 905391892206-...           │
│     └─ ✏️ Edit                                  │
│        └─ Authorized redirect URIs:             │
│           ├─ + ADD URI                          │
│           └─ Paste:                             │
│              http://localhost:3001/api/auth/    │
│              google/callback                    │
│                                                 │
│  [SAVE] ← Click here                            │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Summary

| Status | Item |
|--------|------|
| ✅ | Server running on port 3001 |
| ✅ | .env file updated |
| ✅ | Instagram connected (@akt4n.o) |
| ⏳ | Google OAuth - needs console update |
| ✅ | Email/password login ready |

---

## 🚀 Access Your Admin Panel

**Right now:** http://localhost:3001

**Login options:**
1. ✅ **Email/Password** (works immediately)
   - Email: admin@replai.com
   - Password: admin123

2. ⏳ **Google Sign-In** (after fixing console)
   - Add redirect URI to Google Cloud Console
   - Then try again

---

## 💡 Pro Tip

Add multiple redirect URIs for flexibility:

```
http://localhost:3001/api/auth/google/callback
http://localhost:3000/api/auth/google/callback
http://127.0.0.1:3001/api/auth/google/callback
```

This way it works on any port!

---

## 📞 Need More Help?

Read the detailed guide: `FIX-GOOGLE-OAUTH.md`

---

**TL;DR:**
1. ✅ I fixed the .env file
2. ⏳ You add URI to Google Console
3. ✅ Or just use email/password login now

**Time to fix: 2 minutes**
