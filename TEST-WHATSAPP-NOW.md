# 🚀 Test WhatsApp Embedded Signup NOW

## ✅ What's Running

- **Server:** http://localhost:3000 (node server-new.js)
- **Ngrok:** https://cheer-pledge-lend.ngrok-free.dev
- **Admin:** http://localhost:3000/admin-new.html

## ⚡ Quick Test (3 steps)

### Step 1: Get Configuration ID

1. Go to [Meta App Dashboard](https://developers.facebook.com/apps/2031381430802139/fb-login-for-business/configurations/)
2. Click "**Create from template**"
3. Select "**WhatsApp Embedded Signup Configuration with 60-day token**"
4. Copy the **Configuration ID** (looks like: `123456789012345`)

### Step 2: Update Configuration ID

Open `/Users/ak/replai/connections-ui.js` and find line ~29:

```javascript
config_id: '893706532897953', // REPLACE THIS
```

Replace with YOUR Configuration ID from Step 1.

### Step 3: Configure Domains

1. Go to [Facebook Login for Business → Settings](https://developers.facebook.com/apps/2031381430802139/fb-login-for-business/settings/)

2. **Client OAuth Settings** - Enable ALL these toggles:
   - ✅ Client OAuth Login
   - ✅ Web OAuth Login
   - ✅ Enforce HTTPS
   - ✅ Use Strict Mode for Redirect URIs
   - ✅ Login with the JavaScript SDK
   - ✅ Embedded Browser OAuth Login

3. **Allowed Domains for the JavaScript SDK:**
   ```
   localhost
   cheer-pledge-lend.ngrok-free.dev
   ```

4. **Valid OAuth Redirect URIs:**
   ```
   http://localhost:3000/api/admin/whatsapp/oauth/callback
   https://cheer-pledge-lend.ngrok-free.dev/api/admin/whatsapp/oauth/callback
   ```

5. Click "**Save Changes**"

## 🧪 Test It!

### Option A: Test Locally

1. Open: http://localhost:3000/admin-new.html
2. Scroll to "**Connections**" section
3. Find WhatsApp card
4. Click "**Connect**" button
5. Facebook OAuth popup should appear (NOT QR code!)
6. Complete the signup flow

### Option B: Test via Ngrok (for mobile testing)

1. Open: https://cheer-pledge-lend.ngrok-free.dev/admin-new.html
2. Click through ngrok warning
3. Same steps as Option A

### Option C: Use Meta's Testing Tool

1. Go to [Embedded Signup Builder](https://developers.facebook.com/apps/2031381430802139/whatsapp-embedded-signup/)
2. Test configuration directly in Meta's interface
3. See returned data (WABA ID, phone number ID)

## 📱 What You Should See

### ✅ CORRECT Flow (Embedded Signup v4)

1. Click "Connect" button
2. **Facebook OAuth popup opens** (centered window)
3. Login with Facebook/Meta account
4. Accept WhatsApp Business Platform Terms
5. Select/create Business Portfolio
6. Add phone number (or use +1 555 test number)
7. Set display name
8. Grant permissions
9. Popup closes automatically
10. Dashboard shows "Connected ✓"
11. Phone number and verified name appear

### ❌ OLD Flow (What You Had Before)

1. Click Connect
2. Ugly QR code page opens
3. Scan with phone (doesn't work properly)
4. Manual setup required
5. Confusing error messages

## 🎯 Expected Results

### In Browser Console:

```javascript
[FB SDK] Initialized successfully
[WhatsApp] Launching Embedded Signup...
[WhatsApp] Embedded Signup message event: {
  type: "WA_EMBEDDED_SIGNUP",
  event: "FINISH",
  data: {
    waba_id: "524126980791429",
    phone_number_id: "1179746945212557",
    business_id: "2729063490586005"
  }
}
[WhatsApp] Got authorization code: AQDxyz...
[WhatsApp] Connected successfully!
```

### In Server Logs:

```
[WhatsApp Exchange] Exchanging authorization code...
[WhatsApp Exchange] Signup data: { waba_id: '...', phone_number_id: '...' }
[WhatsApp Exchange] ✓ Got access token
[WhatsApp Exchange] Phone details:
  - Number: +1 555-633-0656
  - Verified Name: REPLAI Test
  - Quality Rating: GREEN
[WhatsApp Exchange] ✓ Connection saved successfully
```

### In UI:

```
✅ WhatsApp Business
   Status: Connected
   
   Phone: +1 555-633-0656
   Verified Name: REPLAI Test
   
   [Manage] [Disconnect]
```

## 🚨 Troubleshooting

### "Facebook SDK not loaded"

```bash
# Clear browser cache and refresh
# Check browser console for errors
```

### "Invalid configuration ID"

```bash
# Make sure you created the configuration in Meta App Dashboard
# Copy the EXACT Configuration ID (numbers only)
# Update connections-ui.js line 29
```

### Popup blocked

```bash
# Allow popups for localhost in browser settings
# Chrome: Settings → Privacy and security → Site settings → Pop-ups
```

### "Redirect URI mismatch"

```bash
# Check Meta App Dashboard → Facebook Login for Business → Settings
# Ensure BOTH URLs are in "Valid OAuth Redirect URIs":
#   - http://localhost:3000/api/admin/whatsapp/oauth/callback
#   - https://cheer-pledge-lend.ngrok-free.dev/api/admin/whatsapp/oauth/callback
```

### Still showing QR code

```bash
# Your browser cached the old admin-new.html
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
# Or clear cache and reload
```

## 📝 Configuration Checklist

Before testing, verify:

- [ ] Created Embedded Signup Configuration in Meta App Dashboard
- [ ] Copied Configuration ID
- [ ] Updated `connections-ui.js` with correct Configuration ID
- [ ] Enabled all Client OAuth Settings toggles
- [ ] Added `localhost` to Allowed Domains
- [ ] Added `cheer-pledge-lend.ngrok-free.dev` to Allowed Domains
- [ ] Added both redirect URIs (http://localhost:3000 and https://ngrok)
- [ ] Saved all changes in Meta App Dashboard
- [ ] Server is running (node server-new.js)
- [ ] Ngrok is running (ngrok http 3000)
- [ ] Cleared browser cache

## 🎉 Success Looks Like

1. Click Connect → Facebook popup opens instantly
2. Complete signup → Popup closes automatically
3. Dashboard updates → Shows connected status
4. Phone number appears → Verified name appears
5. Can disconnect/reconnect smoothly

**This is EXACTLY how Fusion AI works!**

## 🔧 Files Changed

1. `/connections-ui.js` - New FB SDK-based flow
2. `/admin-new.html` - Added Facebook SDK initialization
3. `/server-new.js` - New `/api/admin/whatsapp/oauth/exchange` endpoint
4. `/connections.json` - Stores connection state

## 📚 Documentation

- Full guide: `/WHATSAPP-EMBEDDED-SIGNUP-CONFIG.md`
- Meta docs: https://developers.facebook.com/docs/whatsapp/embedded-signup

## 💬 Need Help?

Check the configuration guide: `WHATSAPP-EMBEDDED-SIGNUP-CONFIG.md`

The key difference from before:
- ❌ Old: Custom OAuth → QR code → manual → doesn't work
- ✅ New: FB SDK → Embedded Signup → automatic → works like Fusion AI
