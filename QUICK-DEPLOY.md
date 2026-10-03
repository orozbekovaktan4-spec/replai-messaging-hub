# ⚡ Quick Cloud Deployment

## 🎯 Your Fastest Options

You already have git configured! Here are your 3 fastest ways to get REPLAI in the cloud:

---

## 🥇 Option 1: Railway (Recommended - 5 minutes)

### **Why Railway?**
- ✅ You already have `railway.json` configured
- ✅ $5/month free credit
- ✅ Auto-deploys on git push
- ✅ Easy environment variables

### **Quick Steps:**

1. **Go to:** https://railway.app
2. **Click:** "Start a New Project" → "Deploy from GitHub repo"
3. **Connect:** Your GitHub account and select `replai` repo
4. **Add Environment Variables** (click Variables tab):
   ```
   GROQ_API_KEY=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
   AI_PROVIDER=groq
   PORT=3000
   INSTAGRAM_ACCESS_TOKEN=EAAc3h9iWFtsBR3n25GAYiZBiHVFhkR85a2WvOJxXXZALAFe0OQSTKW...
   INSTAGRAM_BUSINESS_ACCOUNT_ID=17841442927870144
   INSTAGRAM_USERNAME=akt4n.o
   ```
   (Copy all from your `.env` file)

5. **Deploy!** Railway will build and start your app

6. **Get URL:** Copy the URL (e.g., `https://replai-production.up.railway.app`)

7. **Update webhooks:** Use your new Railway URL for Instagram webhook

**Done!** 🎉

---

## 🥈 Option 2: Render (100% Free Forever)

### **Why Render?**
- ✅ Completely FREE (no credit card)
- ✅ Auto-deploys from GitHub
- ✅ Never sleeps on paid plan, sleeps after inactivity on free

### **Quick Steps:**

1. **Go to:** https://render.com
2. **Sign up** (free, no credit card needed)
3. **New +** → **Web Service**
4. **Connect GitHub** → Select `replai` repo
5. **Configure:**
   - Name: `replai`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**

6. **Add Environment Variables** (all from your `.env`)

7. **Create Web Service** - Render deploys automatically

8. **Get URL:** Like `https://replai.onrender.com`

**Done!** 🎉

---

## 🥉 Option 3: Railway CLI (For Developers)

### **Ultra-Fast Deployment:**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize in your project
cd /Users/ak/replai
railway init

# 4. Deploy
railway up

# 5. Set environment variables (do this for each one)
railway variables set GROQ_API_KEY=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
railway variables set AI_PROVIDER=groq
railway variables set INSTAGRAM_ACCESS_TOKEN=EAAc3h...
railway variables set INSTAGRAM_BUSINESS_ACCOUNT_ID=17841442927870144
railway variables set INSTAGRAM_USERNAME=akt4n.o
# ... add all other variables from .env

# 6. Get your URL
railway open
```

**Done in 5 minutes!** ⚡

---

## 📋 Environment Variables You Need to Set

Copy these from your `.env` file to the cloud platform:

### **Required:**
```bash
GROQ_API_KEY=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
AI_PROVIDER=groq
PORT=3000
```

### **Instagram (Your Connected Account):**
```bash
INSTAGRAM_ENABLED=true
INSTAGRAM_ACCESS_TOKEN=EAAc3h9iWFtsBR3n25GAYiZBiHVFhkR85a2WvOJxXXZALAFe0OQSTKW...
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841442927870144
INSTAGRAM_USERNAME=akt4n.o
INSTAGRAM_APP_ID=2031381430802139
INSTAGRAM_APP_SECRET=234f81496ba2c73b96eb49723b0acc07
```

### **Twilio WhatsApp:**
```bash
TWILIO_ACCOUNT_SID=AC1f6b591277ac385648a48676306064f9
TWILIO_AUTH_TOKEN=2093b15ba849fd1871dd19ed3526c7e8
TWILIO_PHONE_NUMBER=+14155238886
```

### **Optional - Google OAuth:**
```bash
GOOGLE_CLIENT_ID=905391892206-84eas1ccsundodevspaaufqj07l9bnlf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://YOUR-RAILWAY-URL/api/auth/google/callback
```

**⚠️ Important:** Update `GOOGLE_REDIRECT_URI` with your actual deployment URL!

---

## 🔄 After Deployment

### **1. Update Instagram Webhook:**

1. Go to: https://developers.facebook.com/apps/2031381430802139/messenger/settings/
2. Update Callback URL to: `https://YOUR-APP-URL/webhook/instagram`
3. Verify and Save

### **2. Update Google OAuth (if using):**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your OAuth client
3. Add redirect URI: `https://YOUR-APP-URL/api/auth/google/callback`
4. Save

### **3. Test Your Deployment:**

```bash
# Check health
curl https://YOUR-APP-URL/api/health

# Should return: OK

# Check Instagram status
curl https://YOUR-APP-URL/api/admin/instagram/status

# Open in browser
open https://YOUR-APP-URL
```

---

## ✅ Quick Checklist

- [ ] Choose platform (Railway or Render)
- [ ] Create account and connect GitHub
- [ ] Deploy from repository
- [ ] Add all environment variables
- [ ] Wait for deployment to complete
- [ ] Get your public URL
- [ ] Update Instagram webhook URL
- [ ] Update Google OAuth redirect (if using)
- [ ] Test: Send message to @akt4n.o
- [ ] Check: Login at your-url.com
- [ ] Celebrate! 🎉

---

## 🚀 My Recommendation

**Use Railway** because:
1. You already have `railway.json` ✅
2. Simple web UI (no CLI needed)
3. $5/month credit is enough for your project
4. Auto-deploys on git push
5. Easy to manage environment variables

**Time to deploy:** 5-10 minutes  
**Cost:** FREE (with $5 credit)

---

## 💡 Pro Tips

### **Don't Commit Secrets:**
Your `.gitignore` already protects:
- `.env` ✅
- `users.json` ✅
- `sessions.json` ✅
- `bookings.json` ✅

### **Update Code:**
```bash
# Make changes
git add .
git commit -m "Update"
git push

# Railway/Render auto-deploys! 🚀
```

### **View Logs:**
- Railway: Dashboard → Deployments → Logs
- Render: Dashboard → Logs tab

### **Custom Domain (Optional):**
Both Railway and Render let you add custom domains like `replai.com`

---

## 🎯 Ready to Deploy?

**I can help you with:**

1. ✅ Preparing environment variables
2. ✅ Setting up Railway/Render account
3. ✅ Deploying your app
4. ✅ Updating webhook URLs
5. ✅ Testing the deployment

**Want to start now?** Tell me which platform you prefer:
- **Railway** (recommended, $5/month credit)
- **Render** (100% free forever)
- **Something else**

Let's get REPLAI in the cloud! ☁️🚀
