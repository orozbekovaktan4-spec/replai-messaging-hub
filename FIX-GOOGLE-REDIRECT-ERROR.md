# 🔧 Fix Google OAuth "redirect_uri_mismatch" Error

## ❌ The Error You're Seeing

```
Error 400: redirect_uri_mismatch
```

This means Google doesn't recognize the callback URL your app is using.

---

## ✅ Quick Fix (5 minutes)

### Step 1: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/apis/credentials
2. **Sign in** with: `orozbekovaktan4@gmail.com`
3. Make sure you're in the correct project (check top left)

### Step 2: Find Your OAuth Client

1. You should see a list of credentials
2. Look for **"OAuth 2.0 Client IDs"** section
3. Click on your OAuth client name (probably "Web client" or similar)

### Step 3: Add the Correct Redirect URI

In the **"Authorized redirect URIs"** section:

1. Click **"+ ADD URI"**
2. Enter EXACTLY this (copy-paste it):
   ```
   http://localhost:3000/api/auth/google/callback
   ```
3. Make sure there's NO trailing slash (no `/` at the end)
4. Click **"SAVE"** at the bottom

### Step 4: Wait & Test

1. Wait 30 seconds for Google to update
2. Go back to: http://localhost:3000
3. Click **"Continue with Google"** again
4. ✅ It should work now!

---

## 📸 Visual Guide

Your redirect URI should look like this in Google Console:

```
┌─────────────────────────────────────────────────┐
│ Authorized redirect URIs                        │
│                                                  │
│ [http://localhost:3000/api/auth/google/callback]│
│                                                  │
│ [+ ADD URI]                                      │
│                                                  │
│                              [CANCEL]  [SAVE]    │
└─────────────────────────────────────────────────┘
```

---

## ⚠️ Common Mistakes

❌ **WRONG:** `http://localhost:3000/api/auth/google/callback/`  
✅ **RIGHT:** `http://localhost:3000/api/auth/google/callback`

❌ **WRONG:** `http://localhost:3001/api/auth/google/callback` (wrong port)  
✅ **RIGHT:** `http://localhost:3000/api/auth/google/callback`

❌ **WRONG:** `https://localhost:3000/api/auth/google/callback` (https instead of http)  
✅ **RIGHT:** `http://localhost:3000/api/auth/google/callback`

---

## 🔍 Still Not Working?

### Check 1: Verify Your Redirect URI

Run this in terminal:
```bash
cd /Users/ak/replai
grep GOOGLE_CLIENT_ID .env
```

If it's empty or not set, you need to add your Google credentials first!

### Check 2: Check Your Port

Your server MUST be running on port 3000. Verify:
```bash
curl http://localhost:3000/api/health
```

Should return: `OK`

### Check 3: Multiple OAuth Clients?

If you have multiple OAuth clients in Google Console:
- Make sure you're editing the RIGHT one
- Check which Client ID is in your `.env` file
- Update the matching client in Google Console

---

## 🎯 The Exact Steps (Video Style)

1. **Open:** https://console.cloud.google.com/apis/credentials
2. **Find:** "OAuth 2.0 Client IDs" section
3. **Click:** Your client name
4. **Scroll:** To "Authorized redirect URIs"
5. **Click:** "+ ADD URI"
6. **Paste:** `http://localhost:3000/api/auth/google/callback`
7. **Click:** "SAVE"
8. **Wait:** 30 seconds
9. **Test:** Go to http://localhost:3000 and try again

---

## 💡 Pro Tip

For production deployment, you'll need to add BOTH:
- `http://localhost:3000/api/auth/google/callback` (development)
- `https://yourdomain.com/api/auth/google/callback` (production)

You can have multiple redirect URIs in the same OAuth client!

---

## ✅ Success Checklist

- [ ] Opened Google Cloud Console
- [ ] Found my OAuth 2.0 Client
- [ ] Added redirect URI: `http://localhost:3000/api/auth/google/callback`
- [ ] Clicked SAVE
- [ ] Waited 30 seconds
- [ ] Tested again - IT WORKS! 🎉

---

Need more help? The error message says "contact the developer" - that's you! You've got this! 💪
