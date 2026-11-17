# ✅ Instagram OAuth - Ready to Test

## 🎉 Configuration Complete

All fixes have been applied successfully:

### ✅ What Was Fixed

1. **Correct Instagram App ID**
   - ❌ OLD: `2031381430802139` (Main Meta app - caused "Invalid platform app")
   - ✅ NEW: `951759947647280` (Instagram-specific app ID)

2. **Security: Secrets Rotated**
   - ✅ Exposed secrets have been rotated in Meta console
   - ✅ New Instagram app secret retrieved
   - ✅ New Facebook app secret generated
   - ✅ `.env` is git-ignored (secrets safe)

3. **Deployment Updated**
   - ✅ Local `.env` updated with new credentials
   - ✅ Render environment variables updated
   - ✅ New deployment is live on Render

### ✅ Verification Completed

**Local Server:**
```
✅ OAuth URL: https://api.instagram.com/oauth/authorize?client_id=951759947647280&...
✅ Correct Instagram App ID in URL
```

**Production (Render):**
```
✅ OAuth URL: https://api.instagram.com/oauth/authorize?client_id=951759947647280&...
✅ Correct Instagram App ID in URL
```

---

## 🧪 Test Instagram OAuth Now

### Option 1: Test on Production (Recommended)

1. **Open in your browser:**
   ```
   https://replai-xc95.onrender.com/connect-instagram-direct.html
   ```

2. **Click "Connect Instagram Business"**

3. **What should happen:**
   - ✅ Redirects to Instagram authorization page (no error!)
   - ✅ Shows your Instagram app name
   - ✅ Lists requested permissions
   - ✅ "Authorize" button appears

4. **After clicking Authorize:**
   - ✅ Redirects back to your app
   - ✅ Connection is saved
   - ✅ Instagram username appears in admin panel

### Option 2: Test Locally (Limited)

**⚠️ Note:** Meta doesn't allow localhost callbacks for production apps, so local testing redirects to production URL.

1. **Open:**
   ```
   http://localhost:3000/connect-instagram-direct.html
   ```

2. **Click connect** - will redirect to production callback

---

## 🔍 Expected vs Before

### ❌ BEFORE (with wrong app ID)
```
Error: "Invalid Request: Request parameters are invalid: Invalid platform app"
```

### ✅ NOW (with correct app ID)
Instagram authorization page should load without errors!

---

## 📊 Test Checklist

When you test, verify these work:

- [ ] No "Invalid platform app" error
- [ ] Instagram authorization page loads
- [ ] Can see app permissions list
- [ ] Can click "Authorize"
- [ ] Redirects back successfully
- [ ] Connection appears in admin panel
- [ ] Can see Instagram username/profile

---

## 🐛 If You Still Get Errors

### Error: "Invalid platform app"
**Cause:** Render deployment might not have picked up new credentials yet

**Fix:** 
1. Check Render deployment logs
2. Verify environment variables saved correctly
3. Manually trigger redeploy if needed

### Error: "Redirect URI mismatch"
**Cause:** Callback URL not in Meta app settings

**Fix:**
1. Go to Meta Developer Console
2. Instagram settings → Valid OAuth Redirect URIs
3. Verify this is listed: `https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback`

### Error: "App not set up"
**Cause:** Instagram product configuration incomplete

**Fix:**
1. Check Instagram Graph API is added (not Basic Display)
2. Verify app is in Development or Live mode
3. Add yourself as tester if in Development mode

### Can connect but messages don't work
**Different issue:** This means OAuth worked! Message handling is separate:
- Check webhook configuration
- Verify Instagram Business Account ID
- Check webhook subscriptions

---

## 🎯 What to Test After Successful Connection

Once OAuth works:

1. **Send a test message** to your Instagram Business account
2. **Check if bot responds** 
3. **Verify webhook receives** messages (check server logs)
4. **Test AI responses** work correctly

---

## 📖 Additional Resources

- **Main guide:** `INSTAGRAM-APP-ID-FIX.md`
- **Verify credentials:** Run `node verify-instagram-credentials.js`
- **Meta console:** https://developers.facebook.com/apps/2031381430802139
- **Test pages:**
  - Production: https://replai-xc95.onrender.com/connect-instagram-direct.html
  - Local: http://localhost:3000/connect-instagram-direct.html

---

## ✅ Summary

**Before:** Wrong app ID (2031381430802139) → "Invalid platform app" error

**After:** Correct Instagram app ID (951759947647280) → Should work! ✅

**Security:** All exposed secrets rotated ✅

**Ready to test!** 🚀

Go ahead and test on production. The "Invalid platform app" error should be gone!
