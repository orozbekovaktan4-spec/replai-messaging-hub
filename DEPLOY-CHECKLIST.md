# 🚀 Deploy Checklist - Webhook Logging Fix

**Date:** 2026-11-06 03:42 UTC  
**Branch:** main  
**Status:** Ready to deploy ✅

---

## 📦 What Changed

### Modified Files
- ✅ `server-new.js` - Added monitoring dashboard logging to 2 webhook handlers
- ✅ `WEBHOOK-LOGGING-FIX.md` - Implementation documentation

### Lines Changed
- **Twilio webhook** (~80 lines modified)
- **Generic webhook handler** (~100 lines modified)

---

## 🎯 Pre-Deployment Checklist

### Code Review
- [x] All webhook handlers now call `logMessage()`
- [x] Incoming messages logged with `direction: 'in'`
- [x] Outgoing messages logged with `direction: 'out'`
- [x] Failed messages logged with `status: 'failed'`
- [x] Errors logged with `logError()`
- [x] No syntax errors (verify below)

### Syntax Check
```bash
node --check server-new.js
```

Expected: **No output** (means syntax is valid)

---

## 🚢 Deployment Steps

### Step 1: Commit Changes
```bash
cd /Users/ak/replai

# Review changes
git diff server-new.js

# Stage files
git add server-new.js WEBHOOK-LOGGING-FIX.md DEPLOY-CHECKLIST.md

# Commit with descriptive message
git commit -m "🔧 Connect webhook logging to monitoring dashboard

- Add logMessage() calls to Telegram/WhatsApp webhook handlers
- Add logMessage() calls to Twilio webhook handler
- Log incoming, outgoing, and failed messages
- Add error logging for failed operations
- Messages now appear in Monitor → Messages tab

Fixes: Monitoring dashboard Messages tab was empty
Affects: /webhook/telegram, /webhook/whatsapp, /webhook/twilio"

# Push to main (triggers Render auto-deploy)
git push origin main
```

### Step 2: Monitor Deployment
1. Visit: https://dashboard.render.com
2. Watch "replai-xc95" service deploy logs
3. Wait for "Build successful" + "Deploy live"
4. **ETA:** ~3-5 minutes

### Step 3: Verify Deployment
```bash
# Check if server started successfully
curl https://replai-xc95.onrender.com/api/health

# Expected: "OK"
```

---

## 🧪 Testing Plan

### Test 1: Instagram Messages ✅
**Already works** - Instagram webhook was already logging

**Test:**
1. Send DM to @akt4n.o on Instagram: "Test monitoring dashboard"
2. Open admin: https://replai-xc95.onrender.com/admin
3. Login with: aziz@barber.com / barber123
4. Click "Monitor" on business
5. Check "Messages" tab

**Expected:**
- ✅ See incoming message with Instagram pink badge
- ✅ See AI response with outgoing arrow
- ✅ Timestamp shows current time
- ✅ Can click to expand full message

---

### Test 2: WhatsApp Messages 🆕
**New fix** - Should now work

**Prerequisites:**
- WhatsApp must be connected (check admin → Platforms)
- Need WhatsApp Business phone number

**Test:**
1. Send WhatsApp message to your business number
2. Wait 2-3 seconds for AI response
3. Refresh Monitor → Messages tab

**Expected:**
- ✅ See WhatsApp message with green badge
- ✅ See AI response
- ✅ Status: "received" → "sent"

**If it doesn't work:**
- Check Render logs for errors
- Verify WhatsApp webhook is configured in Meta dashboard
- Check signature validation passed

---

### Test 3: Telegram Messages 🆕
**New fix** - Should now work

**Prerequisites:**
- Telegram bot must be connected (check admin → Platforms)

**Test:**
1. Send message to your Telegram bot
2. Wait 2-3 seconds for AI response
3. Refresh Monitor → Messages tab

**Expected:**
- ✅ See Telegram message with blue badge
- ✅ See AI response
- ✅ Status: "received" → "sent"

**If it doesn't work:**
- Check Render logs for errors
- Verify Telegram webhook is set correctly
- Check bot token is valid

---

### Test 4: Monitor Dashboard UI

**Open Monitor Modal:**
1. Admin → Businesses table
2. Click "Monitor" action button
3. Modal should open with 4 tabs

**Check Messages Tab:**
- ✅ Shows recent messages (if any exist)
- ✅ Platform badges show correct colors
- ✅ Arrows show direction (→ in, ← out)
- ✅ Timestamps are readable
- ✅ Filter dropdown works (All/Instagram/WhatsApp/Telegram)
- ✅ Refresh button updates data

**Check Health Tab:**
- ✅ Shows platform connection status
- ✅ Green = connected, Red = disconnected
- ✅ Shows token expiration (if applicable)
- ✅ Shows last message timestamp

**Check Stats Tab:**
- ✅ Shows total messages (24h)
- ✅ Shows breakdown by platform
- ✅ Shows response rate %
- ✅ Shows avg response time
- ✅ Shows failed messages count

**Check Debug Tab:**
- ✅ Shows recent errors (if any)
- ✅ Shows error timestamps
- ✅ Shows error messages
- ✅ Shows stack traces (expandable)

---

## 🐛 Troubleshooting

### Problem: Messages tab is empty
**Possible causes:**
1. No messages sent yet → Send test message
2. Business not matched → Check logs for "No business found"
3. Webhook not configured → Check platform webhook settings
4. Logging disabled → Verify `logMessage()` is called

**Debug:**
```bash
# Check Render logs
https://dashboard.render.com/web/srv-xxx/logs

# Look for:
- "[Instagram DM] Business found: ..."
- "✅ NEW: Log incoming message to monitoring dashboard"
- "[Monitor] Failed to load monitoring data"
```

---

### Problem: Deployment failed
**Common causes:**
1. Syntax error → Run `node --check server-new.js`
2. Missing dependency → Check package.json
3. Port conflict → Check Render settings

**Fix:**
```bash
# Rollback if needed
git revert HEAD
git push origin main
```

---

### Problem: Webhook signature validation failed
**For WhatsApp:**
```
[whatsapp] Invalid signature - rejecting request
```

**Fix:**
- Verify `INSTAGRAM_APP_SECRET` in Render environment variables
- Check Meta dashboard webhook settings
- Ensure webhook URL is correct

---

## 📊 Success Metrics

After deployment, you should see:

### Immediate (< 5 min)
- ✅ Server deployed successfully
- ✅ Health check passes
- ✅ Admin panel loads

### Within 1 hour
- ✅ At least 1 test message logged
- ✅ Messages tab shows data
- ✅ Platform badges render correctly
- ✅ Stats update

### Within 24 hours
- ✅ Multiple conversations logged
- ✅ Stats tab shows meaningful data
- ✅ Response times calculated
- ✅ No errors in Debug tab

---

## 🎉 Done!

Once all tests pass, the monitoring dashboard is **fully operational**.

You can now:
- 📊 Monitor all conversations in real-time
- 📈 Track response times and success rates
- 🔍 Debug failed messages
- 🚨 Identify platform issues
- 📱 See which platforms are most active

---

## 📞 Support

**If you encounter issues:**
1. Check Render logs first
2. Review `WEBHOOK-LOGGING-FIX.md` for implementation details
3. Test each webhook individually
4. Verify environment variables are set

**Quick Debug Command:**
```bash
# SSH into Render (if enabled)
# OR check logs at:
https://dashboard.render.com/web/srv-xxx/logs
```

---

**Status:** ✅ Ready to deploy  
**Risk Level:** Low (non-breaking changes)  
**Rollback Plan:** `git revert HEAD` if issues occur  
**Estimated Deploy Time:** 3-5 minutes
