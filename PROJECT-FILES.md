# REPLAI - Essential Files

## ✅ Cleaned Up Successfully!
Deleted **80+ redundant documentation files** and kept only essential files.

---

## 🔥 TOP 3 MOST IMPORTANT FILES:

### 1. **server-new.js** (56KB)
   - The main Node.js server
   - Handles all API endpoints
   - Instagram/Facebook OAuth logic
   - Webhook handlers for Instagram/WhatsApp
   - Booking system
   - Authentication system
   - **THIS IS THE CORE OF YOUR APP**

### 2. **admin-new.html** (188KB)
   - The complete admin dashboard
   - All UI for managing platforms
   - Instagram connection interface
   - Bookings calendar
   - Chat logs viewer
   - Settings management
   - **THIS IS YOUR ENTIRE FRONTEND**

### 3. **.env** 
   - All your API keys and credentials
   - Instagram tokens
   - Facebook App ID/Secret
   - Telegram bot token
   - WhatsApp credentials
   - AI provider keys
   - **THIS IS YOUR CONFIGURATION**

---

## 📁 Other Essential Files:

### Core Functionality:
- **ai-engine-free.js** - AI response engine (Groq/HuggingFace)
- **login.html** - Professional login page with OAuth
- **privacy-policy.html** - Required for Facebook App

### Configuration:
- **package.json** - Node.js dependencies
- **business-info.json** - Your business settings
- **ai-settings.json** - AI configuration
- **bookings.json** - Booking data store

### Setup Scripts:
- **setup-instagram-webhook.js** - Instagram webhook registration
- **start-replai.sh** - Start both ngrok and server
- **start-with-ngrok.sh** - Alternative startup script

### Testing:
- **test-instagram-oauth.html** - Test Instagram OAuth
- **test-login.html** - Test login functionality

---

## 🗑️ Deleted (80+ files):
- All "FIX-*" documentation
- All "INSTAGRAM-*" guides
- All "SETUP-*" instructions
- All status/summary files
- All backup files (.env.backup.*)
- Old test scripts
- Redundant HTML backups

---

## 🚀 How to Run REPLAI:

### Quick Start:
```bash
# Start both services
ngrok http 3000 &
node server-new.js
```

### Or use helper script:
```bash
./start-with-ngrok.sh
```

### Access:
- Public: https://cheer-pledge-lend.ngrok-free.dev
- Local: http://localhost:3000
- Login: admin@replai.com / admin123

---

## 📊 File Structure:

```
replai/
├── server-new.js          ← Backend server
├── admin-new.html         ← Frontend dashboard
├── login.html             ← Login page
├── .env                   ← Configuration
├── ai-engine-free.js      ← AI logic
├── package.json           ← Dependencies
├── business-info.json     ← Business data
├── bookings.json          ← Bookings data
└── setup-instagram-webhook.js  ← Instagram setup
```

---

## 💡 Remember:

**If you need to deploy to production:**
1. Deploy server-new.js to a cloud platform (Railway/Heroku/DigitalOcean)
2. Copy .env with your production values
3. Update redirect URIs in Facebook App settings
4. No need for ngrok in production!

**To backup your work:**
Just backup these 3 files:
1. server-new.js
2. admin-new.html  
3. .env

Everything else can be regenerated!
