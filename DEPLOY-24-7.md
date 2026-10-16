# 🚀 Deploy REPLAI to Run 24/7

**Goal:** Get your REPLAI server running 24/7 on Render.com with the new database

---

## ⚡ Quick Start (15 Minutes)

### Option 1: Deploy to Render.com (Recommended - Already Using It)
- ✅ Free tier available
- ✅ Automatic SSL
- ✅ Auto-restart on crash
- ✅ Easy deployment

### Option 2: Keep Running Locally (Development Only)
- Use PM2 process manager
- Your Mac must stay on 24/7
- Not recommended for production

---

## 🎯 BEST OPTION: Deploy to Render.com

### Step 1: Commit Your Code to GitHub

```bash
cd /Users/ak/replai

# Check current status
git status

# Add all new files
git add .

# Commit changes
git commit -m "✅ Database migration complete - ready for 24/7 deployment"

# Push to GitHub
git push origin main
```

If you get errors, check your GitHub remote:
```bash
git remote -v
```

---

### Step 2: Update Render.com Configuration

#### A) Go to Render Dashboard
1. Go to https://dashboard.render.com
2. Find your existing REPLAI service
3. Click on it

#### B) Update Environment Variables

Click **Environment** tab and add/update these:

```env
# Node Environment
NODE_ENV=production

# AI Provider (GROQ)
AI_PROVIDER=groq
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE

# Hugging Face (backup)
HUGGINGFACE_API_KEY=YOUR_HUGGINGFACE_KEY_HERE

# Instagram (Meta Graph API)
INSTAGRAM_ACCESS_TOKEN=IGAANhnuGXSTBBZAFluNmtlNmlzZAFhVeUdXYUNpdTdQOHdkVFNCcXVremdhdVpKNjJSWFFoS2M5SGVCb1FaWWZAubjZAvNWJwaHlKWEtYYkdxTlRNNG5aX3J6bW1fOTVIMURJTDV6XzNLTDdxa2Vnd2kxMFRZAMGtzOVZAWWjV0ejV4TQZDZD
INSTAGRAM_BUSINESS_ACCOUNT_ID=27973124595617787
INSTAGRAM_USERNAME=akt4n.o
INSTAGRAM_BOT_ENABLED=true

# Telegram
TELEGRAM_BOT_TOKEN=8324920431:AAFduCXo_L8146XM9Nawx7ZIqlXgAGgaUpM

# Twilio WhatsApp (if using)
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=AC1f6b591277ac385648a48676306064f9
TWILIO_AUTH_TOKEN=8KY4C22AG5SQUDNNFUHH6LSD
TWILIO_PHONE_NUMBER=+14155238886

# Facebook/Instagram OAuth
FACEBOOK_APP_ID=2031381430802139
FACEBOOK_APP_SECRET=234f81496ba2c73b96eb49723b0acc07

# Google OAuth
GOOGLE_CLIENT_ID=905391892206-84eas1ccsundodevspaaufqj07l9bnlf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Salebot (if using)
SALEBOT_API_TOKEN=ccb8f6b4836067052dc65499b3ca2431
SALEBOT_PROJECT_ID=806734

# WhatsApp Meta Cloud API
WHATSAPP_ACCESS_TOKEN=EAAc3h9iWFtsBSt9yLsj1oavBdqntcV6DQu96H53HQokXLUwyreOtF3wtkhkpe9cGSK8VT0QU895oV6O7BkJpq8sYfPKkDYgUVws4U6UeAZB5qwEyrql4ZConK2aoUZCY4YebqVucVAZB3iSZAwJSPrHNEbR7YZCqQkrmRRwqd23RR3q5zokvgihtIGbNb690B2b1nDsO8UowZABGhgXxuYSpvoSfTGPDcGNL9fePWZARWqZAUqUpd6TsC4U9KkYMaAHObacsq9ahp7DZBsZB1f2WeZBE5BZBWp5lVCyL27K0RzAZDZD
WHATSAPP_PHONE_ID=1179746945212557
WHATSAPP_BUSINESS_ACCOUNT_ID=1345375081023219
WEBHOOK_VERIFY_TOKEN=replai_secure_token_2026

# 🔥 NEW: Database (Optional - using SQLite for now)
# DATABASE_URL=postgresql://... (add later when switching to Supabase)
```

**Important:** Don't add `DATABASE_URL` yet - we're using SQLite which is built into the app!

#### C) Check Build Settings

In **Settings** tab, verify:
- **Build Command:** `npm install && npx prisma generate`
- **Start Command:** `npm start` or `node server-new.js`
- **Environment:** `Node`

---

### Step 3: Deploy!

#### Option A: Auto-Deploy (Recommended)
1. In Render dashboard → **Settings** → **Auto-Deploy**
2. Make sure it's **ON**
3. Every time you push to GitHub, Render auto-deploys!

#### Option B: Manual Deploy
1. Go to your service in Render
2. Click **Manual Deploy** button (top right)
3. Select `main` branch
4. Click **Deploy**

---

### Step 4: Wait for Deployment (2-3 minutes)

Watch the logs in real-time:
1. Click **Logs** tab
2. You should see:
```
Installing dependencies...
✓ Loaded 0 active session(s)
✓ [Instagram] Connected via OAuth 2.0
🤖 REPLAI Messaging Hub is starting...
✅ Server running at: http://0.0.0.0:3000
```

If you see errors, check the logs carefully!

---

### Step 5: Get Your Live URL

After deployment succeeds:
1. Your URL will be something like: `https://replai.onrender.com`
2. Copy it and test!

```bash
# Test your live server
curl https://YOUR-APP.onrender.com/api/health
```

Should return: `OK`

---

### Step 6: Update Webhook URLs

**Important:** Update your webhook URLs in Meta/Facebook/Instagram settings!

#### Instagram/Facebook Webhooks:
1. Go to https://developers.facebook.com/apps/2031381430802139/webhooks/
2. Update Callback URL to: `https://YOUR-APP.onrender.com/webhook/instagram`
3. Verify Token: `replai_secure_token_2026`

#### Telegram Webhook:
```bash
# Update Telegram webhook
curl -X POST "https://api.telegram.org/bot8324920431:AAFduCXo_L8146XM9Nawx7ZIqlXgAGgaUpM/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://YOUR-APP.onrender.com/webhook/telegram"}'
```

---

## ✅ Verification Checklist

After deployment, check these:

```bash
# 1. Health check
curl https://YOUR-APP.onrender.com/api/health
# Should return: OK

# 2. Test login page
open https://YOUR-APP.onrender.com/login

# 3. Send test Instagram DM
# Message @akt4n.o on Instagram
# Should get AI response!

# 4. Check logs in Render
# Go to Logs tab in Render dashboard
```

---

## 🔥 Database on Render (SQLite Works!)

**Good News:** SQLite database will work on Render for now!

**But know this:**
- ✅ Works perfectly for 1-10 businesses
- ⚠️ Data persists but can be lost on redeploy
- ⚠️ Not suitable for 50+ businesses

**When to switch to PostgreSQL/Supabase:**
- When you have 10+ businesses
- When you need guaranteed data persistence
- When you're ready for production scale

---

## 🚀 Switch to Supabase (When Ready)

### Step 1: Create Supabase Database
1. Go to https://supabase.com
2. Create project: `replai-production`
3. Get DATABASE_URL from Settings → Database → Connection String (URI)

### Step 2: Update Render Environment
Add to Render environment variables:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.com:5432/postgres
```

### Step 3: Update Prisma Schema
Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 4: Push Changes
```bash
git add .
git commit -m "Switch to PostgreSQL/Supabase"
git push
```

Render will auto-deploy with PostgreSQL! 🎉

---

## 🔧 Alternative: Run Locally 24/7 with PM2

If you want to keep server on your Mac:

### Install PM2
```bash
npm install -g pm2
```

### Start Server with PM2
```bash
cd /Users/ak/replai

# Start server
pm2 start server-new.js --name replai

# Save process list
pm2 save

# Setup auto-start on reboot
pm2 startup
```

### Useful PM2 Commands
```bash
# View status
pm2 status

# View logs
pm2 logs replai

# Restart
pm2 restart replai

# Stop
pm2 stop replai

# Monitor
pm2 monit
```

**Downsides:**
- ❌ Your Mac must stay on 24/7
- ❌ No SSL certificate
- ❌ Requires ngrok or similar for webhooks
- ❌ Not production-grade

---

## 📊 Monitoring Your 24/7 Server

### On Render:
1. **Logs** tab - Real-time logs
2. **Metrics** tab - CPU, memory, response time
3. **Events** tab - Deployment history

### Check Server Health:
```bash
# Every 5 minutes (add to cron)
curl https://YOUR-APP.onrender.com/api/health
```

### Email Alerts (Render):
1. Go to Settings → Notifications
2. Add your email
3. Get alerted when server goes down!

---

## 🐛 Troubleshooting

### Server won't start on Render?
**Check logs for:**
```
Module not found
```
**Solution:** Make sure `package.json` has all dependencies
```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Database errors on Render?
**Check logs for:**
```
Can't find prisma/dev.db
```
**Solution:** Prisma will create it automatically on first run. Just wait!

### Instagram webhooks not working?
**Check:**
1. Webhook URL is correct in Facebook Developer Console
2. Server is actually running (check `/api/health`)
3. Verify token matches in both places

### Render free tier sleep?
**Render free tier sleeps after 15 min of inactivity!**

**Solutions:**
1. **Upgrade to paid plan** ($7/month - always on)
2. **Use cron job** to ping every 14 minutes:
   ```bash
   # Add to crontab
   */14 * * * * curl https://YOUR-APP.onrender.com/api/health
   ```
3. **Use UptimeRobot** - Free service to ping your server

---

## 💰 Render Pricing

### Free Tier:
- ✅ 750 hours/month
- ✅ Sleeps after 15 min inactivity
- ✅ Good for testing

### Starter Plan ($7/month):
- ✅ Always on (no sleep!)
- ✅ 1 GB RAM
- ✅ Perfect for 10-50 businesses
- ✅ Recommended for production!

### Pro Plan ($25/month):
- ✅ 2 GB RAM
- ✅ Autoscaling
- ✅ For 50+ businesses

---

## ✅ Final Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render service configured
- [ ] All environment variables added
- [ ] Build command: `npm install && npx prisma generate`
- [ ] Start command: `npm start`
- [ ] Deployed successfully
- [ ] Health check passes
- [ ] Login page works
- [ ] Instagram webhooks updated
- [ ] Telegram webhooks updated
- [ ] Test Instagram message works
- [ ] Consider upgrading to paid plan ($7/mo)

---

## 🎯 Recommended Setup

**For Production (Recommended):**
```
Render.com ($7/month) + Supabase (Free)
= Always-on server + PostgreSQL database
= Professional setup for $7/month!
```

**For Development:**
```
Local (your Mac) + SQLite
= Free but not 24/7
```

---

## 🚀 Quick Deploy Commands

```bash
# 1. Commit and push
cd /Users/ak/replai
git add .
git commit -m "Ready for 24/7 deployment"
git push

# 2. Render will auto-deploy!
# Watch logs at: https://dashboard.render.com

# 3. Test deployment
curl https://YOUR-APP.onrender.com/api/health

# 4. Update webhooks
# Instagram: https://YOUR-APP.onrender.com/webhook/instagram
# Telegram: https://YOUR-APP.onrender.com/webhook/telegram

# Done! 🎉
```

---

## 📞 Need Help?

Check logs in Render dashboard → Logs tab

Common issues:
1. **"Module not found"** → Run `npm install` and commit
2. **"Port already in use"** → Ignore, Render handles ports
3. **"Database error"** → Make sure Prisma generate runs in build
4. **"Webhook not working"** → Check URL in Meta Developer Console

---

## 🎊 You're Done!

Once deployed, your REPLAI server will:
- ✅ Run 24/7 automatically
- ✅ Auto-restart if it crashes
- ✅ Handle Instagram messages
- ✅ Serve admin panel
- ✅ Work with your database
- ✅ Scale as you grow

**Cost:** $0 (free tier) or $7/month (always-on)

---

**Next step:** Deploy now and start getting customers! 🚀

Let's make Kyrgyzstan's businesses AI-powered! 🇰🇬💬🤖
