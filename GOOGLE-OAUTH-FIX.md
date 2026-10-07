# 🔧 Google Sign-In Fix Guide

## ❌ Common Error:
**"Error 400: redirect_uri_mismatch"**

This happens when the redirect URI in your code doesn't match what's configured in Google Cloud Console.

## ✅ Quick Fix (5 minutes):

### Step 1: Check Your Current Settings

Your `.env` file has:
```
GOOGLE_CLIENT_ID=905391892206-84eas1ccsundodevspaaufqj07l9bnlf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### Step 2: Add Redirect URIs to Google Cloud Console

1. **Go to:** https://console.cloud.google.com/apis/credentials
2. **Find your OAuth 2.0 Client ID:** `905391892206-84eas1ccsundodevspaaufqj07l9bnlf`
3. **Click EDIT** (pencil icon)
4. **Add these Authorized redirect URIs:**

```
http://localhost:3000/api/auth/google/callback
https://cheer-pledge-lend.ngrok-free.dev/api/auth/google/callback
```

5. **Click SAVE**

### Step 3: Test It

1. Go to: http://localhost:3000
2. Click "Sign in with Google"
3. Should work! ✅

---

## 🎯 If Still Not Working:

### Check #1: Correct Redirect URI Format

Make sure you added the EXACT URLs above (no trailing slashes, no extra paths)

### Check #2: Wait 5 Minutes

Google can take up to 5 minutes to propagate changes

### Check #3: Use Incognito Mode

Old sessions might be cached

### Check #4: Check Server Logs

```bash
# In your replai folder:
tail -f server-new.log

# Look for:
[Google OAuth] Initiating auth with redirect_uri: ...
[Google OAuth] Using redirect_uri for token exchange: ...
```

---

## 🔐 Security Note:

Your current credentials are:
- ✅ Development: `http://localhost:3000`
- ⚠️  Production: Need to add your real domain later

When you deploy to production:
1. Add production domain to redirect URIs
2. Update `.env` with production URL
3. Keep `localhost` for local testing

---

## 📱 For Ngrok Testing:

Since ngrok URL changes, you have 2 options:

**Option A: Static Ngrok Domain (Free)**
```bash
ngrok http 3000 --domain=cheer-pledge-lend.ngrok-free.dev
```
Then add: `https://cheer-pledge-lend.ngrok-free.dev/api/auth/google/callback`

**Option B: Update URI Each Time**
Every time ngrok URL changes, update Google Console

---

## 🆘 Still Having Issues?

Tell me the EXACT error message you see and I'll fix it!

Common errors:
- `redirect_uri_mismatch` → Add correct URI to Google Console
- `access_denied` → User clicked "Cancel"
- `invalid_client` → Wrong Client ID/Secret
- `unauthorized_client` → OAuth consent screen not configured
