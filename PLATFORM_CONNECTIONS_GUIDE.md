# 🚀 REPLAI Platform Connections Implementation Guide

## Overview
This guide provides the implementation for fastest platform connections: WhatsApp (1-click), Telegram (QR helper), and Instagram (quick token).

## Part 1: Add Required Libraries

### 1. Add to `<head>` section of admin-super.html (after line 11):

```html
<!-- QR Code Library for Telegram -->
<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
```

### 2. Add Facebook SDK before closing `</body>` tag:

```html
<!-- Facebook SDK for WhatsApp Embedded Signup -->
<script>
  window.fbAsyncInit = function() {
    FB.init({
      appId: '{{ FACEBOOK_APP_ID }}', // TODO: Replace with your Meta App ID
      cookie: true,
      xfbml: true,
      version: 'v21.0'
    });
  };

  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
</script>
```

## Part 2: Update Quick Connect Modal

Replace the existing Quick Connect Modal content with enhanced platform sections.

### Key Features:
- **WhatsApp**: 1-click Facebook embedded signup + manual fallback
- **Telegram**: QR code helper with step-by-step bot creation
- **Instagram**: Direct token input with Meta Business Suite links

## Part 3: Add Telegram Bot Helper Modal

This modal provides:
- QR code to open @BotFather on mobile
- Step-by-step instructions
- Suggested bot name/username
- Copy buttons for commands
- Token input and connection

## Part 4: JavaScript Functions

### Global Variables:
```javascript
let currentBusinessId = null;
let currentBusinessName = null;
```

### Functions to Add:
1. `connectWhatsAppEmbedded()` - Facebook OAuth flow
2. `connectWhatsAppManual()` - Manual phone input
3. `showTelegramBotHelper()` - Open Telegram helper
4. `closeTelegramHelper()` - Close helper
5. `connectTelegramBot()` - Connect bot with token
6. `connectInstagram()` - Connect Instagram with token
7. `copyToClipboard(text)` - Copy helper

## Part 5: Backend API Endpoints (server-new.js)

Add these endpoints:
1. `POST /api/admin/whatsapp/embedded-setup`
2. `POST /api/admin/whatsapp/manual-setup`
3. `POST /api/admin/telegram/connect`
4. `POST /api/admin/instagram/connect`

## Part 6: Environment Variables (.env)

```env
# Facebook/Meta Configuration
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_CONFIGURATION_ID=your_config_id_here

# Base URL for webhooks
BASE_URL=https://replai-xc95.onrender.com
```

## Part 7: Translation Keys

Add to all 3 languages (ru/en/ky):
- Platform names
- Button labels
- Helper text
- Link text
- Instructions

## Implementation Priority

### Phase 1 (Do First):
1. ✅ Add QR code library to head
2. ✅ Add Facebook SDK before closing body
3. ✅ Add translation keys for new UI elements
4. ✅ Add JavaScript helper functions

### Phase 2 (Do Second):
1. ✅ Update Quick Connect Modal with enhanced WhatsApp section
2. ✅ Update Quick Connect Modal with enhanced Telegram section
3. ✅ Update Quick Connect Modal with enhanced Instagram section
4. ✅ Add Telegram Bot Helper Modal (new modal)

### Phase 3 (Do Third):
1. ✅ Add backend API endpoints in server-new.js
2. ✅ Test WhatsApp connection flow
3. ✅ Test Telegram bot creation
4. ✅ Test Instagram token connection

## Quick Start Commands

```bash
cd /Users/ak/replai

# 1. Update admin-super.html with new code
# 2. Update server-new.js with new endpoints
# 3. Update .env with Facebook credentials

# Deploy
git add .
git commit -m "🚀 Add fastest platform connections"
git push origin main
```

## Testing Checklist

- [ ] WhatsApp 1-click popup appears
- [ ] WhatsApp manual fallback works
- [ ] Telegram QR code displays
- [ ] Telegram bot creation steps clear
- [ ] Instagram token input works
- [ ] All translations work in 3 languages
- [ ] Backend saves connections correctly
- [ ] Connections display in business list

## Time Estimate
- Implementation: 2-3 hours
- Testing: 30 minutes
- **Total Setup Time (for client): 5 minutes** ✅

## Notes
- Facebook App ID needed from Meta Developer Console
- Telegram webhooks need HTTPS (Render.com provides this)
- Instagram tokens from Meta Business Suite
- All connections stored in database JSON fields
