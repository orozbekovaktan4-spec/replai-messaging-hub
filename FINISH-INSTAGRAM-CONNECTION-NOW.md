# 🎯 Finish Instagram Connection - Action Plan

## Current Status

### ✅ What's Working:
1. **Instagram OAuth Flow** - Complete code in `server-new.js` and `connection-manager.js`
2. **Access Token** - You have a token: `IGAANhnuGXSTBBZAFluNmtlNmlzZAFh...`
3. **Business Account** - Connected: @akt4n.o (ID: 27973124595617787)
4. **API Routes** - All endpoints exist (/api/admin/instagram/oauth/*, /api/instagram/webhook)
5. **Webhook Handler** - Code ready to receive Instagram messages
6. **Admin Panel** - UI for connecting Instagram with token or OAuth

### ❌ What's NOT Working:
1. **Webhooks Not Receiving Messages** - Need public URL (ngrok expired)
2. **Token May Be Expired** - Long-lived tokens expire after 60 days
3. **App Secret Wrong** - `.env` has placeholder: `your_instagram_app_secret_here`
4. **Redirect URI Mismatch** - Multiple different URIs in `.env`
5. **Not Tested End-to-End** - Need to verify full flow works

---

## 🔧 STEP 1: Fix Environment Variables

Current `.env` has problems:

```bash
# PROBLEM 1: Wrong App Secret
INSTAGRAM_APP_SECRET=your_instagram_app_secret_here  # ❌ PLACEHOLDER

# PROBLEM 2: Multiple Redirect URIs (conflicting)
INSTAGRAM_REDIRECT_URI=https://replai-xc95.onrender.com/api/instagram/oauth-callback
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/admin/instagram/oauth/callback
FACEBOOK_REDIRECT_URI=https://cheer-pledge-lend.ngrok-free.dev/api/admin/instagram/oauth/callback

# PROBLEM 3: Old ngrok URL
# cheer-pledge-lend.ngrok-free.dev - EXPIRED
```

### Action Required:

1. **Get Real Instagram App Secret:**
   - Go to: https://developers.facebook.com/apps/2031381430802139/settings/basic/
   - Copy the real `App Secret`
   - Replace placeholder in `.env`

2. **Fix Redirect URI:**
   - Choose ONE redirect URI
   - For production: `https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback`
   - Update in Meta App Dashboard AND `.env`

3. **Update Webhook URL:**
   - For production: `https://replai-xc95.onrender.com/api/instagram/webhook`
   - Set Verify Token: `replai_instagram_webhook_2024`

---

## 🔧 STEP 2: Test Instagram Connection Locally

Before deploying, test the full flow:

### 1. Start Local Server with ngrok:

```bash
# Terminal 1: Start your server
cd /Users/ak/replai
npm start

# Terminal 2: Start ngrok
ngrok http 3000
# Copy the URL, e.g., https://abc123.ngrok.io
```

### 2. Update Meta App Dashboard:

**OAuth Settings:**
- Valid OAuth Redirect URIs: `https://abc123.ngrok.io/api/admin/instagram/oauth/callback`

**Webhook Settings:**
- Callback URL: `https://abc123.ngrok.io/api/instagram/webhook`
- Verify Token: `replai_instagram_webhook_2024`
- Subscribe to: `messages`

### 3. Test OAuth Flow:

```bash
# Open in browser:
https://abc123.ngrok.io/admin

# Click "Connect Instagram" button
# Should redirect to Facebook login
# Grant permissions
# Should redirect back with success
```

### 4. Test Receiving Messages:

```bash
# Send a DM to @akt4n.o on Instagram
# Check server logs for webhook event
# Check if AI responds automatically
```

---

## 🚀 STEP 3: Deploy to Production (Render)

Once local testing works:

### 1. Update `.env` for Production:

```bash
# Instagram OAuth
INSTAGRAM_APP_ID=2031381430802139
INSTAGRAM_APP_SECRET=[GET FROM META DASHBOARD]
INSTAGRAM_REDIRECT_URI=https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback

# Facebook OAuth (for Instagram)
FACEBOOK_APP_ID=2031381430802139
FACEBOOK_APP_SECRET=[SAME AS INSTAGRAM]
FACEBOOK_REDIRECT_URI=https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback

# Webhook
WEBHOOK_VERIFY_TOKEN=replai_instagram_webhook_2024
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=replai_instagram_webhook_2024
```

### 2. Set Environment Variables in Render:

Go to: https://dashboard.render.com/web/srv-[your-service-id]/env

Add:
- `INSTAGRAM_APP_SECRET`
- `FACEBOOK_APP_SECRET`
- All other Instagram-related vars

### 3. Update Meta App Dashboard for Production:

**OAuth Redirect URIs:**
```
https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback
```

**Webhook URL:**
```
https://replai-xc95.onrender.com/api/instagram/webhook
```

**Verify Token:**
```
replai_instagram_webhook_2024
```

### 4. Deploy:

```bash
cd /Users/ak/replai
git add .env
git commit -m "✅ Configure Instagram OAuth for production"
git push origin main
```

Wait 2-3 minutes for Render to deploy.

### 5. Test on Production:

```bash
# 1. Open admin panel
https://replai-xc95.onrender.com/admin

# 2. Click "Connect Instagram"
# 3. Complete OAuth flow
# 4. Send DM to @akt4n.o
# 5. Verify auto-reply works
```

---

## 🎯 STEP 4: What Needs to Be Built

If the OAuth flow works but messages don't respond, check:

### Message Handler (`server-new.js` line ~3474):

```javascript
app.post('/api/instagram/webhook', async (req, res) => {
  res.sendStatus(200); // Respond immediately
  
  // TODO: Process Instagram message
  // 1. Extract message text
  // 2. Get business context
  // 3. Call AI engine
  // 4. Send reply via Instagram API
});
```

**Check if this logic exists and works!**

### AI Response Flow:

1. **Webhook receives message** → Extract sender ID & text
2. **Find business** → Which REPLAI business owns this Instagram account?
3. **Get business context** → Services, prices, language preference
4. **Call AI** → Generate response using GROQ
5. **Send reply** → Use Instagram Graph API to send message back

### Required API Call to Send Reply:

```javascript
POST https://graph.facebook.com/v21.0/me/messages
Content-Type: application/json

{
  "recipient": {"id": "SENDER_ID"},
  "message": {"text": "AI generated reply"}
}
```

**Token needed:** Long-lived page access token

---

## 🔍 STEP 5: Debug Checklist

If something doesn't work:

### OAuth Not Working?
- [ ] App Secret is correct (not placeholder)
- [ ] Redirect URI matches in `.env` AND Meta Dashboard
- [ ] Instagram Login is enabled in Meta App
- [ ] App is not in Development Mode (or test user added)

### Webhook Not Receiving?
- [ ] Webhook URL is public (not localhost)
- [ ] Verify Token matches exactly
- [ ] Subscribed to `messages` field
- [ ] Instagram account has Pages Public Content Access

### Messages Not Getting Replies?
- [ ] Check server logs for webhook events
- [ ] Verify GROQ_API_KEY is set
- [ ] Check message handler processes correctly
- [ ] Verify reply API call uses correct token

### Token Expired?
- [ ] Refresh long-lived token (valid 60 days)
- [ ] Use refresh endpoint: `/api/admin/instagram/oauth/refresh`
- [ ] Or reconnect via OAuth

---

## 📝 Summary

**Immediate Actions:**

1. ✅ Get real Instagram App Secret from Meta Dashboard
2. ✅ Fix `.env` redirect URI (choose ONE)
3. ✅ Test OAuth flow locally with ngrok
4. ✅ Verify webhook receives messages
5. ✅ Check AI response handler works
6. ✅ Deploy to production
7. ✅ Update Meta Dashboard for production URLs
8. ✅ Test end-to-end on production

**Goal:** User sends DM to @akt4n.o → AI responds automatically

---

## 🚀 Let's Start!

**Which step do you want to tackle first?**

A. Fix `.env` variables (get App Secret, fix redirect URI)
B. Test OAuth flow locally with ngrok
C. Check if message handler code exists
D. Deploy to production and configure Meta Dashboard
E. Something else?

Let me know and I'll help you complete it! 🔥
