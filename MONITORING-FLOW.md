# 🔍 Monitoring Dashboard - Data Flow Diagram

**Last Updated:** 2026-11-06 03:51 UTC

---

## 📊 Complete Data Flow (After Fix)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER SENDS MESSAGE                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    Instagram       WhatsApp        Telegram
    "Hello"      "Book haircut"     "Price?"
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              PLATFORM WEBHOOKS (server-new.js)                   │
│                                                                  │
│  POST /webhook/instagram    ✅ Instagram DM Handler             │
│  POST /webhook/whatsapp     ✅ Meta WhatsApp Handler            │
│  POST /webhook/telegram     ✅ Telegram Bot Handler             │
│  POST /webhook/twilio       ✅ Twilio WhatsApp Handler          │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │ 1. Extract: userId, message, platform            │          │
│  │ 2. Find business by platform credentials         │          │
│  │ 3. ✅ NEW: logMessage() - INCOMING               │          │
│  └──────────────────────────────────────────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AI RESPONSE GENERATION                          │
│                    (ai-engine-free.js)                           │
│                                                                  │
│  • Get conversation history                                     │
│  • Call Groq LLaMA 3.3 API                                     │
│  • Generate contextual response                                 │
│  • Return AI message                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│               SEND RESPONSE TO PLATFORM                          │
│                                                                  │
│  • Instagram: graph.instagram.com/v23.0/me/messages             │
│  • WhatsApp: graph.facebook.com/v25.0/{phone_id}/messages       │
│  • Telegram: api.telegram.org/bot{token}/sendMessage            │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │ ✅ NEW: logMessage() - OUTGOING (if success)     │          │
│  │ ✅ NEW: logMessage() - FAILED (if error)         │          │
│  │ ✅ NEW: logError() - ERROR DETAILS               │          │
│  └──────────────────────────────────────────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   IN-MEMORY STORAGE                              │
│                  (server-new.js lines 202-250)                   │
│                                                                  │
│  messageLogs = Map {                                            │
│    "business-123" => [                                          │
│      {                                                          │
│        id: "uuid",                                              │
│        businessId: "business-123",                              │
│        platform: "instagram",                                   │
│        direction: "in",                                         │
│        sender: "ig-user-456",                                   │
│        message: "Hello",                                        │
│        status: "received",                                      │
│        timestamp: "2026-11-06T03:45:00Z"                        │
│      },                                                         │
│      {                                                          │
│        businessId: "business-123",                              │
│        platform: "instagram",                                   │
│        direction: "out",                                        │
│        recipient: "ig-user-456",                                │
│        message: "Hi! How can I help?",                          │
│        status: "sent",                                          │
│        responseTime: 1250,                                      │
│        timestamp: "2026-11-06T03:45:01Z"                        │
│      }                                                          │
│    ]                                                            │
│  }                                                              │
│                                                                  │
│  Limits: 1000 messages per business (ring buffer)              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│               MONITORING API ENDPOINTS                           │
│                                                                  │
│  GET /api/business/:id/monitor                                  │
│    ├─ Returns: messages, stats, platform health                │
│    ├─ Reads from: messageLogs Map                              │
│    └─ Called by: Monitor modal refresh                          │
│                                                                  │
│  GET /api/business/:id/messages?platform=instagram              │
│    ├─ Returns: filtered messages                                │
│    └─ Called by: Messages tab filter                            │
│                                                                  │
│  POST /api/business/:id/test-platform                           │
│    ├─ Tests platform connectivity                               │
│    └─ Called by: Health tab test button                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              ADMIN PANEL UI (admin-super.html)                   │
│                                                                  │
│  Business Table                                                 │
│    ├─ Monitor button → openBusinessMonitor(id)                 │
│    └─ Opens modal                                               │
│                                                                  │
│  Monitor Modal                                                  │
│    ├─ Tab 1: Messages                                          │
│    │   ├─ Shows messageLogs for this business                 │
│    │   ├─ Platform badges (pink/green/blue)                   │
│    │   ├─ Direction arrows (→ in, ← out)                      │
│    │   └─ Filter by platform dropdown                         │
│    │                                                            │
│    ├─ Tab 2: Health                                            │
│    │   ├─ Platform connection status                           │
│    │   ├─ Token expiration warnings                            │
│    │   └─ Test connectivity button                             │
│    │                                                            │
│    ├─ Tab 3: Stats (24 hours)                                 │
│    │   ├─ Total messages                                       │
│    │   ├─ By platform breakdown                                │
│    │   ├─ Response rate %                                      │
│    │   ├─ Avg response time                                    │
│    │   └─ Failed messages count                                │
│    │                                                            │
│    └─ Tab 4: Debug                                             │
│        ├─ Recent errors from errorLogs                         │
│        ├─ Stack traces                                         │
│        └─ Error timestamps                                     │
│                                                                  │
│  Auto-refresh: Every 30 seconds                                │
│  Manual refresh: Refresh button                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🆕 What Changed Today (2026-11-06)

### Before Fix ❌
```
Customer sends message
  ↓
Webhook receives
  ↓
AI processes
  ↓
Response sent
  ↓
❌ NOT LOGGED to monitoring dashboard
  ↓
Monitor → Messages tab = EMPTY
```

### After Fix ✅
```
Customer sends message
  ↓
Webhook receives
  ↓
✅ logMessage() - INCOMING
  ↓
AI processes
  ↓
Response sent
  ↓
✅ logMessage() - OUTGOING
  ↓
Monitor → Messages tab = SHOWS DATA
```

---

## 📍 Exact Code Locations

### 1. Instagram Webhook (Already Working)
**File:** `server-new.js`  
**Lines:** 3845-3964  
**Function:** `handleInstagramMessage(event)`

```javascript
// Line 3874-3883: Log incoming
logMessage({
  businessId: business.id,
  platform: 'instagram',
  direction: 'in',
  ...
});

// Line 3945-3955: Log outgoing
logMessage({
  businessId: business.id,
  platform: 'instagram',
  direction: 'out',
  ...
});
```

---

### 2. Generic Webhook (Fixed Today) 🆕
**File:** `server-new.js`  
**Lines:** 4456-4602  
**Handles:** WhatsApp, Telegram

```javascript
// Line ~4590: Log incoming
if (business) {
  logMessage({
    businessId: business.id,
    platform: platform, // 'whatsapp' or 'telegram'
    direction: 'in',
    ...
  });
}

// Line ~4610: Log outgoing (success)
if (sendResult.ok && business) {
  logMessage({
    businessId: business.id,
    platform: platform,
    direction: 'out',
    status: 'sent',
    ...
  });
}

// Line ~4625: Log outgoing (failed)
if (!sendResult.ok && business) {
  logMessage({
    ...
    status: 'failed',
  });
  logError(business.id, error, platform);
}
```

---

### 3. Twilio Webhook (Fixed Today) 🆕
**File:** `server-new.js`  
**Lines:** 1483-1542  
**Handles:** WhatsApp via Twilio

```javascript
// Line ~1520: Log incoming
if (business) {
  logMessage({
    businessId: business.id,
    platform: 'whatsapp',
    direction: 'in',
    ...
  });
}

// Line ~1553: Log outgoing
if (business) {
  logMessage({
    businessId: business.id,
    platform: 'whatsapp',
    direction: 'out',
    ...
  });
}

// Line ~1571: Log errors
if (business) {
  logError(business.id, error, 'whatsapp');
}
```

---

## 🎯 Message Journey Example

### Real-World Scenario

```
📱 Customer: @john_doe (Instagram)
🏪 Business: Aziz's Barber Shop
⏰ Time: 2026-11-06 03:45:00 UTC

┌─────────────────────────────────────────┐
│ Step 1: Customer Sends Message          │
└─────────────────────────────────────────┘
@john_doe → @akt4n.o: "Do you have availability tomorrow?"

┌─────────────────────────────────────────┐
│ Step 2: Instagram Webhook Received      │
└─────────────────────────────────────────┘
POST /webhook/instagram
{
  "entry": [{
    "messaging": [{
      "sender": {"id": "ig-12345"},
      "message": {"text": "Do you have availability tomorrow?"}
    }]
  }]
}

┌─────────────────────────────────────────┐
│ Step 3: Find Business                   │
└─────────────────────────────────────────┘
business = findBusinessByInstagramUserId("ig-recipient-789")
Found: "Aziz's Barber Shop" (id: biz-123)

┌─────────────────────────────────────────┐
│ Step 4: ✅ LOG INCOMING MESSAGE         │
└─────────────────────────────────────────┘
logMessage({
  id: "msg-001",
  businessId: "biz-123",
  platform: "instagram",
  direction: "in",
  sender: "ig-12345",
  message: "Do you have availability tomorrow?",
  status: "received",
  timestamp: "2026-11-06T03:45:00.123Z"
})

Stored in: messageLogs.get("biz-123")[0]

┌─────────────────────────────────────────┐
│ Step 5: Generate AI Response            │
└─────────────────────────────────────────┘
getAIResponse("ig-12345", "Do you have availability tomorrow?")
  ↓
Groq API (LLaMA 3.3)
  ↓
Response: "Yes! We have slots at 10am, 2pm, and 4pm. What works best?"

┌─────────────────────────────────────────┐
│ Step 6: Send to Instagram               │
└─────────────────────────────────────────┘
POST https://graph.instagram.com/v23.0/me/messages
{
  "recipient": {"id": "ig-12345"},
  "message": {"text": "Yes! We have slots at 10am, 2pm, and 4pm..."}
}

Response: 200 OK ✅

┌─────────────────────────────────────────┐
│ Step 7: ✅ LOG OUTGOING MESSAGE         │
└─────────────────────────────────────────┘
logMessage({
  id: "msg-002",
  businessId: "biz-123",
  platform: "instagram",
  direction: "out",
  recipient: "ig-12345",
  message: "Yes! We have slots at 10am, 2pm, and 4pm. What works best?",
  status: "sent",
  responseTime: 1234,
  timestamp: "2026-11-06T03:45:01.357Z"
})

Stored in: messageLogs.get("biz-123")[1]

┌─────────────────────────────────────────┐
│ Step 8: Admin Views Monitor             │
└─────────────────────────────────────────┘
Admin opens: /admin
Clicks: "Monitor" on Aziz's Barber Shop
Modal opens → Messages tab

Displays:
  ● Instagram                    03:45 PM
  → ig-12345: "Do you have availability tomorrow?"
  ← You: "Yes! We have slots at 10am, 2pm, and 4pm..."

✅ COMPLETE - Message visible in dashboard!
```

---

## 🔄 Data Retention

### Current Implementation
```
In-Memory Storage (messageLogs Map)
  ├─ Capacity: 1,000 messages per business
  ├─ Structure: Ring buffer (FIFO)
  ├─ Retention: Until server restart
  └─ Access: O(1) read, O(1) write

When full:
  ├─ New message → Oldest message dropped
  └─ messageLogs.get(businessId).pop()
```

### Future Enhancement (TODO)
```
Database Storage (PostgreSQL via Prisma)
  ├─ Capacity: Unlimited (disk-based)
  ├─ Retention: 30 days (configurable)
  ├─ Indexing: By businessId, platform, timestamp
  └─ Query: SQL with filters

Migration path:
  logMessage() → await db.logMessage()
```

---

## 🎨 UI Component Tree

```
admin-super.html
└─ Businesses Section
   └─ Business Table Row
      └─ Actions Dropdown
         └─ Monitor Button (onclick="openBusinessMonitor('biz-123', 'Aziz Barber')")
            ↓
         ┌─────────────────────────────────────┐
         │  #business-monitor-modal (Modal)    │
         ├─────────────────────────────────────┤
         │  Header                             │
         │    ├─ Business Name                 │
         │    ├─ Platform Badges               │
         │    └─ Close Button                  │
         ├─────────────────────────────────────┤
         │  Tabs                               │
         │    ├─ [Messages] (active)           │
         │    ├─ Health                        │
         │    ├─ Stats                         │
         │    └─ Debug                         │
         ├─────────────────────────────────────┤
         │  Tab Content: Messages              │
         │    ├─ Filter: [All ▼]              │
         │    ├─ Message List                  │
         │    │   ├─ Message Item              │
         │    │   │   ├─ Platform Badge        │
         │    │   │   ├─ Direction Arrow       │
         │    │   │   ├─ Sender/Recipient      │
         │    │   │   ├─ Message Text          │
         │    │   │   └─ Timestamp             │
         │    │   └─ ...more messages          │
         │    └─ No Messages Placeholder       │
         ├─────────────────────────────────────┤
         │  Footer                             │
         │    ├─ Last Updated: 03:51 PM        │
         │    └─ [Refresh] Button              │
         └─────────────────────────────────────┘
```

---

**Status:** ✅ Implementation Complete  
**Deploy:** Ready (3 git commands)  
**Test:** Send message → Check monitor  
**Documentation:** Complete (4 markdown files)

---

**Next Action:** Deploy and test! 🚀
