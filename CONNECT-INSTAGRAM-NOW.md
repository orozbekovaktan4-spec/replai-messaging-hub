# 🚀 Connect Instagram - Quick Start

## ✅ Good News!

Your Instagram account **@akt4n.o** is already connected to REPLAI! The configuration is complete.

---

## ⚡ What You Need to Do (5 minutes)

To receive and reply to Instagram DMs, you need to make your local server publicly accessible. Here's how:

---

## 🌐 Step 1: Install ngrok

ngrok creates a public URL for your localhost server.

**Run this command:**
```bash
brew install ngrok
```

Or download from: https://ngrok.com/download

---

## 🔗 Step 2: Start ngrok Tunnel

**Run this command:**
```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding    https://abc123xyz.ngrok.io -> http://localhost:3000
```

**Copy the https URL** (e.g., `https://abc123xyz.ngrok.io`)

---

## 🔧 Step 3: Update Instagram Webhook

1. **Go to Meta App Dashboard:**
   https://developers.facebook.com/apps/2031381430802139/messenger/settings/

2. **Find "Webhooks" section**

3. **Update Callback URL:**
   ```
   https://YOUR-NGROK-URL/webhook/instagram
   ```
   Replace `YOUR-NGROK-URL` with the URL from Step 2

4. **Verify Token:**
   - Check your `.env` file for `WEBHOOK_VERIFY_TOKEN`
   - Or use: `replai_verify_token_123`

5. **Subscribe to Fields:**
   - ✅ messages
   - ✅ messaging_postbacks

6. **Click "Verify and Save"**

---

## 🧪 Step 4: Test It!

1. **Send a message** to @akt4n.o on Instagram
   - Try: "Здравствуйте! Сколько стоит женская стрижка?"

2. **You should get an AI reply** with:
   - Service information
   - Price: 800 сом
   - Professional response in Russian

3. **Check admin panel** at http://localhost:3000/admin
   - View chat logs
   - See conversation history

---

## 🎯 What's Already Configured

✅ **Instagram Account:** @akt4n.o  
✅ **Access Token:** Valid and ready  
✅ **Business Account ID:** 17841442927870144  
✅ **Server:** Running on port 3000  
✅ **AI Engine:** GROQ configured  
✅ **Webhook Endpoint:** `/webhook/instagram` ready  

**Only missing:** Public URL (ngrok) ⚡

---

## 🔄 Alternative: Use Existing ngrok Setup

Your old ngrok URL was:
```
https://cheer-pledge-lend.ngrok-free.dev
```

But this URL has **expired**. You need to:
1. Start ngrok again to get a **new URL**
2. Update the webhook with the new URL

---

## 📱 After Setup

Once ngrok is running and webhook is configured:

### **What You Can Do:**
- ✅ Receive Instagram DMs automatically
- ✅ AI responds to customer questions
- ✅ Answer in Russian or Kyrgyz
- ✅ Provide service info and prices
- ✅ Handle booking requests
- ✅ View all chats in admin panel

### **Example Conversations:**
```
Customer: "Сколько стоит маникюр?"
Bot: "Маникюр стоит 1000 сом. Хотите записаться?"

Customer: "Yes, what are your hours?"
Bot: "We're open Monday-Saturday, 9:00-20:00. Closed Sundays."
```

---

## 🐛 Troubleshooting

### **ngrok says "command not found"**
```bash
# Install with Homebrew
brew install ngrok

# Or download from
# https://ngrok.com/download
```

### **Webhook verification failed**
- Make sure server is running: `curl http://localhost:3000/api/health`
- Check verify token matches what's in `.env`
- Ensure ngrok URL is correct (no typos)

### **Messages not being received**
- Check ngrok is still running
- Verify webhook is subscribed to "messages"
- Check server logs for errors
- Test webhook with: `curl https://YOUR-NGROK-URL/webhook/instagram`

---

## 💡 Pro Tips

1. **Keep ngrok running** while testing
2. **Free ngrok URLs change** each time you restart ngrok
3. **Paid ngrok** gives you a fixed domain
4. **For production**, deploy to Railway/Heroku instead of ngrok

---

## 🎬 Quick Commands

```bash
# Check server status
curl http://localhost:3000/api/health

# Check Instagram status
curl http://localhost:3000/api/admin/instagram/status

# Install ngrok
brew install ngrok

# Start ngrok (keep this running!)
ngrok http 3000

# In another terminal, view ngrok dashboard
open http://localhost:4040
```

---

## ✅ Setup Checklist

- [ ] Server running on port 3000
- [ ] ngrok installed
- [ ] ngrok tunnel started
- [ ] Copied ngrok public URL
- [ ] Updated webhook URL in Meta Dashboard
- [ ] Verified webhook subscription
- [ ] Tested by sending a DM
- [ ] Received AI response
- [ ] Checked chat logs in admin panel

---

**Ready to start?** Run `brew install ngrok` and let's get your Instagram bot live! 🚀
