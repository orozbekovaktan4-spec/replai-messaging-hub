# 🚀 START YOUR 24/7 SERVER (5 Steps)

**Goal:** Get REPLAI running 24/7 on Render.com

---

## ⚡ OPTION 1: Render.com (Best for 24/7)

### Step 1: Push Code to GitHub (2 minutes)

```bash
cd /Users/ak/replai

# Add all files
git add .

# Commit
git commit -m "Ready for 24/7 deployment"

# Push
git push origin main
```

---

### Step 2: Go to Render Dashboard (1 minute)

1. Open: **https://dashboard.render.com**
2. Login with your account
3. Find your **REPLAI** service
4. Click on it

---

### Step 3: Verify Settings (2 minutes)

#### A) Check Environment Variables (Environment tab)

Make sure these are set:
```
AI_PROVIDER=groq
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
INSTAGRAM_ACCESS_TOKEN=IGAANhnuGXSTBBZAFluNmtlNmlzZAFhVeUdXYUNpdTdQOHdkVFNCcXVremdhdVpKNjJSWFFoS2M5SGVCb1FaWWZAubjZAvNWJwaHlKWEtYYkdxTlRNNG5aX3J6bW1fOTVIMURJTDV6XzNLTDdxa2Vnd2kxMFRZAMGtzOVZAWWjV0ejV4TQZDZD
INSTAGRAM_BUSINESS_ACCOUNT_ID=27973124595617787
INSTAGRAM_USERNAME=akt4n.o
TELEGRAM_BOT_TOKEN=8324920431:AAFduCXo_L8146XM9Nawx7ZIqlXgAGgaUpM
```

#### B) Check Build Settings (Settings tab)

```
Build Command: npm install && npx prisma generate
Start Command: npm start
```

---

### Step 4: Deploy! (3 minutes)

1. Click **"Manual Deploy"** button (top right)
2. Select **"main"** branch  
3. Click **"Deploy"**
4. Watch **"Logs"** tab - you'll see:
   ```
   Installing dependencies...
   Running prisma generate...
   ✅ Server running at: http://0.0.0.0:3000
   ```

---

### Step 5: Test It! (1 minute)

1. Copy your Render URL: `https://YOUR-APP.onrender.com`
2. Test health check:
   ```bash
   curl https://YOUR-APP.onrender.com/api/health
   ```
3. Should return: `OK`

4. Open in browser: `https://YOUR-APP.onrender.com`
5. Login page should appear!

---

## ✅ Update Webhooks (Important!)

### Instagram/Facebook:
1. Go to: https://developers.facebook.com/apps/2031381430802139/webhooks/
2. Update Callback URL: `https://YOUR-APP.onrender.com/webhook/instagram`
3. Verify Token: `replai_secure_token_2026`
4. Click **"Verify and Save"**

### Telegram:
```bash
curl -X POST "https://api.telegram.org/bot8324920431:AAFduCXo_L8146XM9Nawx7ZIqlXgAGgaUpM/setWebhook" \
  -d "url=https://YOUR-APP.onrender.com/webhook/telegram"
```

---

## 🎉 Done! Your Server is Now 24/7!

✅ **What works now:**
- Server runs 24/7 automatically
- Auto-restarts if crashes
- Instagram messages work
- Telegram messages work
- Admin panel accessible
- Database persists

⚠️ **Free tier limitation:**
- Sleeps after 15 minutes of inactivity
- Takes ~30 seconds to wake up on first request

💰 **Solution:** Upgrade to Starter ($7/month) for always-on server

---

## ⚡ OPTION 2: Keep Running Locally (Not 24/7)

### Install PM2:
```bash
npm install -g pm2
```

### Start Server:
```bash
cd /Users/ak/replai
pm2 start server-new.js --name replai
pm2 save
```

### Useful Commands:
```bash
pm2 status        # Check status
pm2 logs replai   # View logs
pm2 restart replai # Restart
pm2 stop replai   # Stop
```

**Downsides:**
- ❌ Your Mac must stay on 24/7
- ❌ No SSL certificate
- ❌ Requires ngrok for webhooks
- ❌ Not production-ready

---

## 📊 Monitor Your Server

### Render Dashboard:
- **Logs** tab: Real-time logs
- **Metrics** tab: CPU, memory usage
- **Events** tab: Deployment history

### Setup Email Alerts:
1. Settings → Notifications
2. Add your email
3. Get alerted if server goes down!

---

## 🐛 Troubleshooting

### "Module not found" error?
```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Database not working?
- SQLite will auto-create on first run
- Just wait 2-3 minutes after deployment

### Instagram webhooks not working?
1. Check webhook URL in Facebook Developer Console
2. Make sure server is running (`/api/health` returns OK)
3. Verify token must match exactly

---

## 💰 Pricing

### Render.com:
- **Free:** 750 hours/month, sleeps after 15 min
- **Starter ($7/mo):** Always on, 1 GB RAM ⭐ **Recommended**
- **Pro ($25/mo):** 2 GB RAM, autoscaling

### Total Cost for Production:
```
Render Starter: $7/month
Supabase: $0 (free tier)
──────────────────────────
Total: $7/month for professional 24/7 infrastructure!
```

---

## ✅ Final Checklist

- [ ] Code pushed to GitHub
- [ ] Render service deployed
- [ ] `/api/health` returns OK
- [ ] Login page works
- [ ] Instagram webhooks updated
- [ ] Telegram webhooks updated
- [ ] Tested Instagram message
- [ ] Consider upgrading to $7/month plan

---

## 🎯 You're Live!

Your REPLAI server is now:
- ✅ Running 24/7
- ✅ Accessible from anywhere
- ✅ Handling Instagram messages
- ✅ Ready for customers!

**URL:** `https://YOUR-APP.onrender.com`

**Next step:** Start adding customers! 🎉

---

**Need help?** Check logs in Render dashboard or refer to DEPLOY-24-7.md for full details.

Let's make Kyrgyzstan's businesses AI-powered! 🇰🇬💬🤖
