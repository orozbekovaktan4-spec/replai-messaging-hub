# CLAUDE.md - REPLAI Project Context & Architecture

## 🎯 Project Overview

**Name:** REPLAI  
**Purpose:** Multi-platform AI messaging hub for small businesses  
**Status:** MVP (shipped, running in production on Render)  
**Tech Stack:** Node.js + Express + Free Groq AI + JSON file storage  
**Deployment:** Render.com (auto-deploys from GitHub main)  
**Local Dev:** http://localhost:3000 + ngrok tunnel for webhooks  

**Credentials (Test):**
- Email: aziz@barber.com
- Password: barber123

---

## 🏗️ Architecture (Non-Negotiable Invariants)

### Core Design Principles

1. **Stateless servers** - All state lives in JSON files or environment
2. **File-based storage** - Simplicity over scale (MVP approach)
3. **Free AI only** - Uses Groq LLaMA 3.3 (free tier)
4. **OAuth where possible** - Instagram, Google, Facebook OAuth (avoid passwords)
5. **Webhook-based message flow** - Platforms send messages to us, we respond
6. **No database complexity** - JSON files: users.json, bookings.json, sessions.json

### Service Boundaries (NEVER CROSS THESE)

```
┌─────────────────────────────────────────────────────┐
│  AUTHENTICATION LAYER (login.html)                  │
│  ├─ Validates email/password with bcryptjs         │
│  ├─ Creates session token                          │
│  └─ Cannot directly call AI or business logic      │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  BUSINESS LOGIC LAYER (server-new.js)               │
│  ├─ All API routes live here                        │
│  ├─ Session validation first                        │
│  ├─ Calls AI engine OR platform connectors          │
│  └─ Coordinates between layers                      │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┼──────────┬─────────────┐
        │          │          │             │
┌───────▼────┐ ┌──▼────┐ ┌───▼──┐  ┌──────▼─────┐
│ AI LAYER   │ │WEBHOOK│ │DATA  │  │ PLATFORMS  │
│(ai-engine- │ │HANDLER│ │LAYER │  │ CONNECTORS │
│  free.js)  │ │       │ │      │  │            │
│            │ │ recv  │ │JSON  │  │ Instagram  │
│ Groq API   │ │ msg   │ │files │  │ Telegram   │
│ only       │ │ send  │ │      │  │ WhatsApp   │
│            │ │ resp  │ │      │  │ TikTok     │
└────────────┘ └───────┘ └──────┘  └────────────┘
```

### Data Flow Invariant

```
Customer Message (from platform):
  ↓
POST /webhook/[platform]
  ├─ Validate signature (platform-specific)
  ├─ Extract: sender_id, message_text, platform
  └─ Look up or create customer in chat_logs
  
  ↓
Get AI Response:
  ├─ Read last 10 messages for context
  ├─ Call getAIResponse(message, context)
  ├─ Groq API processes → returns response
  └─ Save to chat_logs
  
  ↓
Send Back to Platform:
  ├─ Call sendResponseToPlatform(platform, user_id, response)
  ├─ Format per platform requirements
  └─ Platform delivers to customer

Response delivered ✓
Conversation logged ✓
```

### Webhook Receiver Invariants

**Every webhook must:**
1. Validate sender authenticity (signature check)
2. Extract three pieces: sender_id, message_text, platform
3. Ignore duplicate messages (use message_id to deduplicate)
4. Respond with 200 OK immediately (don't block on AI processing)
5. Process AI response asynchronously (fire and forget)

**Current status:**
- ✅ Instagram webhooks (fully implemented)
- ✅ Telegram webhooks (fully implemented)
- ⚠️ WhatsApp webhooks (stub exists, needs Meta API integration)
- ⚠️ TikTok webhooks (planned, not started)

---

## 📊 Database Schema (JSON Files)

### users.json
```json
[
  {
    "id": "uuid-or-auto-increment",
    "email": "aziz@barber.com",
    "passwordHash": "bcrypt-hash-never-plain-text",
    "businesses": ["business-id-1"],
    "createdAt": "2026-01-15T10:30:00Z",
    "role": "owner|admin|viewer"
  }
]
```
**Invariant:** Never store plain passwords. Always bcryptjs.

### sessions.json
```json
[
  {
    "sessionId": "secure-random-token",
    "userId": "uuid",
    "expiresAt": "2026-01-16T10:30:00Z"
  }
]
```
**Invariant:** Session IDs are cryptographically random (not predictable).

### businessSessions.json
```json
{
  "business-id-1": {
    "sessionId": "token-xyz",
    "businessId": "business-id-1",
    "expiresAt": "2026-01-16T10:30:00Z"
  }
}
```

### businesses.json (Main Business Data)
```json
[
  {
    "id": "business-id-1",
    "name": "Aziz's Barber Shop",
    "owner_id": "user-uuid",
    "services": [
      {
        "name": "Haircut",
        "duration_minutes": 30,
        "available": true
      }
    ],
    "hours": {
      "monday": ["09:00", "18:00"],
      "tuesday": ["09:00", "18:00"],
      ...
    },
    "platforms": {
      "instagram": {
        "connected": true,
        "username": "@azizbarber",
        "accessToken": "ig_...hidden...",
        "expiresAt": "2026-08-15T00:00:00Z"
      },
      "telegram": {
        "connected": true,
        "botToken": "123456:ABC...hidden..."
      },
      "whatsapp": {
        "connected": false,
        "platform_type": "meta|twilio",
        "phone_number": null
      }
    }
  }
]
```

### bookings.json
```json
[
  {
    "id": "booking-001",
    "business_id": "business-id-1",
    "customer_name": "John Doe",
    "customer_phone": "+996555123456",
    "service": "Haircut",
    "date": "2026-01-20",
    "time": "14:00",
    "platform": "instagram|telegram|whatsapp",
    "platform_user_id": "sender-id-from-platform",
    "status": "pending|confirmed|completed|cancelled",
    "created_at": "2026-01-15T10:30:00Z"
  }
]
```

### ai-settings.json
```json
[
  {
    "business_id": "business-id-1",
    "language": "auto-detect|en|ru|ky",
    "personality": "professional|friendly|casual",
    "ai_provider": "groq",
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.7,
    "system_prompt": "You are a helpful barber shop assistant...",
    "context_messages": 10
  }
]
```

**Invariant:** All timestamps in ISO 8601 UTC format.

---

## 🔐 Security Boundaries

### What Requires Authentication

- Any route under `/api/admin/*` (protected by `requireAuth` middleware)
- Accessing business data (protected by `requireBusinessAuth` middleware)
- Modifying user profile or settings
- Accessing chat logs or analytics

### What's Public

- `GET /` → login.html (public)
- `GET /business` → business profile page
- `POST /webhook/*` → webhook receivers (platform signatures verify authenticity)
- `GET /privacy-policy` → privacy page

### Authentication Check Pattern

```javascript
// ALWAYS at start of protected route:
if (!req.session?.userId) {
  return res.status(401).json({ error: 'Unauthorized' });
}

// Verify business access (for business-specific routes):
if (req.body.businessId && !userHasAccessToBusiness(req.session.userId, req.body.businessId)) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### Never (Security Anti-Patterns)

- ❌ Store passwords in plain text (use bcryptjs)
- ❌ Log API keys or tokens to console
- ❌ Send secrets in response JSON
- ❌ Trust client-side validation
- ❌ Commit `.env` file to git
- ❌ Use session IDs that are predictable
- ❌ Store credit card data (if payments added)

### Credentials Management

**In .env (never commit):**
```
GROQ_API_KEY=your_key_here
INSTAGRAM_APP_ID=123456
INSTAGRAM_APP_SECRET=secret_here
TELEGRAM_BOT_TOKEN=bot_token_here
WHATSAPP_ACCESS_TOKEN=token_here (future)
```

**In code:** Never hardcode credentials. Always read from `process.env`.

---

## 🚀 Deployment & Environment

### Production (Render.com)

**Auto-deploy trigger:** Push to GitHub main branch

**Environment variables on Render:**
```
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...
INSTAGRAM_APP_ID=...
INSTAGRAM_APP_SECRET=...
INSTAGRAM_REDIRECT_URI=https://replai-xc95.onrender.com/api/admin/instagram/oauth/callback
TELEGRAM_BOT_TOKEN=...
PORT=3000
```

**Webhook URLs for platforms:**
```
Instagram: https://replai-xc95.onrender.com/webhook/instagram
Telegram: https://replai-xc95.onrender.com/webhook/telegram
WhatsApp: https://replai-xc95.onrender.com/webhook/whatsapp
```

**Note:** JSON files stored in `/tmp/` on Render are lost on restart. For MVP this is OK. At scale, migrate to database.

### Local Development

**Start server:**
```bash
npm start
# Server runs on http://localhost:3000
```

**For webhook testing (ngrok tunnel):**
```bash
./ngrok http 3000
# Creates tunnel: https://xxx.ngrok-free.dev
# Use this URL when setting up platform webhooks locally
```

**Two terminals:**
```
Terminal 1: npm start (server on 3000)
Terminal 2: ./ngrok http 3000 (tunnel on https://xxx.ngrok.com)
```

---

## 📱 Platform Integration Patterns

### Instagram Webhook

**Incoming webhook format:**
```json
{
  "entry": [{
    "messaging": [{
      "sender": { "id": "instagram-user-id" },
      "message": { "text": "Hello!" },
      "timestamp": 1234567890
    }]
  }]
}
```

**Signature validation:** Via X-Hub-Signature header (SHA-256 HMAC)

**Response sending:** POST to Instagram Graph API with user message

**Route:** `POST /webhook/instagram`

**Status:** ✅ Fully implemented

---

### Telegram Webhook

**Incoming webhook format:**
```json
{
  "update_id": 123456,
  "message": {
    "message_id": 1,
    "from": { "id": "telegram-user-id", "first_name": "John" },
    "text": "Hello!"
  }
}
```

**Signature validation:** Token in webhook URL (Telegram sends to /webhook/telegram?token=YOUR_TOKEN)

**Response sending:** POST to Telegram Bot API

**Route:** `POST /webhook/telegram`

**Status:** ✅ Fully implemented

---

### WhatsApp Webhook (COMPLETE - Meta Cloud API) ✅

**Target platform:** Meta WhatsApp Cloud API

**Incoming webhook format:**
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "whatsapp-phone-number",
          "id": "msg-id",
          "text": { "body": "Hello!" },
          "timestamp": "1234567890"
        }]
      }
    }]
  }]
}
```

**Signature validation:** Via X-Hub-Signature-256 header (SHA256 HMAC with APP_SECRET)

**Message deduplication:** By message ID (tracked in memory, keeps last 5000 messages)

**Response sending:** POST to Meta WhatsApp Cloud API

**Route:** `POST /webhook/whatsapp`

**Status:** ✅ Fully implemented with signature validation, deduplication, and error handling

**Key features:**
- Validates HMAC signature with INSTAGRAM_APP_SECRET
- Deduplicates messages by ID (prevents double-processing)
- Sends responses with correct Meta API format
- Validates credentials before saving
- Includes comprehensive error logging

---

## 🤖 AI Response Engine (ai-engine-free.js)

### Invariants

- Uses **Groq LLaMA 3.3** free API only (never call other providers without config)
- Maximum **2000 tokens** per request (to stay free tier)
- **Auto-detect** customer language or use AI settings
- Cache last 10 messages per conversation for context
- Respond in customer's language (if detected)

### Calling Pattern

```javascript
import { getAIResponse } from './ai-engine-free.js';

const response = await getAIResponse(
  userMessage,           // "Hello, can I book a haircut?"
  previousMessages,      // Array of last 10 messages
  businessId,           // For fetching AI settings
  platform              // "instagram", "telegram", etc
);
```

### Response Format

```javascript
{
  text: "Sure! We have availability tomorrow at 2 PM.",
  language: "en",
  confidence: 0.95,
  isBooking: true,  // True if response suggests booking
  bookingDetails: {
    service: "Haircut",
    date: "2026-01-16",
    time: "14:00"
  }
}
```

---

## 📝 Current Development Phase

### Completed ✅
- [x] Authentication (Google OAuth, Facebook OAuth, email/password)
- [x] Admin dashboard (multi-language: EN, RU, KY)
- [x] Instagram OAuth connection (full 2.0 flow)
- [x] Telegram connection (bot token + webhooks)
- [x] User & business data models
- [x] Booking automation system
- [x] Chat logging & conversation history
- [x] Production deployment (Render.com)
- [x] Login credentials working (aziz@barber.com / barber123)
- [x] **WhatsApp integration (Meta Cloud API with signature validation)**

### In Progress 🔄
- [ ] Message logging improvements (better filtering)
- [ ] Response sending verification

### Planned 📋
- [ ] TikTok platform connection
- [ ] Analytics dashboard
- [ ] Bulk messaging (broadcasts)
- [ ] Multi-language support enhancements
- [ ] Rate limiting
- [ ] Error alerting

---

## ⚠️ Known Issues & Gotchas

1. **WhatsApp not receiving messages** - Webhook stubbed but not fully wired
2. **JSON files size limit** - Once businesses.json > 10MB, performance degrades (migrate to DB)
3. **Telegram rate limits** - 30 messages/second max (not an issue for MVP)
4. **Feature flags** - Old flags accumulate, need cleanup agent

---

## 🔄 How We Know Something Works

✅ **Must pass all these checks before shipping:**

1. **Tests pass**
   ```bash
   npm test
   ```

2. **Admin dashboard loads** without console errors

3. **Can log in** with test credentials (aziz@barber.com / barber123)

4. **Can connect platforms** from admin dashboard (at least one)

5. **Credentials validated** on production (https://replai-xc95.onrender.com/business)

6. **Webhook can be triggered** (test sending message to platform)

7. **Response appears** in chat logs within 5 seconds

8. **No sensitive data** in logs or responses (run security scan)

---

## 📚 Coding Conventions

### JavaScript/Node.js Style

- Use **async/await** (never callbacks)
- All file I/O wrapped in **try/catch**
- JSON responses always include either `"success"` or `"error"` field
- Dates: **ISO 8601 UTC** (never timestamp millis)
- IDs: **UUID v4** or simple string (consistency per file)
- Constants: **UPPER_SNAKE_CASE**
- Functions: **camelCase**
- Files: **kebab-case** (except index files)

### Example API Response

```javascript
// ✅ Good
res.json({ 
  success: true,
  data: { ... },
  timestamp: new Date().toISOString()
});

// ✅ Good (error)
res.status(400).json({
  error: "Invalid email",
  code: "INVALID_EMAIL"
});

// ❌ Bad
res.json({ ok: true, data: ... });
res.json({ message: "Done" });
```

### File Organization

- **server-new.js** - Main Express app + all routes (1600+ lines, can split if needed)
- **ai-engine-free.js** - Groq API integration + response generation
- **admin-new.html** - Dashboard UI (1 file, monolithic)
- **login.html** - Auth page
- **.env** - Configuration (never commit)

---

## 🛠️ Tools & Key Commands

```bash
# Development
npm start           # Run server locally
npm run dev         # Run with file watching
npm test           # Run tests (if tests/ exists)

# Deployment
git push origin main    # Auto-deploys to Render

# Webhooks (local)
./ngrok http 3000      # Start tunnel for local testing

# Analytics/Debugging
tail -f server-new.js  # Follow logs (if using logging)
curl http://localhost:3000/api/admin/stats  # Check stats endpoint
```

---

## 📖 Key Files Reference

| File | Lines | Purpose |
|------|-------|---------|
| **server-new.js** | 1600+ | All API routes + webhooks |
| **ai-engine-free.js** | ~200 | Groq API integration |
| **admin-new.html** | ~3000 | Dashboard UI + logic |
| **login.html** | ~500 | Auth page |
| **.env** | ~20 | Configuration (private) |
| **package.json** | ~20 | Dependencies |
| **businesses.json** | Variable | Business data (runtime) |
| **bookings.json** | Variable | Booking data (runtime) |
| **users.json** | Variable | User data (runtime) |
| **sessions.json** | Variable | Active sessions (runtime) |

---

## 🚨 When Working On...

### Adding a New Webhook (e.g., TikTok):

1. Check platform's webhook signature format
2. Add route: `app.post('/webhook/tiktok', async (req, res) => { ... })`
3. Validate signature first
4. Extract: sender_id, message_text, platform
5. Call getAIResponse()
6. Send response back via platform API
7. Log to chat_logs

### Fixing a Bug in AI Responses:

1. Check if it's model behavior or harness
2. Test locally with same message
3. Read ai-settings.json for that business
4. Adjust system_prompt or model parameters
5. Test against previous messages (context)

### Adding New Platform Connection:

1. Add to CLAUDE.md (this file) first
2. Document webhook format
3. Document signature validation
4. Implement stub route
5. Implement full integration
6. Add to admin dashboard UI

### Deploying New Feature:

1. Test locally
2. Commit with clear message
3. Push to main
4. Render auto-deploys
5. Test on production URL
6. If broken: revert and debug

---

## 🎓 For Non-Technical Founders

**You can ship features without engineering knowledge:**

1. Use Claude Code to scaffold new endpoints
2. Use this CLAUDE.md as reference (Claude reads it automatically)
3. Test in admin dashboard
4. Push to GitHub (auto-deploys)

**Example:**
- Task: "Add a new field to business settings (business_phone)"
- Claude reads CLAUDE.md for patterns
- Claude updates data model, API route, dashboard UI
- You test and push

---

*Last updated: October 3, 2026*  
*Maintained by: Claude Code (auto-enforced)*
