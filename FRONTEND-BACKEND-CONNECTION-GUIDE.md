# 🔗 REPLAI Frontend-Backend Connection Guide

## ✅ Current Status: FULLY CONNECTED

Your redesigned `admin-new.html` is **already properly connected** to all backend endpoints! Here's the complete breakdown:

---

## 🔐 Authentication Flow

### 1. Login System (`login.html` → `server-new.js`)

**Login Page APIs:**
- ✅ `POST /api/auth/login` - Email/password login
- ✅ `GET /api/auth/google` - Google OAuth
- ✅ `GET /api/auth/facebook` - Facebook OAuth  
- ✅ `GET /api/auth/google/callback` - OAuth callback
- ✅ `GET /api/auth/facebook/callback` - OAuth callback

**How it works:**
```javascript
// 1. User enters credentials on login.html
fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
})

// 2. Server creates session and returns sessionId
{ success: true, sessionId: "session_123...", user: {...} }

// 3. Session stored in localStorage
localStorage.setItem('sessionId', data.sessionId);

// 4. Redirect to /admin
window.location.href = '/admin';
```

### 2. Admin Panel Protection (`admin-new.html`)

**Session Verification (lines 1090-1126):**
```javascript
// On admin page load, verify session
fetch('/api/auth/verify', {
    headers: { 'X-Session-ID': sessionId }
})

// If invalid → redirect to login
// If valid → show dashboard
```

**Logout Function (line 2888):**
```javascript
async function handleLogout() {
    await fetch('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ sessionId })
    });
    localStorage.clear();
    window.location.replace('/');
}
```

---

## 📊 Dashboard APIs

### Statistics
- ✅ `GET /api/admin/stats` - Get message counts (lines 1992, 3503)
- ✅ `GET /api/admin/chat-logs` - Get conversation history (lines 1988, 3464)

**Usage:**
```javascript
// Update dashboard stats
const response = await fetch('/api/admin/stats');
const stats = await response.json();
// { totalMessages: 42, todayMessages: 15 }
```

---

## 🔌 Platform Connection APIs

### Telegram (lines 3183-3200)
```javascript
async function connectTelegram() {
    const token = document.getElementById('telegram-token').value;
    const response = await fetch('/api/admin/connect/telegram', {
        method: 'POST',
        body: JSON.stringify({ token })
    });
}
```

### Instagram (lines 3246-3360)
**OAuth Flow:**
1. `GET /api/admin/instagram/oauth/auth-url` - Get authorization URL
2. User authorizes on Instagram
3. `POST /api/admin/instagram/oauth/exchange` - Exchange code for token
4. `GET /api/admin/instagram/status` - Check connection status
5. `POST /api/admin/instagram/oauth/refresh` - Refresh expired tokens
6. `POST /api/instagram/poll` - Poll for messages (every 30s)

### WhatsApp (lines 3101-3174)
```javascript
// Get QR code for WhatsApp Web linking
const res = await fetch('/api/admin/connect/whatsapp/qr');
const { qr } = await res.json();
// Display QR for user to scan
```

### TikTok (lines 3369-3385)
```javascript
async function connectTiktok() {
    const token = document.getElementById('tiktok-token').value;
    await fetch('/api/admin/connect/tiktok', {
        method: 'POST',
        body: JSON.stringify({ token })
    });
}
```

### Platform Status Check (line 3544)
```javascript
const statusResponse = await fetch('/api/admin/platform-status');
const status = await statusResponse.json();
// { telegram: {connected: true}, instagram: {...}, etc }
```

---

## 🏢 Business Information APIs

### Save Business Info (line 3402)
```javascript
async function saveBusinessInfo() {
    const data = {
        name: document.getElementById('business-name').value,
        description: document.getElementById('business-description').value,
        products: document.getElementById('products').value,
        hours: document.getElementById('hours').value,
        contact: document.getElementById('contact').value,
        faqs: document.getElementById('faqs').value
    };
    
    await fetch('/api/admin/business-info', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}
```

### Load Settings (line 3535)
```javascript
const response = await fetch('/api/admin/settings');
const data = await response.json();
// Pre-fill forms with existing data
```

---

## 🤖 AI Settings APIs

### Save AI Settings (line 3429)
```javascript
async function saveAISettings() {
    const settings = {
        language: document.getElementById('language-selector').value,
        responseStyle: document.getElementById('response-style').value,
        maxLength: document.getElementById('max-length').value
    };
    
    await fetch('/api/admin/ai-settings', {
        method: 'POST',
        body: JSON.stringify(settings)
    });
}
```

---

## 📅 Booking System APIs

### Booking Management (lines 2967-3051)
```javascript
// List bookings
const res = await fetch('/api/admin/bookings');
const { bookings } = await res.json();

// Create booking
await fetch('/api/admin/bookings', {
    method: 'POST',
    body: JSON.stringify({
        customerName, customerPhone, service, date, time
    })
});

// Update booking status
await fetch(`/api/admin/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'confirmed' })
});

// Cancel booking
await fetch(`/api/admin/bookings/${id}`, {
    method: 'DELETE'
});

// Get available time slots
const res = await fetch(`/api/admin/bookings/available?date=${date}&service=${service}`);
const { slots } = await res.json();
```

---

## 💬 Chat Logs API

### View Conversations (line 3463)
```javascript
async function loadChatLogs() {
    const response = await fetch('/api/admin/chat-logs');
    const logs = await response.json();
    
    logs.forEach(log => {
        // Display: platform, userId, message, response, timestamp
    });
}
```

---

## 🎨 UI Features

### Theme Switcher
```javascript
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}
```

### Multi-Language Support
```javascript
function changeLanguage() {
    const lang = document.getElementById('language-selector').value;
    localStorage.setItem('replai-language', lang);
    // Updates all elements with [data-i18n] attributes
}
```

### Mobile Menu
```javascript
function toggleMobileMenu() {
    document.getElementById('sidebar').classList.toggle('mobile-open');
    document.querySelector('.sidebar-overlay').classList.toggle('active');
}
```

---

## ✅ Verification Checklist

To ensure everything is working:

### 1. Test Authentication
```bash
# Start server
node server-new.js

# Open browser
open http://localhost:3000

# Try login with:
# Email: admin@replai.com
# Password: admin123
```

### 2. Check API Endpoints
```bash
# In browser console after logging in:
fetch('/api/admin/stats').then(r => r.json()).then(console.log)
fetch('/api/admin/platform-status').then(r => r.json()).then(console.log)
```

### 3. Test Platform Connections
- Go to "Connect Platforms" section
- Click "Connect" for Telegram/Instagram/WhatsApp
- Verify modal/wizard opens
- Check server console for API calls

### 4. Test Business Info Save
- Go to "Business Info" section
- Fill in forms
- Click "Save"
- Verify success message appears
- Check `business-info.json` file updated

---

## 🚀 Deployment Notes

### Environment Variables Required
```env
# AI Provider (required)
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here

# Server
PORT=3000

# Telegram (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Instagram (optional)
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_REDIRECT_URI=https://your-domain.com/api/admin/instagram/oauth/callback

# WhatsApp (optional)
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_PHONE_ID=your_phone_id

# TikTok (optional)
TIKTOK_ACCESS_TOKEN=your_token

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback

# Facebook OAuth (optional)
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_LOGIN_REDIRECT_URI=https://your-domain.com/api/auth/facebook/callback
```

---

## 📁 File Structure

```
/Users/ak/replai/
├── login.html              # Login page
├── admin-new.html          # Main dashboard (your redesigned version)
├── server-new.js           # Backend server with all APIs
├── ai-engine-free.js       # AI response engine
├── business-info.json      # Business data storage
├── ai-settings.json        # AI configuration storage
├── sessions.json           # User sessions storage
├── bookings.json           # Booking appointments storage
└── .env                    # Environment variables
```

---

## 🔄 Data Flow Example

**Customer sends Instagram message:**
1. Instagram webhook → `POST /webhook/instagram` (server-new.js)
2. Server calls `getAIResponse()` (ai-engine-free.js)
3. AI reads `business-info.json` for context
4. Response sent back to Instagram
5. Conversation logged to `chatLogs` array
6. Admin dashboard shows it in Chat Logs section

---

## 🎯 Everything Is Connected!

Your redesigned admin panel has all the necessary:
- ✅ Authentication checks
- ✅ API endpoint calls
- ✅ Data loading functions
- ✅ Form submission handlers
- ✅ Real-time updates
- ✅ Session management
- ✅ Error handling
- ✅ Multi-language support
- ✅ Theme switching
- ✅ Mobile responsiveness

**No additional connections needed!** Just test each feature to verify it works as expected.

---

## 🐛 Troubleshooting

### Issue: Can't login
- Check `.env` file exists
- Verify server is running: `node server-new.js`
- Check browser console for errors
- Try default credentials: admin@replai.com / admin123

### Issue: Platform connection fails
- Check environment variables are set
- Verify API tokens are valid
- Check server console for error messages
- Test webhook URLs are accessible

### Issue: Data not saving
- Check file permissions on JSON files
- Verify `sessions.json`, `bookings.json` exist
- Check server has write permissions
- Look for error messages in server console

---

## 📞 Need Help?

If something isn't working:
1. Check server console for errors
2. Open browser DevTools → Console
3. Test individual API endpoints
4. Verify .env configuration
5. Check file permissions

**Your app is ready to go! Just start the server and begin testing.** 🚀
