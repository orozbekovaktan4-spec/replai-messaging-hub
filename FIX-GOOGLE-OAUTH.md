# 🔧 Fix Google OAuth Error 400: redirect_uri_mismatch

## The Problem

You're getting this error:
```
Error 400: redirect_uri_mismatch
```

This happens because the redirect URI in your app doesn't match what's registered in Google Cloud Console.

---

## ✅ Solution: Add Localhost Redirect URI

### Step 1: Go to Google Cloud Console

1. Open: https://console.cloud.google.com
2. Login with: **orozbekovaktan4@gmail.com**
3. Select your project (or create one if needed)

### Step 2: Navigate to OAuth Consent Screen

1. Click on the **☰** menu (top left)
2. Go to: **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID (the one starting with `905391892206-`)
4. Click the **pencil icon** ✏️ to edit

### Step 3: Add Authorized Redirect URIs

Scroll down to **"Authorized redirect URIs"** section and add:

```
http://localhost:3001/api/auth/google/callback
```

**Also add these for flexibility:**
```
http://localhost:3000/api/auth/google/callback
http://127.0.0.1:3001/api/auth/google/callback
http://127.0.0.1:3000/api/auth/google/callback
```

### Step 4: Save Changes

1. Click **"SAVE"** button at the bottom
2. Wait 5-10 seconds for changes to propagate

---

## 🔄 Restart Your Server

After updating Google Cloud Console:

```bash
# Stop the server (Ctrl+C in terminal)
# Or kill the process
lsof -ti:3001 | xargs kill -9

# Start again
cd ~/replai
PORT=3001 node server-new.js
```

---

## 🎯 Test Again

1. Go to: http://localhost:3001
2. Click "Sign in with Google"
3. ✅ Should work now!

---

## 🌐 For Production/Ngrok

If you want to use ngrok or deploy to production, add those URIs too:

### Start Ngrok:
```bash
ngrok http 3001
```

### Add Ngrok URI to Google Console:
```
https://your-ngrok-url.ngrok-free.app/api/auth/google/callback
```

### Update .env:
```env
GOOGLE_REDIRECT_URI=https://your-ngrok-url.ngrok-free.app/api/auth/google/callback
```

---

## 📝 Current Configuration

Your current Google OAuth settings:

```env
GOOGLE_CLIENT_ID=905391892206-84eas1ccsundodevspaaufqj07l9bnlf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

✅ I've already updated the `.env` file for localhost!

---

## 🚨 Security Note

**Never share your CLIENT_SECRET publicly!** I'm showing it here because we're working on your local machine, but:

1. Add `.env` to `.gitignore` (already done)
2. Don't commit secrets to GitHub
3. Use environment variables in production
4. Rotate secrets if exposed

---

## 🔍 Verify Current Redirect URIs

To see what's currently registered in Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Check "Authorized redirect URIs" section
4. Make sure `http://localhost:3001/api/auth/google/callback` is there

---

## 🎯 Alternative: Use Email/Password Login

While fixing Google OAuth, you can still login with:

```
Email: admin@replai.com
Password: admin123
```

This works immediately without OAuth configuration!

---

## ✅ Checklist

- [x] Updated `.env` with localhost redirect URI
- [ ] Add redirect URI to Google Cloud Console
- [ ] Save changes in Google Console
- [ ] Restart server
- [ ] Test Google login again

---

## 📞 Still Having Issues?

If it still doesn't work:

1. **Clear browser cache** and cookies
2. **Try incognito/private mode**
3. **Wait 1-2 minutes** after saving in Google Console
4. **Check Google Console** for any warning messages
5. **Try a different browser**

---

## 🎨 Screenshots of Google Cloud Console

**Where to find OAuth settings:**

```
Google Cloud Console
└── APIs & Services
    └── Credentials
        └── OAuth 2.0 Client IDs
            └── [Your Client ID]
                └── Authorized redirect URIs
                    └── + ADD URI
```

**What to add:**
```
http://localhost:3001/api/auth/google/callback
```

---

## 🚀 Quick Fix Summary

1. ✅ `.env` already updated by me
2. ⏳ You need to: Add URI to Google Cloud Console
3. ✅ Restart server (if needed)
4. ✅ Try login again

**ETA: 2 minutes to fix!**
