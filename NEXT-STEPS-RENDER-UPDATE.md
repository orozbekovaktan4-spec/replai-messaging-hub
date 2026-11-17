# 🎯 Next Steps: Update Render Environment

## ✅ Local Configuration Updated

Your local `.env` now has the correct Instagram Business credentials:
```
INSTAGRAM_APP_ID=2031381430802139 ✅
INSTAGRAM_APP_SECRET=1b029dfe87250f9554d654108e3d5cd6 ✅
```

Local server is working with these credentials!

## 📋 Now Update Render

### Step 1: Go to Render Dashboard
1. Visit: https://dashboard.render.com/
2. Select workspace: "erlan's workspace"
3. Find and click on your REPLAI service

### Step 2: Update Environment Variables
1. Click **"Environment"** in the left sidebar
2. Find these variables and update them:

**Change these:**
```
INSTAGRAM_APP_ID=2031381430802139
INSTAGRAM_APP_SECRET=1b029dfe87250f9554d654108e3d5cd6
```

(Change from `951759947647280` back to `2031381430802139`)

### Step 3: Save and Deploy
1. Scroll to bottom and click **"Save Changes"**
2. Render will automatically redeploy (takes 1-2 minutes)
3. Wait for "Deploy succeeded" message

### Step 4: Verify Deployment
Check that production is using the new credentials:
```bash
curl https://replai-xc95.onrender.com/api/admin/instagram/oauth/start | jq .authUrl
```

Should show: `"client_id":"2031381430802139"`

## 🧪 Test Instagram OAuth

After Render deployment completes:

1. **Open:** https://replai-xc95.onrender.com/admin-super.html
2. **Scroll to Instagram section**
3. **Click "Connect Instagram"**

## 🎯 Expected Result

With main app ID + Instagram Business:
- ✅ No "Invalid platform app" error
- ✅ No Error 101
- ✅ Shows Instagram authorization page
- ✅ Can authorize and connect

## ⚠️ If Still Getting Errors

If you see errors after updating Render, the issue is likely:

### Error: "Invalid platform app"
**Cause:** Instagram Graph API not configured in Meta app

**Fix:**
1. Go to https://developers.facebook.com/apps/2031381430802139/
2. Verify "Instagram" product is added
3. Make sure it's "Instagram Graph API" (not "Basic Display")

### Error: "App not set up"
**Cause:** Missing platform or redirect URI

**Fix:**
1. Settings → Basic → Add Platform → Website
2. Add: https://replai-xc95.onrender.com
3. Instagram settings → Add redirect URI:
   `https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback`

### Error 101: "Error validating application"
**Cause:** App secret is wrong

**Fix:**
1. Check that you're using the MAIN app secret (1b029dfe...)
2. Verify it matches in both .env and Render
3. If unsure, reset it in Meta console and update everywhere

### Error: "Instagram account not connected"
**Cause:** Your Instagram is not Business/Creator, or not linked to Facebook Page

**Fix:**
1. Convert Instagram to Business account
2. Link it to a Facebook Page you admin
3. These are requirements for Instagram Graph API

## 📊 Summary

**What we fixed:**
1. ✅ Identified mismatched credentials (Basic Display ID + main secret)
2. ✅ Updated local `.env` to use main app ID for Instagram Business
3. ⏳ Need to update Render to match

**After Render update:**
- Both local and production will use correct credentials
- Instagram Business OAuth should work
- Can test full message flow

## 🚀 Ready to Update?

Go ahead and update Render environment variables, then test!
