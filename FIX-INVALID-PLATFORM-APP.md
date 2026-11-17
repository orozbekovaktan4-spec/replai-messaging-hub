# Fix "Invalid platform app" Error

## ❌ The Problem
You're getting: **"Invalid Request: Request parameters are invalid: Invalid platform app"**

This means your Meta App (ID: `2031381430802139`) is not configured correctly for Instagram OAuth.

## ✅ The Solution

### Step 1: Go to Meta Developers Console
1. Visit: https://developers.facebook.com/apps/2031381430802139/
2. Log in with your Meta/Facebook account

### Step 2: Check App Type
Your app needs to be the correct type:

**Required App Type:**
- ✅ **Business** (for Instagram Business accounts)
- ❌ NOT Consumer
- ❌ NOT Gaming

If your app is the wrong type:
1. You may need to create a NEW app
2. Choose "Business" when creating
3. Select "Instagram" as the product

### Step 3: Add Instagram Product
1. In your app dashboard, go to **"Add Products"**
2. Find **"Instagram"** 
3. Click **"Set Up"** or **"Configure"**
4. You should see these options:
   - Instagram Basic Display (for personal accounts - NOT what you want)
   - Instagram Graph API (for Business accounts - YES!)

### Step 4: Configure Instagram Graph API
1. Select **"Instagram Graph API"**
2. Go to **Settings** → **Basic**
3. Make sure these are filled:
   - **App Name**: REPLAI (or your app name)
   - **Contact Email**: your email
   - **Privacy Policy URL**: your privacy policy
   - **Terms of Service URL**: (optional but recommended)

### Step 5: Add Platform (THIS IS CRITICAL!)
1. In **Settings** → **Basic**, scroll to **"Add Platform"**
2. Click **"Add Platform"**
3. Select **"Website"**
4. Enter your Site URL:
   - For LOCAL: `http://localhost:3000`
   - For PRODUCTION: `https://replai-xc95.onrender.com`
   
**⚠️ IMPORTANT:** You can add BOTH by clicking "Add Platform" twice!

### Step 6: Configure OAuth Redirect URIs
1. Go to **Instagram** → **Basic Display** (or **Graph API Settings**)
2. Find **"Valid OAuth Redirect URIs"** or **"Redirect URIs"**
3. Add:
   ```
   http://localhost:3000/api/admin/instagram/oauth/callback
   https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback
   ```
4. Click **"Save Changes"**

### Step 7: App Review (If Needed)
Some Instagram permissions require App Review:
- `instagram_business_basic` - Usually approved automatically
- `instagram_business_manage_messages` - Requires review
- `instagram_business_manage_comments` - Requires review

**For testing:**
1. Add yourself as a **Test User** or **App Tester**
2. Go to **Roles** → **Test Users** or **Testers**
3. Add your Instagram Business account
4. This lets you test WITHOUT app review

### Step 8: Check App Mode
1. In the top of your app dashboard, check the toggle
2. It might say **"Development"** or **"Live"**
3. For testing, **Development mode** is fine
4. In Development mode, only test users can connect

### Step 9: Verify App Settings
Make sure these settings are correct in your `.env`:

```env
INSTAGRAM_APP_ID=2031381430802139
INSTAGRAM_APP_SECRET=234f81496ba2c73b96eb49723b0acc07
INSTAGRAM_REDIRECT_URI=https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback
```

## 🔧 Alternative: Create a New App

If your current app is misconfigured, it might be easier to create a fresh one:

### 1. Go to Meta for Developers
https://developers.facebook.com/apps/create/

### 2. Create New App
- **App Type**: Business
- **Name**: REPLAI Instagram
- **Contact Email**: your email

### 3. Add Instagram Product
- Go to **"Add Products"**
- Select **"Instagram Graph API"**
- Click **"Set Up"**

### 4. Configure Settings
Follow Steps 5-8 above with your NEW App ID and Secret

### 5. Update .env
```env
INSTAGRAM_APP_ID=YOUR_NEW_APP_ID
INSTAGRAM_APP_SECRET=YOUR_NEW_APP_SECRET
```

## 🎯 Quick Checklist

Before trying to connect again, verify:

- [ ] App type is "Business"
- [ ] Instagram Graph API product is added
- [ ] Website platform is added with correct URL
- [ ] OAuth Redirect URI is added and saved
- [ ] You're added as a test user (if app is in Development mode)
- [ ] App ID and Secret are correct in .env file
- [ ] Server restarted after .env changes

## 📝 Common Mistakes

❌ **Using Instagram Basic Display instead of Instagram Graph API**
- Basic Display = Personal accounts only
- Graph API = Business accounts (what you need)

❌ **Wrong redirect URI format**
- Must match EXACTLY including protocol (http/https)
- Don't forget the `/api/admin/instagram/oauth/callback` path

❌ **App not configured for your domain**
- Must add platform (Website) with your domain
- Both localhost AND production domain need to be added

❌ **Forgetting to save changes**
- Always click "Save Changes" after editing settings
- Changes take effect immediately

## 🧪 Test After Fixing

1. Restart your server:
   ```bash
   cd /Users/ak/replai
   node server-new.js
   ```

2. Open test page:
   ```
   http://localhost:3000/connect-instagram-direct.html
   ```

3. Click "Connect Instagram Business"

4. You should now see Instagram's authorization page instead of an error!

## 🆘 Still Getting Error?

If you still see "Invalid platform app" after following ALL steps:

1. **Take screenshots** of:
   - Your app dashboard main page
   - Settings → Basic (App ID section)
   - Instagram product settings
   - Valid OAuth Redirect URIs

2. **Check the URL** being generated:
   - Open browser console (F12)
   - Look for the OAuth URL
   - Copy it and check if it has the right App ID

3. **Try the Meta Graph API Explorer**:
   - https://developers.facebook.com/tools/explorer/
   - Select your app from the dropdown
   - If you can't select it, the app configuration is broken

## 📞 Need Help?

Meta Developer Support:
- https://developers.facebook.com/support/bugs/

Meta Business Help:
- https://business.facebook.com/business/help
