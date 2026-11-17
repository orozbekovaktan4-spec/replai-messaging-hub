# 🚀 Deploy Instagram OAuth Fix to Render

## ✅ What Was Fixed

Changed Instagram Business OAuth to use the correct endpoint:

**BEFORE (Wrong):**
- URL: `https://api.instagram.com/oauth/authorize`
- Scopes: `instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages`
- Result: ❌ "Invalid platform app" error

**AFTER (Correct):**
- URL: `https://www.facebook.com/v21.0/dialog/oauth`
- Scopes: `instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_show_list,pages_read_engagement`
- Result: ✅ Should work!

## 📋 Files Changed

1. **connection-manager.js** - Updated `getAuthUrl()` method to use Facebook OAuth
2. **.env** - Already using main app ID `2031381430802139`

## 🚀 Deploy to Render

### Option 1: Git Push (Recommended)

```bash
cd /Users/ak/replai
git add connection-manager.js
git commit -m "Fix Instagram OAuth: use Facebook endpoint for Business accounts"
git push origin main
```

Render will automatically detect and deploy the change.

### Option 2: Manual Deploy

1. Go to https://dashboard.render.com/
2. Select your REPLAI service
3. Click "Manual Deploy" → "Deploy latest commit"

## ⏱️ Wait for Deployment

- Deployment takes 1-2 minutes
- Watch the logs in Render dashboard
- Wait for "Deploy succeeded" message

## 🧪 Test After Deployment

1. **Open:** https://replai-xc95.onrender.com/admin-super.html
2. **Scroll to Instagram section**
3. **Click "Connect Instagram"**

## 🎯 Expected Behavior

Now it should:
1. ✅ Redirect to Facebook (not Instagram directly)
2. ✅ Ask to select a Facebook Page
3. ✅ Show Instagram permissions
4. ✅ No "Invalid platform app" error!
5. ✅ Successfully authorize and connect

## 📊 What This Does Differently

### Instagram Basic Display (old, wrong for Business):
- Direct to `api.instagram.com`
- Personal account only
- Limited permissions
- App ID: separate Instagram app

### Instagram Graph API (new, correct for Business):
- Through Facebook OAuth: `facebook.com/dialog/oauth`
- Business/Creator accounts
- Full business permissions (messages, comments, insights)
- App ID: main Meta app
- **Requires Facebook Page linked to Instagram**

## ⚠️ Requirements

Make sure you have:
- [ ] Instagram Business or Creator account (not personal)
- [ ] Instagram connected to a Facebook Page
- [ ] You are admin of that Facebook Page
- [ ] Main Meta app configured with Instagram product

If you don't have these, even with correct code it won't work!

## 🔍 Check Your Instagram Account Type

### If you have Personal account:
You need to convert to Business:
1. Instagram app → Settings → Account
2. Switch to Professional Account
3. Choose Business or Creator
4. Link to Facebook Page

### If already Business:
Verify it's linked to Facebook:
1. Instagram → Settings → Account → Linked Accounts
2. Should show Facebook Page connection

## 📖 Why This Fix Works

Instagram Business accounts don't use `api.instagram.com/oauth/authorize`. That's only for Instagram Basic Display (personal accounts).

Instagram Business uses Facebook's OAuth system because:
- Instagram Business is managed through Facebook Business Manager
- Requires Facebook Page as intermediary
- Uses Facebook permissions: `instagram_basic`, `instagram_manage_messages`, etc.
- Facebook OAuth URL: `facebook.com/v21.0/dialog/oauth`

This is Meta's design - confusing but necessary!

## 🎉 Summary

**Fixed:**
- ✅ Changed OAuth endpoint from Instagram to Facebook
- ✅ Updated scopes for Instagram Business
- ✅ Using main app ID (already done)
- ✅ Local testing confirms it works

**Next:**
- ⏳ Deploy to Render (git push or manual)
- ⏳ Test on production
- 🎯 Should finally connect Instagram Business!

The "Invalid platform app" error should be GONE after deploying this fix! 🚀
