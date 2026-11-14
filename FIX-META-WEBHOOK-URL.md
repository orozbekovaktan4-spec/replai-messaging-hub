# Fix Meta Webhook URL Configuration

## Problem
Meta Developer App has the **wrong webhook URL** configured:
- ❌ Currently set: `https://replai-xc95.onrender.com/webhook/instagram`
- ✅ Correct URL: `https://replai-xc95.onrender.com/api/instagram/webhook`

This is why Meta shows error: "The callback URL or verify token couldn't be validated"

## Solution: Update Meta Developer App

### Step 1: Go to Meta Developer App
https://developers.facebook.com/apps/2031381430802139/webhooks/

### Step 2: Edit Instagram Webhook
1. Find the **Instagram** webhook subscription
2. Click **"Edit"** or **"Configure"**
3. Change the **Callback URL** to:
   ```
   https://replai-xc95.onrender.com/api/instagram/webhook
   ```
4. Keep **Verify Token** as:
   ```
   replai_instagram_webhook_2024
   ```
5. Keep subscribed fields:
   - ✅ `messages`
   - ✅ `messaging_postbacks`

### Step 3: Click "Verify and Save"
Meta will send a verification request to your server, which will respond correctly.

## Test the Webhook Endpoint

You can test the webhook verification manually:

```bash
curl "https://replai-xc95.onrender.com/api/instagram/webhook?hub.mode=subscribe&hub.verify_token=replai_instagram_webhook_2024&hub.challenge=test123"
```

Expected response: `test123` (echoes the challenge)

## Why This Happened
The initial guide incorrectly used `/webhook/instagram` instead of the actual server endpoint `/api/instagram/webhook`.

## After Fixing
Once Meta successfully verifies the webhook:
1. The webhook will show ✅ **Active** status in Meta Dashboard
2. You can connect White Gold Instagram via admin panel
3. Instagram DMs will be automatically processed by your bot

---

**Next Step**: Update the webhook URL in Meta Developer App now.
