# WhatsApp Embedded Signup v4 Configuration Guide

## ✅ What We Just Fixed

Your WhatsApp connection now uses **Facebook JavaScript SDK with Embedded Signup v4** - the same method Fusion AI uses. No more useless QR codes!

## 📋 Required Meta App Configuration

### 1. Facebook Login for Business Settings

Go to: **App Dashboard → Facebook Login for Business → Settings → Client OAuth Settings**

**Enable these toggles:**
- ✅ Client OAuth Login
- ✅ Web OAuth Login  
- ✅ Enforce HTTPS
- ✅ Use Strict Mode for Redirect URIs
- ✅ Login with the JavaScript SDK
- ✅ Embedded Browser OAuth Login

**Add these domains:**
```
Allowed Domains for the JavaScript SDK:
- localhost (for testing)
- cheer-pledge-lend.ngrok-free.dev (your current ngrok)
- YOUR_PRODUCTION_DOMAIN.com (when you deploy)

Valid OAuth Redirect URIs:
- http://localhost:3000/api/admin/whatsapp/oauth/callback
- https://cheer-pledge-lend.ngrok-free.dev/api/admin/whatsapp/oauth/callback
- https://YOUR_PRODUCTION_DOMAIN.com/api/admin/whatsapp/oauth/callback
```

### 2. Create Embedded Signup Configuration

Go to: **App Dashboard → Facebook Login for Business → Configurations**

**Option A: Use Template (Recommended)**
1. Click "Create from template"
2. Select "WhatsApp Embedded Signup Configuration with 60-day token"
3. This pre-configures the most common permissions

**Option B: Create Custom Configuration**
1. Click "Create Configuration"
2. Name it: "REPLAI WhatsApp Embedded Signup"
3. Select login option: **"WhatsApp Embedded Signup"**
4. Select products to connect: **WhatsApp**
5. Add permissions:
   - `whatsapp_business_management` (manage settings and templates)
   - `whatsapp_business_messaging` (send and receive messages)
6. Save and copy the **Configuration ID**

### 3. Update Configuration ID

After creating the configuration:

1. Open `/connections-ui.js`
2. Find this line:
```javascript
config_id: '893706532897953', // Your configuration ID
```
3. Replace `893706532897953` with YOUR actual Configuration ID from step 2

### 4. Verify Webhooks Setup

Go to: **App Dashboard → WhatsApp → Configuration**

**Callback URL:** `https://cheer-pledge-lend.ngrok-free.dev/webhook`  
**Verify Token:** `replai_verify_token_2024`

**Subscribe to fields:**
- ✅ messages
- ✅ account_update (IMPORTANT for Embedded Signup!)

The `account_update` webhook fires each time a customer completes Embedded Signup.

### 5. App Type Must Be "Business"

Go to: **App Dashboard → Settings → Basic**

Check "App Type" - it MUST be **"Business"** not "Consumer"

If it's Consumer:
1. You'll need to create a new Business app
2. Or contact Meta Support to change the type

## 🧪 Testing Configuration

### Test with Embedded Signup Integration Assistant

Go to: **App Dashboard → WhatsApp → Embedded Signup Builder**

This tool lets you:
- Test the Embedded Signup flow in different configurations
- View returned data (WABA ID, phone number ID, etc.)
- Generate sample code
- Test API calls for onboarding

### Test Button

After configuring:
1. Open your admin dashboard: http://localhost:3000/admin-new.html
2. Go to "Connections" section
3. Click "Connect" button on WhatsApp card
4. You should see Facebook OAuth popup (NOT a QR code!)
5. Follow the flow:
   - Login with Facebook/Meta account
   - Accept WhatsApp Business Platform Terms
   - Select or create Business Portfolio
   - Add/verify phone number
   - Set display name
   - Grant permissions

## 🔑 Current Credentials

```
FACEBOOK_APP_ID=2031381430802139
FACEBOOK_APP_SECRET=234f81496ba2c73b96eb49723b0acc07
WHATSAPP_PHONE_ID=1179746945212557
Test Phone: +1 555-633-0656
```

## 📊 How It Works Now

### Frontend (connections-ui.js)

```javascript
// 1. Initialize Facebook SDK
window.fbAsyncInit = function() {
  FB.init({
    appId: '2031381430802139',
    version: 'v21.0'
  });
};

// 2. Launch Embedded Signup
function launchWhatsAppSignup() {
  FB.login(fbLoginCallback, {
    config_id: 'YOUR_CONFIG_ID_HERE',
    response_type: 'code',
    override_default_response_type: true,
    extras: { setup: {} }
  });
}

// 3. Listen for completion events
window.addEventListener('message', (event) => {
  if (event.origin.endsWith('facebook.com')) {
    const data = JSON.parse(event.data);
    if (data.type === 'WA_EMBEDDED_SIGNUP') {
      // Got WABA ID, phone number ID, business ID
      console.log(data.data);
    }
  }
});

// 4. Exchange code for token
async function exchangeWhatsAppCode(code) {
  await fetch('/api/admin/whatsapp/oauth/exchange', {
    method: 'POST',
    body: JSON.stringify({ code, signupData })
  });
}
```

### Backend (server-new.js)

```javascript
POST /api/admin/whatsapp/oauth/exchange

1. Receives authorization code from FB SDK
2. Exchanges code for long-lived access token:
   GET /oauth/access_token?client_id=...&client_secret=...&code=...
3. Gets WABA ID and phone number ID from:
   - signupData (from message event listener), OR
   - Graph API: /me/businesses → /{business_id}/owned_whatsapp_business_accounts
4. Fetches phone details:
   GET /{phone_number_id}?fields=verified_name,display_phone_number,quality_rating
5. Saves connection to connections.json
6. Returns connection details to frontend
```

## 🚨 Common Issues

### Issue: "Facebook SDK not loaded"
**Solution:** Clear browser cache, refresh page, check console for FB SDK errors

### Issue: "Invalid configuration ID"
**Solution:** Get Configuration ID from App Dashboard → Facebook Login for Business → Configurations

### Issue: Popup blocked
**Solution:** Allow popups for localhost/ngrok in browser settings

### Issue: "Redirect URI mismatch"
**Solution:** Add ALL redirect URIs to Facebook Login for Business → Settings → Valid OAuth Redirect URIs

### Issue: Can't see phone numbers after connecting
**Solution:** Check that `account_update` webhook is subscribed in App Dashboard

### Issue: Permission denied errors
**Solution:** 
1. Ensure Configuration includes `whatsapp_business_management` and `whatsapp_business_messaging`
2. If app is in Development Mode, add yourself as Admin/Developer/Tester
3. If app is Live, ensure App Review approved these permissions

## 🎯 Next Steps

1. **Update Configuration ID** in `/connections-ui.js` (line 29)
2. **Configure Facebook Login for Business** settings (domains + redirect URIs)
3. **Create Embedded Signup Configuration** and get the ID
4. **Test the flow** - click Connect button, should see Facebook popup
5. **Subscribe to webhooks** - especially `account_update`
6. **Register phone number** for Cloud API usage (if not done during signup)

## 📚 Official Documentation

- [Embedded Signup Implementation](https://developers.facebook.com/docs/whatsapp/embedded-signup/implementation)
- [Embedded Signup Flow](https://developers.facebook.com/docs/whatsapp/embedded-signup)
- [Graph API Reference](https://developers.facebook.com/docs/graph-api/reference/whats-app-business-account)

## 💡 Why This Works Like Fusion AI

Fusion AI uses the EXACT same method:
1. Facebook JavaScript SDK
2. Embedded Signup v4 flow
3. OAuth popup (not QR code)
4. Automatic WABA + phone number creation
5. Token exchange via Graph API

The difference was:
- ❌ Your old code: Custom OAuth URL → QR code → manual setup
- ✅ New code: FB SDK → Embedded Signup popup → automatic setup

Now it's just as smooth as Fusion AI! 🎉
