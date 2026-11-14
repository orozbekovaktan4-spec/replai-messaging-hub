# Connect White Gold Instagram - Corrected Guide

## Current Status
✅ Server running: https://replai-xc95.onrender.com  
✅ OAuth callback already configured correctly  
❌ **Webhook URL needs to be fixed in Meta**

---

## Step 1: Fix Instagram Webhook URL in Meta

### Go to Meta Developer App Webhooks
**Link**: https://developers.facebook.com/apps/2031381430802139/webhooks/

### Update the Webhook Configuration
1. Find the **Instagram** webhook subscription
2. Click **"Edit"** or **"Configure"**
3. Update these fields:

   **Callback URL** (CHANGE THIS):
   ```
   https://replai-xc95.onrender.com/api/instagram/webhook
   ```
   
   **Verify Token** (keep as is):
   ```
   replai_instagram_webhook_2024
   ```
   
   **Subscribed Fields** (keep checked):
   - ✅ `messages`
   - ✅ `messaging_postbacks`

4. Click **"Verify and Save"**
5. Meta will verify the webhook (should succeed now!)

---

## Step 2: Verify OAuth Settings (Should Already Be Correct)

### Check Facebook Login for Business
**Link**: https://developers.facebook.com/apps/2031381430802139/fb-login/settings/

Make sure this redirect URI is listed:
```
https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback
```

✅ You mentioned this is already there - perfect!

---

## Step 3: Request Advanced Access for `public_profile`

Meta mentioned you need advanced access for `public_profile`. 

### How to Request Advanced Access:
1. Go to: https://developers.facebook.com/apps/2031381430802139/app-review/permissions/
2. Find **`public_profile`** permission
3. Click **"Request Advanced Access"**
4. Fill out the form:
   - **Purpose**: "Authentication for Instagram business messaging bot"
   - **Usage**: "Required to authenticate business owners connecting their Instagram accounts"
5. Submit the request

**Note**: For testing, you can use **Standard Access** which works for:
- App admins
- App developers  
- App testers

Make sure your Instagram account is added as one of these roles.

---

## Step 4: Add Your Instagram Account as App Tester

### Go to App Roles
**Link**: https://developers.facebook.com/apps/2031381430802139/roles/roles/

### Add Testers:
1. Click **"Add Testers"**
2. Search for your Facebook account (linked to White Gold Instagram)
3. Add as **Tester**
4. Accept the invitation (check your Facebook notifications)

This allows you to test Instagram connection without needing Advanced Access approval.

---

## Step 5: Verify White Gold Instagram Account Type

Make sure White Gold Instagram is:
- ✅ **Business Account** or **Creator Account** (not Personal)
- ✅ **Linked to a Facebook Page**

### How to Check:
1. Open Instagram mobile app
2. Go to White Gold profile
3. Tap **☰ Menu** → **Settings and privacy** → **Account type and tools**
4. Check account type:
   - If it shows "Switch to personal account" → You're already Business ✅
   - If it shows "Switch to professional account" → Tap it and choose **Business**

### Link to Facebook Page:
1. In Instagram Settings → **Business** → **Connect to Facebook Page**
2. Select or create a Facebook Page for White Gold
3. Confirm the connection

---

## Step 6: Connect via Admin Panel

Once the webhook is verified and your account is added as tester:

### Open Admin Panel:
https://replai-xc95.onrender.com/admin-super.html

### Connect Instagram:
1. Wait for page to fully load (might take a moment)
2. Navigate to **"Integrations"** tab
3. Find **Instagram** section (shows "Not Connected")
4. Click **"Connect Instagram"** button
5. Log in with Facebook/Instagram credentials
6. **Authorize** REPLAI app to:
   - Read messages
   - Send messages
   - Manage comments
7. Select **White Gold** Instagram business page

---

## Step 7: Test the Connection

### Send a Test DM:
1. From **another Instagram account** (or ask a friend)
2. Send a DM to White Gold Instagram
3. Try: "Are you open today?" or "What services do you offer?"

### Expected Result:
The bot should reply automatically with:
- Business hours (Mon-Fri 10:00-19:00, etc.)
- Information about services
- AI-generated personalized response

---

## Troubleshooting

### If webhook verification fails:
```bash
# Test the webhook endpoint manually:
curl "https://replai-xc95.onrender.com/api/instagram/webhook?hub.mode=subscribe&hub.verify_token=replai_instagram_webhook_2024&hub.challenge=test123"

# Should return: test123
```

### If OAuth connection fails:
- Check that your Facebook account is added as App Tester
- Verify White Gold Instagram is Business type
- Ensure Instagram is linked to a Facebook Page

### If bot doesn't respond to messages:
1. Check server logs in Render dashboard
2. Verify Instagram connection status in admin panel
3. Check that White Gold business has Instagram configured in database

---

## Summary of Correct URLs

| Purpose | Correct URL |
|---------|-------------|
| **Webhook Callback** | `https://replai-xc95.onrender.com/api/instagram/webhook` |
| **OAuth Redirect** | `https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback` |
| **Admin Panel** | `https://replai-xc95.onrender.com/admin-super.html` |
| **Webhook Verify Token** | `replai_instagram_webhook_2024` |

---

## What White Gold Bot Can Do

Once connected, the bot will:
- ✅ Respond to Instagram DMs automatically
- ✅ Answer questions about business hours
- ✅ Provide info about services (Custom Jewelry, Repairs, Ring Resizing, etc.)
- ✅ Answer FAQs about gold purity, warranties, payment plans
- ✅ Use AI to give personalized responses
- ✅ Work 24/7 even when store is closed

---

**Start with Step 1** - fix the webhook URL in Meta Developer App, then proceed through the steps!
