# 📸 Instagram Connection Fix Guide

Your Instagram token has expired. Follow these steps to reconnect.

---

## 🚀 Quick Fix (Recommended)

### Step 1: Get a New Token from Meta

1. **Open Facebook Developer Console:**
   - Go to: https://developers.facebook.com/apps/2031381430802139/
   - Login with the Facebook account that manages @akt4n.o

2. **Navigate to Instagram Settings:**
   - Click **"Tools"** in the left sidebar
   - Then click **"Graph API Explorer"**

3. **Generate Token:**
   - In the dropdown, select your Instagram Business account
   - Click **"Generate Access Token"**
   - Grant all requested permissions
   - **Copy the token** (starts with "EAA...")

### Step 2: Run the Helper Script

Open terminal in the replai folder and run:

```bash
./refresh-instagram-token.sh
```

When prompted, **paste the token** you copied from Step 1.

The script will:
- ✅ Exchange your short-lived token for a long-lived token (60 days)
- ✅ Automatically update your .env file
- ✅ Show you when the token expires

### Step 3: Restart Server

```bash
npm start
```

### Step 4: Test

Send a DM to @akt4n.o from another Instagram account. The AI should respond!

---

## 🔧 Manual Method (If Script Fails)

### 1. Get Short-Lived Token

Follow Step 1 from Quick Fix above.

### 2. Exchange for Long-Lived Token

Run this command (replace `YOUR_TOKEN` with the token from Step 1):

```bash
curl "https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=234f81496ba2c73b96eb49723b0acc07&access_token=YOUR_TOKEN"
```

### 3. Copy the New Token

Copy the `access_token` value from the response.

### 4. Update .env File

Open `.env` file and update:

```
INSTAGRAM_ACCESS_TOKEN=<paste_new_token_here>
INSTAGRAM_TOKEN_EXPIRES_AT=2026-09-02
```

### 5. Restart Server

```bash
npm start
```

---

## 📋 Troubleshooting

**Problem:** "Invalid OAuth access token"
- **Solution:** The token expired. Get a new one from Step 1.

**Problem:** "Cannot parse access token"
- **Solution:** Make sure you copied the entire token (no spaces or line breaks).

**Problem:** Script says "error exchanging token"
- **Solution:** 
  1. Check your internet connection
  2. Verify the token is fresh (not older than 1 hour)
  3. Get a new token and try again

**Problem:** Instagram still not responding after fixing token
- **Solution:**
  1. Check if @akt4n.o is a Business account (not Creator or Personal)
  2. Verify webhooks are set up in Facebook Developer Console
  3. Check that the Facebook Page is connected to the Instagram account

---

## 🔐 Required Permissions

Make sure your app has these permissions enabled:
- `instagram_basic`
- `instagram_manage_messages`
- `instagram_manage_comments`
- `pages_show_list`
- `pages_read_engagement`

---

## ⏰ Token Lifespan

- **Short-lived token**: 1 hour (from Developer Console)
- **Long-lived token**: 60 days (after exchange)
- **Recommendation**: Set a reminder to refresh the token every 50 days

---

## 🆘 Need Help?

If you're still having issues:
1. Check the server logs for error messages
2. Test the token manually: https://developers.facebook.com/tools/debug/accesstoken/
3. Verify your Instagram account is properly connected to a Facebook Page

---

**Current Instagram Account:** @akt4n.o  
**App ID:** 2031381430802139  
**Webhook URL:** https://cheer-pledge-lend.ngrok-free.dev/webhook/instagram
