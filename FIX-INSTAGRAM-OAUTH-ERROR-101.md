# Fix Instagram OAuth Error 101

## ❌ Current Error

```
Error validating application. Cannot get application info due to a system error.
Code: 101
```

## 🎯 Root Cause

You're using **mismatched credentials**:
- **Instagram App ID**: `951759947647280` (from Instagram Basic Display)
- **App Secret**: From main app `2031381430802139`

These don't match! Error 101 means **the app secret doesn't belong to that app ID**.

## 🔍 The Confusion

Meta has created TWO different Instagram apps in your account:

### 1. Instagram Basic Display App
- **App ID**: `951759947647280`
- **Purpose**: Personal Instagram accounts only
- **Features**: Read profile, get media
- **Cannot**: Receive messages, manage business features
- **Has its own secret** (different from main app)

### 2. Instagram Graph API (Business)
- **App ID**: `2031381430802139` (same as main Meta app)
- **Purpose**: Instagram Business/Creator accounts
- **Features**: Messages, comments, insights, full business features
- **Uses main app secret**
- **THIS IS WHAT REPLAI NEEDS!**

## ✅ Solution

Since REPLAI needs Instagram Business features (messages, auto-reply), you need to use **Instagram Graph API**, not Basic Display.

### Change Back to Main App ID:

Update your `.env`:

```env
# For Instagram BUSINESS (Graph API):
INSTAGRAM_APP_ID=2031381430802139
INSTAGRAM_APP_SECRET=<your_rotated_main_app_secret>
```

**Yes, go back to the main app ID!** The "Invalid platform app" error was misleading - it meant Instagram Graph API wasn't properly configured, not that the app ID was wrong.

## 🔧 Steps to Fix in Meta Console

1. **Go to your Meta app:**
   https://developers.facebook.com/apps/2031381430802139/

2. **Make sure Instagram Graph API is added** (not Basic Display):
   - Click "Add Product"
   - Look for "Instagram" with description mentioning "Graph API" or "Business"
   - **NOT** "Instagram Basic Display"

3. **Configure Instagram Graph API:**
   - Go to Instagram product settings
   - Add Valid OAuth Redirect URI:
     ```
     https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback
     ```

4. **Use Facebook OAuth flow** (not Instagram OAuth):
   - Instagram Business uses Facebook's OAuth endpoint
   - URL: `https://www.facebook.com/v21.0/dialog/oauth`
   - Permissions: `instagram_basic`, `instagram_manage_messages`, `instagram_manage_comments`, `pages_show_list`, `pages_read_engagement`

## 🎯 Correct OAuth Flow for Instagram Business

The OAuth URL should look like:

```
https://www.facebook.com/v21.0/dialog/oauth?
  client_id=2031381430802139&
  redirect_uri=https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback&
  scope=instagram_basic,instagram_manage_messages,pages_show_list&
  response_type=code
```

**NOT** `https://api.instagram.com/oauth/authorize` (that's for Basic Display)

## 🔄 Update Your Connection Manager

Your code needs to use Facebook OAuth for Instagram Business. Let me check if it's already configured correctly...

The current code at line 529 uses:
```javascript
const tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
```

This is CORRECT for Instagram Business! So you just need to:
1. Use main app ID: `2031381430802139`
2. Use main app secret (the rotated one)
3. Make sure Instagram Graph API product is properly added in Meta console

## ⚠️ Important: Instagram Business Requirements

To use Instagram Graph API, you MUST have:
- ✅ Instagram Business or Creator account (not personal)
- ✅ Instagram connected to a Facebook Page
- ✅ You are admin of that Facebook Page

If you don't have these, Instagram Graph API won't work!

## 🧪 Test After Fix

1. Update `.env` with main app ID and secret
2. Update Render environment variables
3. Test OAuth again

The error should change from "Error validating application" to either:
- ✅ Success (if everything configured correctly)
- ❌ Different error (telling us what else needs fixing)

## 📝 Summary

**Wrong combo** (causes error 101):
- App ID: 951759947647280 (Basic Display)
- Secret: From main app
- ❌ Mismatch!

**Right combo for Business:**
- App ID: 2031381430802139 (Main app)
- Secret: Main app secret
- ✅ Correct!

**Or use Basic Display** (but limited features):
- App ID: 951759947647280
- Secret: Instagram Basic Display secret
- ✅ Works, but no messaging

Since REPLAI needs messaging, use the main app ID!
