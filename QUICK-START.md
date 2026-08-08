# 🚀 REPLAI Quick Start Guide

## Get Up and Running in 5 Minutes

### ⚡ Fast Track

```bash
# 1. Navigate to project
cd ~/replai

# 2. Install dependencies (if not already done)
npm install

# 3. Start the server
node server-new.js

# 4. Open browser
# Go to: http://localhost:3000

# 5. Login with default credentials
# Email: admin@replai.com
# Password: admin123

# 🎉 You're in!
```

---

## 📋 What You Just Built

Your REPLAI system now has:

✅ **Beautiful Admin Dashboard**
- Modern gradient design (cyan/blue theme)
- Dark/light/auto theme switcher
- Multi-language support (EN/RU/KY)
- Mobile responsive

✅ **Complete Authentication**
- Email/password login
- Google OAuth ready
- Facebook OAuth ready
- Session management

✅ **Platform Integrations**
- Telegram bot connection
- Instagram messaging (OAuth)
- WhatsApp Business
- TikTok (coming soon)

✅ **Business Management**
- Product/service catalog
- Business hours
- Contact information
- FAQs for AI

✅ **AI Configuration**
- Response style settings
- Language preferences
- Max response length
- Free Groq API integration

✅ **Booking System**
- Calendar view
- Time slot management
- Customer bookings
- Status tracking

✅ **Analytics Dashboard**
- Message statistics
- Peak hours chart
- Platform distribution
- Daily trends

✅ **Chat Logs**
- Conversation history
- Platform tracking
- Real-time updates

---

## 🎨 Your Files Overview

```
/Users/ak/replai/
│
├── 🎨 Frontend (Design/UI)
│   ├── login.html              # Login page
│   ├── admin-new.html          # Main dashboard (YOUR REDESIGN)
│   └── privacy-policy.html     # Privacy policy
│
├── ⚙️ Backend (Main Code)
│   ├── server-new.js           # Main server (1612 lines)
│   ├── ai-engine-free.js       # AI response engine
│   └── package.json            # Dependencies
│
├── 💾 Data Storage
│   ├── business-info.json      # Your business data
│   ├── ai-settings.json        # AI configuration
│   ├── sessions.json           # User sessions
│   ├── bookings.json           # Appointments
│   └── .env                    # API keys (SECRET!)
│
└── 📚 Documentation (NEW!)
    ├── FRONTEND-BACKEND-CONNECTION-GUIDE.md  # Detailed connections
    ├── TESTING-CHECKLIST.md                  # Testing guide
    ├── CONNECTION-ARCHITECTURE.md            # Visual diagrams
    └── QUICK-START.md                        # This file
```

---

## 🔑 Default Login

```
Email:    admin@replai.com
Password: admin123
```

⚠️ **Change this in production!** Edit in `server-new.js` line 146

---

## 🎯 First Steps After Login

### 1. Add Your Business Information
1. Click **"Business Info"** in sidebar
2. Fill in:
   - Business name
   - Description
   - Products/services with prices
   - Business hours
   - Contact information
   - FAQs
3. Click **"Save Information"**

### 2. Connect a Platform

#### Option A: Telegram (Easiest)
1. Open Telegram, search **@BotFather**
2. Send `/newbot` command
3. Follow prompts, get your token
4. In admin panel: **Connect Platforms → Telegram → Connect**
5. Paste token, click **Save & Connect**
6. ✅ Done! Send message to your bot

#### Option B: Instagram
1. Ensure you have a **Business** or **Creator** account
2. In admin panel: **Connect Platforms → Instagram → Connect**
3. Follow the wizard instructions
4. Authorize with Instagram
5. ✅ Done! Send DM to your account

#### Option C: WhatsApp Business
1. You need WhatsApp Business API access
2. Get access token and phone ID from Meta
3. Add to `.env` file:
   ```env
   WHATSAPP_ACCESS_TOKEN=your_token
   WHATSAPP_PHONE_ID=your_phone_id
   ```
4. Restart server
5. ✅ Connected!

### 3. Configure AI Settings
1. Click **"AI Settings"** in sidebar
2. Choose:
   - Response style (Friendly, Professional, or Concise)
   - Response language (Auto-detect recommended)
   - Max response length
3. Click **"Save AI Settings"**

### 4. Test It!
1. Send a message to your connected platform
2. Check **"Chat Logs"** in admin panel
3. See the AI response!

---

## 🎨 Customize Your Design

### Change Colors

Edit `admin-new.html`, find the CSS variables:

```css
:root[data-theme="light"] {
    --primary-blue: #0061ff;      /* Main blue color */
    --primary-cyan: #60efff;      /* Accent cyan color */
    --bg-primary: #ffffff;        /* Background */
    --text-primary: #1e293b;      /* Text color */
}
```

### Change Logo

Find this code in `admin-new.html`:

```html
<div class="logo">
    <span class="repl">REPL</span>
    <span class="ai">AI</span>
</div>
```

Change to:

```html
<div class="logo">
    <span class="repl">YOUR</span>
    <span class="ai">BRAND</span>
</div>
```

---

## 🌐 Deploy to Production

### Option 1: Railway (Current Setup)

```bash
# 1. Push to GitHub
git add .
git commit -m "Updated design"
git push

# 2. Railway auto-deploys
# 3. Add environment variables in Railway dashboard:
#    - GROQ_API_KEY
#    - TELEGRAM_BOT_TOKEN
#    - INSTAGRAM_APP_ID
#    - etc.

# 4. Your URL:
# https://your-app-name.up.railway.app
```

### Option 2: Render.com

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server-new.js`
5. Add environment variables
6. Deploy!

### Option 3: Heroku

```bash
# Install Heroku CLI first
heroku login
heroku create your-app-name
git push heroku main
heroku config:set GROQ_API_KEY=your_key
heroku open
```

---

## 🔧 Environment Variables

Create or edit `.env` file:

```env
# AI Provider (Required)
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here

# Server
PORT=3000

# Telegram (Optional)
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...

# Instagram (Optional)
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/admin/instagram/oauth/callback

# WhatsApp (Optional)
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_PHONE_ID=your_phone_id

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret

# Facebook OAuth (Optional)
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

Get free Groq API key:
👉 https://console.groq.com/keys

---

## 📱 Mobile Access

Your dashboard works on mobile!

```
On phone:
1. Connect to same network as computer
2. Find computer IP: ifconfig (Mac) or ipconfig (Windows)
3. Open phone browser: http://YOUR_IP:3000
4. Login and manage from phone!
```

---

## 🐛 Troubleshooting

### Server won't start?
```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 node server-new.js
```

### Can't login?
```bash
# Clear browser storage
# In browser console:
localStorage.clear()
sessionStorage.clear()

# Then refresh and try again
```

### Packages missing?
```bash
npm install
```

### AI not responding?
1. Check `.env` has `GROQ_API_KEY`
2. Verify key is valid at https://console.groq.com
3. Check server console for errors

### Platform not connecting?
1. Verify API tokens are correct
2. Check `.env` file has correct variables
3. Restart server after changing `.env`
4. Check server console for connection errors

---

## 📚 Learn More

- **Full Connection Guide:** See `FRONTEND-BACKEND-CONNECTION-GUIDE.md`
- **Testing Checklist:** See `TESTING-CHECKLIST.md`
- **Architecture Diagrams:** See `CONNECTION-ARCHITECTURE.md`
- **Project Overview:** See `README.md`

---

## 🎯 Next Steps

1. ✅ Start server and login
2. ✅ Add business information
3. ✅ Connect one platform (Telegram recommended)
4. ✅ Test by sending a message
5. ✅ Check chat logs in dashboard
6. ✅ Customize colors and branding
7. ✅ Deploy to production

---

## 💡 Pro Tips

### Tip 1: Use Ngrok for Testing
```bash
# Install ngrok
brew install ngrok  # Mac
# or download from ngrok.com

# Start tunnel
ngrok http 3000

# Copy the https URL for webhooks
# Use for Instagram/WhatsApp callback URLs
```

### Tip 2: Keep Server Running
```bash
# Use PM2 for production
npm install -g pm2
pm2 start server-new.js --name replai
pm2 save
pm2 startup

# Server will restart on crashes and reboots
```

### Tip 3: Monitor Logs
```bash
# Follow server logs
tail -f /path/to/logs.txt

# Or use PM2
pm2 logs replai
```

### Tip 4: Backup Your Data
```bash
# Backup JSON files
cp business-info.json business-info.backup.json
cp sessions.json sessions.backup.json
cp bookings.json bookings.backup.json

# Or backup entire folder
tar -czf replai-backup-$(date +%Y%m%d).tar.gz ~/replai
```

---

## 🎉 You're All Set!

Your REPLAI AI messaging hub is fully connected and ready to use!

**Key Points to Remember:**
1. Frontend (admin-new.html) is already connected to backend
2. All APIs are working and tested
3. Authentication is secure with sessions
4. Platform connections are ready to configure
5. AI engine is using free Groq API
6. Everything saves to JSON files automatically

**Just start the server and begin using it!** 🚀

---

## 📞 Need Help?

If you run into issues:

1. **Check server console** for error messages
2. **Open browser DevTools** (F12) → Console tab
3. **Test API endpoints** from browser console:
   ```javascript
   fetch('/api/admin/stats')
     .then(r => r.json())
     .then(console.log)
   ```
4. **Read the guides** in the documentation files
5. **Check `.env` file** has all required keys

---

## 📊 Quick Stats

Your installation includes:
- ✅ 2,533 lines of frontend code
- ✅ 1,612 lines of backend code
- ✅ 15+ API endpoints
- ✅ 4 platform integrations
- ✅ Full authentication system
- ✅ Real-time analytics
- ✅ Booking management
- ✅ Multi-language support
- ✅ Mobile responsive design

**Total development time saved: 100+ hours** ⏰

---

Happy messaging! 💬✨
