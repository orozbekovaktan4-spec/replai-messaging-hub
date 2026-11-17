# Instagram App ID Configuration Fix

## 🎯 The Real Issue

You have **TWO different App IDs** from Meta:

1. **Main Meta App ID**: `2031381430802139` 
   - This is your overall Meta/Facebook app
   - Used for Facebook products

2. **Instagram-Specific App ID**: `951759947647280`
   - This is shown in Instagram product settings
   - This is what Instagram OAuth actually uses
   - **This is the one you need!**

## ✅ What You've Confirmed

- ✅ App is Business type
- ✅ Instagram product is installed
- ✅ Render callback is configured: `https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback`
- ✅ Instagram login settings show: App ID `951759947647280`
- ❌ Localhost callback cannot be added (Meta restriction for production apps)
- ⚠️  App secrets were exposed in conversation (need rotation)

## 🔧 Immediate Actions Required

### 1. Get the Correct Instagram App Secret

The Instagram App ID `951759947647280` has its own secret. To find it:

**Option A: In Instagram Settings**
1. Go to: https://developers.facebook.com/apps/2031381430802139/instagram-basic-display/basic-display/
2. Look for "Instagram App Secret" 
3. Copy the secret for app ID `951759947647280`

**Option B: Generate New Secret**
1. In Instagram settings, click "Generate New Secret"
2. Copy the new secret immediately
3. This will invalidate the old one

### 2. Rotate Exposed Secrets (CRITICAL SECURITY)

Your app secret `234f81496ba2c73b96eb49723b0acc07` was exposed in this conversation and must be rotated:

1. Go to: https://developers.facebook.com/apps/2031381430802139/settings/basic/
2. Click "Reset App Secret"
3. Confirm the reset
4. Copy the new secret

### 3. Update Environment Variables

Create a clean `.env` file with the correct Instagram credentials:

```env
# ============================================
# INSTAGRAM OAUTH (Use Instagram-specific App ID)
# ============================================
INSTAGRAM_APP_ID=951759947647280
INSTAGRAM_APP_SECRET=YOUR_INSTAGRAM_APP_SECRET_FROM_STEP_1
INSTAGRAM_REDIRECT_URI=https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback

# ============================================
# MAIN META/FACEBOOK APP (Different app, different purpose)
# ============================================
FACEBOOK_APP_ID=2031381430802139
FACEBOOK_APP_SECRET=YOUR_NEW_ROTATED_SECRET_FROM_STEP_2
```

### 4. Update Render Environment Variables

Don't commit secrets to git! Update them in Render dashboard:

1. Go to: https://dashboard.render.com/
2. Select your REPLAI service
3. Go to **Environment** tab
4. Update:
   - `INSTAGRAM_APP_ID` → `951759947647280`
   - `INSTAGRAM_APP_SECRET` → (new Instagram secret from Step 1)
   - `FACEBOOK_APP_SECRET` → (new rotated secret from Step 2)
5. Click **Save Changes**
6. Render will automatically redeploy

### 5. Update Local .env

Update your local `/Users/ak/replai/.env`:

```bash
# Replace the Instagram credentials section with:
INSTAGRAM_APP_ID=951759947647280
INSTAGRAM_APP_SECRET=your_new_instagram_secret
```

## 🧪 Testing Strategy

Since localhost callback cannot be added to production Meta apps:

### Option 1: Test in Production (Recommended)
1. Deploy updated credentials to Render
2. Test at: `https://replai-xc95.onrender.com/connect-instagram-direct.html`
3. Use your live domain for OAuth flow

### Option 2: Use ngrok for Local Testing
1. Start ngrok: `ngrok http 3000`
2. Get your ngrok URL: `https://abc123.ngrok-free.app`
3. Add this to Meta redirect URIs (temporary)
4. Update local `INSTAGRAM_REDIRECT_URI` to ngrok URL
5. Test locally through ngrok

### Option 3: Create Separate Development App
1. Create a new Meta app for development
2. Configure it with localhost callbacks
3. Use different credentials locally vs production

## 📋 Configuration Checklist

Before testing OAuth again:

- [ ] Found Instagram App ID `951759947647280` in Meta console
- [ ] Got the matching Instagram App Secret
- [ ] Rotated the exposed main app secret
- [ ] Updated `.env` with correct Instagram App ID
- [ ] Updated Render environment variables
- [ ] Verified redirect URI matches: `https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback`
- [ ] Decided on testing strategy (production/ngrok/dev app)

## 🔍 How to Verify Which App ID to Use

When you click "Connect Instagram" and see the Meta authorization page URL, it should contain:

```
?client_id=951759947647280
```

NOT:
```
?client_id=2031381430802139  ❌ WRONG - This is your main Meta app
```

## 🎯 Why This Happened

Meta/Facebook has confusing app structure:
- You create ONE Meta app (ID: 2031381430802139)
- When you add Instagram product, it creates a CHILD Instagram app (ID: 951759947647280)
- The parent app ID doesn't work for Instagram OAuth
- You must use the child Instagram app ID

This is Meta's design, not a bug!

## 🚀 After Fix

Once you update the credentials:

1. **Test the OAuth URL generation:**
   ```bash
   curl http://localhost:3000/api/admin/instagram/oauth/start | jq .
   ```
   
   Should show: `"client_id":"951759947647280"`

2. **Test full OAuth flow:**
   - Visit: `https://replai-xc95.onrender.com/connect-instagram-direct.html`
   - Click "Connect Instagram"
   - Should redirect to Instagram authorization (not error)
   - After approving, should redirect back successfully

## ⚠️ Security Reminder

- ✅ Rotate exposed secrets immediately
- ✅ Never commit secrets to git
- ✅ Use environment variables in production
- ✅ Different credentials for dev/staging/prod
- ✅ Restrict app access in Meta console

## 📞 If Still Not Working

After updating to Instagram App ID `951759947647280`:

1. **Check the error message** - should be different now
2. **Verify app secret** - make sure it's for the Instagram app, not main app
3. **Check Meta app logs** - developers.facebook.com → your app → Webhooks/Logs
4. **Test with Meta Graph API Explorer** - verify the app ID works

The "Invalid platform app" error should be resolved once you use the correct Instagram App ID!
