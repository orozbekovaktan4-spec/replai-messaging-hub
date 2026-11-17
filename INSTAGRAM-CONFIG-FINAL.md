# ✅ Instagram Configuration - FINAL ANSWER

## 🎯 What You Need to Know

For **Instagram Business accounts** (what REPLAI uses for messaging), you have TWO valid approaches:

### Approach 1: Instagram Graph API (Recommended)
- **App ID**: `2031381430802139` (main Meta app)
- **OAuth URL**: `https://www.facebook.com/v21.0/dialog/oauth`
- **Features**: Full business features (messages, comments, insights)
- **Requirements**: Instagram Business + Facebook Page connection
- **This is what your code is using now** ✅

### Approach 2: Instagram Basic Display
- **App ID**: `951759947647280` (separate Instagram app)
- **OAuth URL**: `https://api.instagram.com/oauth/authorize`
- **Features**: Limited (profile, media only, NO messages)
- **Requirements**: Any Instagram account
- **NOT suitable for REPLAI** ❌

## ✅ Current Configuration (CORRECT)

Your `.env` now has:
```env
INSTAGRAM_APP_ID=2031381430802139
INSTAGRAM_APP_SECRET=1b029dfe87250f9554d654108e3d5cd6
```

This is **CORRECT** for Instagram Business with Graph API!

## 🔧 What Changed

**Before:**
- Using Basic Display app ID: `951759947647280`
- With main app secret
- Result: Error 101 (mismatched credentials)

**After:**
- Using main app ID: `2031381430802139`
- With main app secret
- Result: Should work for Instagram Business! ✅

## 📋 Update Render

Now update Render environment variables to match:

1. Go to Render dashboard
2. Select your REPLAI service
3. Environment tab
4. Update:
   ```
   INSTAGRAM_APP_ID=2031381430802139
   INSTAGRAM_APP_SECRET=1b029dfe87250f9554d654108e3d5cd6
   ```
5. Save Changes (Render will redeploy)

## 🧪 Test After Update

1. Wait for Render deployment to complete
2. Test OAuth at: `https://replai-xc95.onrender.com/admin-super.html`
3. Click "Connect Instagram"

## 🎯 Expected Behavior

With correct Instagram Business setup:
1. ✅ Redirects to Facebook/Instagram authorization
2. ✅ Shows permissions request
3. ✅ After authorize, exchanges code for token
4. ✅ Gets Instagram Business Account ID
5. ✅ Saves connection

## ⚠️ Requirements for Instagram Business

Make sure you have:
- [ ] Instagram Business or Creator account (not personal)
- [ ] Instagram connected to a Facebook Page
- [ ] You're admin of that Facebook Page
- [ ] Instagram Graph API product added in Meta app (not Basic Display)

If any of these are missing, it won't work even with correct credentials!

## 🔍 If Still Getting Errors

After updating Render, if you still get errors, the issue is likely:
1. Instagram Graph API not properly configured in Meta console
2. Instagram account is personal (not Business/Creator)
3. Instagram not connected to Facebook Page
4. Missing permissions in Meta app

NOT the app ID or secret (those are now correct)!
