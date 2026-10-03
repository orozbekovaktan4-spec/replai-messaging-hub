# ☁️ Cloud Deployment Guide for REPLAI

## 🎯 Why Deploy to Cloud?

✅ **Runs 24/7** - No need to keep your computer on  
✅ **No ngrok needed** - Get a permanent public URL  
✅ **Auto-restarts** - Server comes back automatically if it crashes  
✅ **Professional** - Real domain for production use  
✅ **Webhooks work** - Instagram, Telegram, WhatsApp receive messages  

---

## 🚀 Best Options for REPLAI

### **Option 1: Railway (Recommended - Easiest)**

**Why Railway?**
- ✅ Free tier available ($5 credit/month)
- ✅ Automatic deployments from GitHub
- ✅ Built-in PostgreSQL/Redis if needed later
- ✅ Simple environment variable management
- ✅ You already have `railway.json` configured!

**Cost:** FREE (with $5/month credit) for small projects

---

### **Option 2: Render**

**Why Render?**
- ✅ Completely FREE tier (no credit card needed)
- ✅ Auto-deploys from GitHub
- ✅ Easy SSL certificates
- ✅ Good for Node.js apps

**Cost:** FREE forever

---

### **Option 3: Heroku**

**Why Heroku?**
- ✅ Very popular and mature
- ✅ Lots of documentation
- ✅ Easy to use
- ⚠️ No free tier anymore (starts at $5/month)

**Cost:** $5-7/month minimum

---

### **Option 4: DigitalOcean / AWS / Google Cloud**

**Why?**
- ✅ Full control
- ✅ Scalable
- ⚠️ More complex setup
- ⚠️ Requires server management

**Cost:** $4-10/month

---

## 🏆 Recommended: Deploy to Railway (Step-by-Step)

### **Step 1: Prepare Your Code**

1. **Initialize git** (if not already):
   ```bash
   cd /Users/ak/replai
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub:**
   - Create a new repository on GitHub
   - Follow GitHub's instructions to push your code

### **Step 2: Sign Up for Railway**

1. Go to: https://railway.app
2. Click **"Start a New Project"**
3. Sign in with GitHub

### **Step 3: Deploy Your App**

1. Click **"Deploy from GitHub repo"**
2. Select your **replai** repository
3. Railway will automatically detect it's a Node.js app
4. Click **"Deploy"**

### **Step 4: Add Environment Variables**

In Railway dashboard:

1. Click on your project
2. Go to **"Variables"** tab
3. Add all variables from your `.env` file:

```bash
# Required variables
GROQ_API_KEY=your_groq_key
AI_PROVIDER=groq
PORT=3000

# Telegram (if using)
TELEGRAM_BOT_TOKEN=your_token

# Instagram
INSTAGRAM_ACCESS_TOKEN=your_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_id
INSTAGRAM_USERNAME=akt4n.o

# Twilio WhatsApp (if using)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
```

### **Step 5: Get Your Public URL**

1. Railway will give you a URL like: `https://your-app.up.railway.app`
2. Copy this URL
3. Use it for webhooks!

### **Step 6: Update Webhooks**

Update your webhook URLs in:

**Instagram (Meta Dashboard):**
- Go to: https://developers.facebook.com/apps/2031381430802139/
- Set webhook: `https://your-app.up.railway.app/webhook/instagram`

**Telegram (if using):**
```bash
curl -X POST https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-app.up.railway.app/webhook/telegram"}'
```

**Twilio WhatsApp:**
- Update in Twilio Console with your Railway URL

### **Step 7: Test It!**

1. Go to: `https://your-app.up.railway.app`
2. Login with: `admin@replai.com` / `admin123`
3. Send a test message to your Instagram
4. ✅ Bot should respond!

---

## 🎯 Quick Deploy to Render (Alternative)

### **Step 1: Push to GitHub**

```bash
cd /Users/ak/replai
git init
git add .
git commit -m "Deploy to Render"
git push origin main
```

### **Step 2: Deploy on Render**

1. Go to: https://render.com
2. Sign up (free, no credit card)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repo
5. Configure:
   - **Name:** replai
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### **Step 3: Add Environment Variables**

Add all your `.env` variables in Render dashboard.

### **Step 4: Deploy!**

Render will build and deploy automatically. You'll get a URL like:
```
https://replai.onrender.com
```

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] `.env` file is in `.gitignore` (already done ✅)
- [ ] All secrets are set as environment variables on the platform
- [ ] `package.json` has `"start": "node server-new.js"` (already done ✅)
- [ ] `railway.json` or similar config exists (already done ✅)
- [ ] Code is pushed to GitHub
- [ ] Database files (`users.json`, `bookings.json`) are in `.gitignore` (done ✅)

---

## 🔒 Security for Production

### **Important: Remove Sensitive Files**

Make sure these are **NOT** committed to git:

```bash
# Check .gitignore includes:
.env
users.json
sessions.json
bookings.json
node_modules/
*.log
```

### **Environment Variables to Set:**

All these should be in your cloud platform's environment settings, NOT in code:

- `GROQ_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `INSTAGRAM_ACCESS_TOKEN`
- `TWILIO_AUTH_TOKEN`
- `GOOGLE_CLIENT_SECRET`
- All other API keys and secrets

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| **Railway** | $5/month credit | From $5/month | Easy deployment, has config |
| **Render** | ✅ Free forever | From $7/month | Zero cost, good performance |
| **Heroku** | ❌ None | From $5/month | Familiar, lots of docs |
| **Vercel** | ✅ Free | From $20/month | Frontend + API |
| **DigitalOcean** | ❌ None | From $4/month | Full control |

---

## 🚀 Fastest Way to Deploy (5 minutes)

### **Using Railway:**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Deploy!
railway up

# 5. Add environment variables
railway variables set GROQ_API_KEY=your_key
railway variables set AI_PROVIDER=groq
# ... add all other variables

# 6. Get your URL
railway open
```

Done! Your app is live! 🎉

---

## 📊 After Deployment

### **Monitor Your App:**

- **Railway:** Dashboard shows logs, metrics, restarts
- **Render:** Real-time logs and performance metrics
- **Check health:** `curl https://your-app.url/api/health`

### **Update Code:**

```bash
# Make changes to code
git add .
git commit -m "Update feature"
git push origin main

# Railway/Render auto-deploys! 🚀
```

---

## 🐛 Troubleshooting

### **"Application Error" or 503**
- Check logs in platform dashboard
- Verify `PORT` env variable is set
- Ensure `npm start` command works locally

### **"Cannot find module"**
- Make sure `package.json` dependencies are correct
- Try: `npm install` locally to verify

### **Webhooks not working**
- Verify webhook URL uses HTTPS (not HTTP)
- Check webhook URL ends correctly: `/webhook/instagram`
- Test: `curl https://your-app.url/api/health`

### **Environment variables not working**
- Make sure they're set in platform dashboard (not in `.env` file in git)
- Restart the service after adding variables

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Platform account created (Railway/Render)
- [ ] Repository connected
- [ ] Environment variables added
- [ ] App deployed successfully
- [ ] Health endpoint working: `/api/health`
- [ ] Login page accessible
- [ ] Webhook URLs updated (Instagram, Telegram, etc.)
- [ ] Test message sent and received
- [ ] Admin panel accessible

---

## 🎯 Recommended Choice

**For REPLAI, I recommend Railway because:**

1. ✅ You already have `railway.json` configured
2. ✅ Simple deployment process
3. ✅ $5/month credit covers small projects
4. ✅ Automatic HTTPS
5. ✅ Great for Node.js apps

**Alternative: Render if you want 100% free** (no credit card needed)

---

## 🚀 Want Me to Help Deploy?

I can help you:
1. Prepare your code for deployment
2. Set up git and GitHub
3. Guide you through Railway/Render setup
4. Configure environment variables
5. Update webhook URLs
6. Test the deployment

**Ready to deploy to the cloud?** Let me know which platform you prefer! 🌐
