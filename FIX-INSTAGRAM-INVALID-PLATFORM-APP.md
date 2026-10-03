# 🔧 Fix Instagram "Invalid platform app" Error

## ❌ The Error

```
Invalid Request: Request parameters are invalid: Invalid platform app
```

## 🔍 What This Means

Instagram/Meta is rejecting your OAuth request because:

1. **Wrong platform type** configured in Meta App Dashboard
2. **Redirect URI not whitelisted** in Meta settings
3. **App is in Development Mode** and trying to use non-approved accounts
4. **Using localhost** with an app that requires secure domains

---

## ✅ How to Fix It

### **Step 1: Check Your Meta App Configuration**

1. **Go to Meta App Dashboard:**
   ```
   https://developers.facebook.com/apps/2031381430802139/settings/basic/
   ```

2. **Check App Type:**
   - Look for "App Type" or "Category"
   - Should be: **Business** or **Consumer**
   - Should have: **Instagram Basic Display** OR **Instagram Graph API** enabled

3. **Add Platform if Missing:**
   - Scroll down to "Add Platform"
   - Click **"Website"**
   - Add Site URL: `http://localhost:3000` (for testing)
   - OR add your Railway URL: `https://your-app.up.railway.app`
   - Save Changes

---

### **Step 2: Configure Instagram Product**

1. **Go to Instagram Settings:**
   ```
   https://developers.facebook.com/apps/2031381430802139/instagram-basic-display/basic-settings/
   ```
   OR
   ```
   https://developers.facebook.com/apps/2031381430802139/instagram-login/settings/
   ```

2. **Add Valid OAuth Redirect URIs:**
   
   You need to add BOTH:
   ```
   http://localhost:3000/api/admin/instagram/oauth/callback
   https://your-app.up.railway.app/api/admin/instagram/oauth/callback
   ```

3. **Deauthorize Callback URL:**
   ```
   http://localhost:3000/api/admin/instagram/oauth/deauthorize
   ```

4. **Data Deletion Request URL:**
   ```
   http://localhost:3000/api/admin/instagram/oauth/delete
   ```

5. **Save Changes**

---

### **Step 3: Use Instagram Graph API (Recommended)**

The error suggests you might be using the wrong Instagram product. Here's the right setup:

1. **Go to App Dashboard:**
   ```
   https://developers.facebook.com/apps/2031381430802139/
   ```

2. **Add Products → Instagram Graph API** (NOT Instagram Basic Display)

3. **Configure Instagram Graph API:**
   - Client ID: `2031381430802139` (your app ID)
   - Add redirect URI: Your server URL + `/api/admin/instagram/oauth/callback`

---

### **Step 4: Check App Status**

1. **App Mode:**
   - Development Mode: Only works with accounts added as "Testers"
   - Live Mode: Works with any account

2. **Add Test Users** (if in Development Mode):
   - Go to: https://developers.facebook.com/apps/2031381430802139/roles/test-users/
   - Add your Instagram account as tester
   - Accept the tester invitation on Instagram

---

## 🎯 Quick Fix (Use Access Token Directly)

Since Instagram OAuth is being problematic, use your existing access token:

### **You Already Have a Valid Token!**

```bash
# Your .env already has:
INSTAGRAM_ACCESS_TOKEN=EAAc3h9iWFtsBR3n25GAYiZBiHVFhkR85a2WvOJxXXZALAFe...
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841442927870144
INSTAGRAM_USERNAME=akt4n.o
```

### **This is BETTER than OAuth for your use case because:**
- ✅ No OAuth popup needed
- ✅ Token lasts 60 days
- ✅ Can be refreshed programmatically
- ✅ Already working in your system

### **To Keep Using It:**
1. Don't click "Connect Instagram" button
2. Your connection already works
3. Token auto-refreshes (if configured)

---

## 🔄 Alternative: Manual Token Generation

If you want a fresh token without OAuth:

### **Method 1: Facebook Graph API Explorer**

1. **Go to:**
   ```
   https://developers.facebook.com/tools/explorer/
   ```

2. **Select your app** (2031381430802139)

3. **Get User Access Token** with permissions:
   - `instagram_basic`
   - `instagram_manage_messages`
   - `instagram_manage_comments`

4. **Exchange for Long-Lived Token:**
   ```bash
   curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id=2031381430802139
     &client_secret=234f81496ba2c73b96eb49723b0acc07
     &fb_exchange_token=SHORT_LIVED_TOKEN"
   ```

5. **Get Instagram Business Account ID:**
   ```bash
   curl -X GET "https://graph.facebook.com/v18.0/me/accounts
     ?access_token=YOUR_LONG_LIVED_TOKEN"
   ```

6. **Update .env:**
   ```
   INSTAGRAM_ACCESS_TOKEN=new_token_here
   ```

---

### **Method 2: Instagram Basic Display (Simpler)**

1. **Go to:**
   ```
   https://developers.facebook.com/apps/2031381430802139/instagram-basic-display/basic-settings/
   ```

2. **Add Instagram Test User**

3. **Generate Token** for test user

4. **Copy token** to `.env`

---

## 📋 Checklist for Meta App Configuration

- [ ] App created on Meta Developers
- [ ] App ID: `2031381430802139`
- [ ] Instagram Graph API added (NOT Basic Display)
- [ ] Website platform added with your domain
- [ ] Valid OAuth Redirect URIs added:
  - `http://localhost:3000/api/admin/instagram/oauth/callback`
  - `https://your-production-url/api/admin/instagram/oauth/callback`
- [ ] App in Development Mode OR account added as Tester
- [ ] Business account linked (not personal Instagram)

---

## 🚨 Common Mistakes

### **❌ Wrong Product Selected**
- Using "Instagram Basic Display" instead of "Instagram Graph API"
- Solution: Use Graph API for business messaging

### **❌ Personal Instagram Account**
- OAuth only works with Business or Creator accounts
- Solution: Convert to business account in Instagram app

### **❌ Not Added as Tester**
- App in Development Mode but account not whitelisted
- Solution: Add Instagram account as tester in Meta Dashboard

### **❌ Redirect URI Mismatch**
- URI in code doesn't match Meta Dashboard
- Solution: Must match EXACTLY (no trailing slash, correct protocol)

### **❌ Using HTTP in Production**
- Meta doesn't allow http:// for non-localhost domains
- Solution: Use HTTPS (deploy to Railway/Render)

---

## 🎯 Recommended Solution

### **For Development/Testing:**

**DON'T use OAuth - use your existing token:**
```bash
# Your .env already has a working token!
INSTAGRAM_ACCESS_TOKEN=EAAc3h9iWFtsBR3n25GAYiZBiHVFhkR85a2WvOJxXXZALAFe...
```

✅ This is SIMPLER  
✅ This is FASTER  
✅ This ALREADY WORKS  
✅ No OAuth popup needed  

---

### **For Production:**

1. **Deploy to Railway** (get HTTPS URL)
2. **Update Meta App redirect URIs** with production URL
3. **Switch app to Live Mode**
4. **OAuth will work** for any user

---

## 💡 Why This Error Happens

Meta's "Invalid platform app" error occurs when:

1. **Platform Type Mismatch:**
   - App configured for one platform (e.g., iOS)
   - But you're using another (e.g., Web)

2. **Missing Platform:**
   - No "Website" platform added in Meta Dashboard
   - Solution: Add Website platform with your domain

3. **Development Mode Restrictions:**
   - App in Development Mode
   - Account not added as Tester
   - Solution: Add account as tester OR switch to Live Mode

4. **Wrong Redirect URI:**
   - Not whitelisted in Meta Dashboard
   - Solution: Add exact URI to allowed list

---

## 🔧 Step-by-Step Fix Guide

### **Fix 1: Add Website Platform**

1. Go to: https://developers.facebook.com/apps/2031381430802139/settings/basic/
2. Scroll to bottom → **Add Platform**
3. Choose **Website**
4. Site URL: `http://localhost:3000` (testing) or `https://your-app.com` (production)
5. Save Changes

### **Fix 2: Add Redirect URIs**

1. Go to: https://developers.facebook.com/apps/2031381430802139/instagram-graph-api/tools/
2. Or: Products → Instagram → Settings
3. Add OAuth Redirect URIs:
   ```
   http://localhost:3000/api/admin/instagram/oauth/callback
   ```
4. Save Changes

### **Fix 3: Add Yourself as Tester**

1. Go to: https://developers.facebook.com/apps/2031381430802139/roles/test-users/
2. Add Testers → Instagram Accounts
3. Add your Instagram username: `akt4n.o`
4. Accept invitation in Instagram app

### **Fix 4: Switch to Graph API**

1. Products → Add Product
2. Choose **Instagram Graph API** (NOT Basic Display)
3. Configure settings
4. Save

---

## ✅ Quick Test

After fixing, test the OAuth endpoint:

```bash
# Check if endpoint returns authUrl:
curl http://localhost:3000/api/admin/instagram/oauth/auth-url
```

Should return:
```json
{
  "authUrl": "https://www.instagram.com/oauth/authorize?client_id=2031381430802139&..."
}
```

If you still get errors, it's a Meta configuration issue, not your code.

---

## 🎯 Bottom Line

**Easiest Solution:**  
✅ **Use your existing access token** - it already works!  
✅ **Don't use OAuth** - it's complicated for development  
✅ **Deploy to cloud when ready** - OAuth will work in production  

**Your Instagram is already connected - no need to reconnect!** 🎉

---

**Created:** 2026-08-10  
**Your App ID:** 2031381430802139  
**Status:** Token-based auth working, OAuth needs Meta configuration  
**Recommendation:** Keep using existing token, fix OAuth later
