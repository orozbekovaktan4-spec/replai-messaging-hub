# 🤖 REPLAI - AI Messaging Hub

Multi-platform AI chatbot that responds to customers on Instagram, Telegram, and WhatsApp.

## 📁 Files in this folder:

### Core Files (Required):
- **server-new.js** - Main server (handles admin panel, webhooks, platform connections)
- **admin-new.html** - Admin panel interface (manage business, connect platforms, view logs)
- **ai-engine-free.js** - AI response engine (uses Groq API - FREE)
- **business-info.json** - Your business information (products, hours, FAQs)
- **package.json** - Node.js dependencies
- **.env** - API keys and configuration (KEEP SECRET!)

### Deployment Files:
- **railway.json** - Railway deployment configuration

## 🚀 How to Run Locally:

```bash
cd ~/replai
npm install
node server-new.js
```

Then open: **http://localhost:3000**

## 🌐 How to Deploy Online:

### Option 1: Railway (Current)
1. Push to GitHub
2. Connect to Railway
3. Add environment variables
4. Deploy

Your URL: https://replai-messaging-hub-production.up.railway.app

### Option 2: Render.com
1. Go to https://render.com
2. Connect GitHub repo
3. Deploy as Web Service

## 🔧 Configuration:

Edit `.env` file:
```
AI_PROVIDER=groq
GROQ_API_KEY=your_key_here
PORT=3000
```

## 📱 Connect Platforms:

1. Open admin panel
2. Go to "Connect Platforms"
3. Add your tokens:
   - Telegram Bot Token
   - Instagram Access Token
   - WhatsApp Access Token

## 🌍 Languages Supported:

Admin Panel:
- 🇬🇧 English
- 🇷🇺 Russian (Русский)
- 🇰🇬 Kyrgyz (Кыргызча)

AI Responses:
- Auto-detect customer language
- Or set specific language in AI Settings

## 💰 Cost:

**$0/month** - Uses free Groq API

## 📞 Support:

Created: May 7, 2026
Version: 1.0
