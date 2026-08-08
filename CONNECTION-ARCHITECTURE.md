# 🏗️ REPLAI Connection Architecture

## Visual Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  login.html                        admin-new.html               │
│  ┌──────────────┐                 ┌─────────────────────┐      │
│  │              │                 │                     │      │
│  │  Login Form  │────────────────>│  Protected Dashboard│      │
│  │              │  After Auth     │                     │      │
│  │  - Email     │                 │  - Stats            │      │
│  │  - Password  │                 │  - Charts           │      │
│  │  - Google    │                 │  - Platform Setup   │      │
│  │  - Facebook  │                 │  - Business Config  │      │
│  └──────────────┘                 │  - AI Settings      │      │
│                                    │  - Bookings         │      │
│                                    │  - Chat Logs        │      │
│                                    └─────────────────────┘      │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                          │
                          │ HTTP/HTTPS
                          │ REST API Calls
                          │
┌──────────────────────────▼───────────────────────────────────────┐
│                         API LAYER                                │
├──────────────────────────────────────────────────────────────────┤
│                     server-new.js                                │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ Authentication │  │ Platform APIs  │  │  Admin APIs    │   │
│  │                │  │                │  │                │   │
│  │ /api/auth/     │  │ /webhook/*     │  │ /api/admin/*   │   │
│  │  - login       │  │  - telegram    │  │  - stats       │   │
│  │  - logout      │  │  - instagram   │  │  - settings    │   │
│  │  - verify      │  │  - whatsapp    │  │  - bookings    │   │
│  │  - google      │  │  - tiktok      │  │  - chat-logs   │   │
│  │  - facebook    │  │                │  │  - connect/*   │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                                  │
└──────────┬────────────────────┬────────────────────┬────────────┘
           │                    │                    │
           │                    │                    │
┌──────────▼──────────┐  ┌──────▼──────────┐  ┌─────▼────────────┐
│   AI ENGINE         │  │  DATA STORAGE   │  │ EXTERNAL APIS    │
├─────────────────────┤  ├─────────────────┤  ├──────────────────┤
│                     │  │                 │  │                  │
│ ai-engine-free.js   │  │ JSON Files:     │  │ - Telegram Bot   │
│                     │  │                 │  │ - Instagram      │
│ - getAIResponse()   │  │ • sessions.json │  │ - Meta Graph     │
│ - Process context   │  │ • bookings.json │  │ - WhatsApp       │
│ - Generate reply    │  │ • business-info │  │ - Google OAuth   │
│                     │  │ • ai-settings   │  │ - Facebook OAuth │
│ Uses: Groq API      │  │                 │  │ - TikTok         │
│                     │  └─────────────────┘  │                  │
└─────────────────────┘                       └──────────────────┘
```

---

## 🔐 Authentication Flow Diagram

```
┌──────────┐                 ┌──────────┐                ┌─────────┐
│  User    │                 │  Server  │                │ Storage │
└────┬─────┘                 └────┬─────┘                └────┬────┘
     │                            │                           │
     │  1. POST /api/auth/login   │                           │
     │  {email, password}         │                           │
     ├───────────────────────────>│                           │
     │                            │                           │
     │                            │  2. Validate credentials  │
     │                            │  3. Create session        │
     │                            ├──────────────────────────>│
     │                            │                           │
     │                            │  4. Save to sessions.json │
     │                            │<──────────────────────────┤
     │                            │                           │
     │  5. Return sessionId       │                           │
     │<───────────────────────────┤                           │
     │                            │                           │
     │  6. Store in localStorage  │                           │
     │                            │                           │
     │  7. Redirect to /admin     │                           │
     │                            │                           │
     │  8. Load admin page        │                           │
     │                            │                           │
     │  9. GET /api/auth/verify   │                           │
     │  Header: X-Session-ID      │                           │
     ├───────────────────────────>│                           │
     │                            │                           │
     │                            │  10. Check session        │
     │                            ├──────────────────────────>│
     │                            │                           │
     │                            │  11. Return session       │
     │                            │<──────────────────────────┤
     │                            │                           │
     │  12. {valid: true}         │                           │
     │<───────────────────────────┤                           │
     │                            │                           │
     │  13. Show dashboard        │                           │
     │                            │                           │
```

---

## 📨 Message Flow Diagram

```
┌───────────┐                ┌──────────┐               ┌──────────┐
│ Customer  │                │  Server  │               │    AI    │
└─────┬─────┘                └────┬─────┘               └────┬─────┘
      │                           │                          │
      │  1. Send message via      │                          │
      │     Instagram/Telegram    │                          │
      ├──────────────────────────>│                          │
      │                           │                          │
      │                           │  2. Receive webhook      │
      │                           │  POST /webhook/platform  │
      │                           │                          │
      │                           │  3. Extract message      │
      │                           │                          │
      │                           │  4. Call AI engine       │
      │                           │  getAIResponse()         │
      │                           ├─────────────────────────>│
      │                           │                          │
      │                           │                          │  5. Load business
      │                           │                          │     context
      │                           │                          │
      │                           │                          │  6. Generate
      │                           │                          │     response
      │                           │                          │
      │                           │  7. Return AI response   │
      │                           │<─────────────────────────┤
      │                           │                          │
      │  8. Send reply to         │                          │
      │     customer              │                          │
      │<──────────────────────────┤                          │
      │                           │                          │
      │                           │  9. Log conversation     │
      │                           │  (chatLogs array)        │
      │                           │                          │
      │                           │  10. Update stats        │
      │                           │  (totalMessages++)       │
      │                           │                          │
```

---

## 🔌 Platform Connection Flow

### Telegram

```
Admin Panel                    Server                  Telegram API
     │                            │                          │
     │  1. Enter bot token        │                          │
     │                            │                          │
     │  2. POST /api/admin/       │                          │
     │     connect/telegram       │                          │
     ├───────────────────────────>│                          │
     │                            │                          │
     │                            │  3. Save to .env         │
     │                            │     TELEGRAM_BOT_TOKEN   │
     │                            │                          │
     │                            │  4. Initialize bot       │
     │                            ├─────────────────────────>│
     │                            │                          │
     │                            │  5. Confirm connection   │
     │                            │<─────────────────────────┤
     │                            │                          │
     │  6. {success: true}        │                          │
     │<───────────────────────────┤                          │
     │                            │                          │
     │  7. Update UI status       │                          │
     │     "Connected"            │                          │
     │                            │                          │
```

### Instagram (OAuth)

```
Admin Panel                Server                 Meta/Instagram
     │                        │                          │
     │  1. Click "Connect"    │                          │
     │                        │                          │
     │  2. GET /api/admin/    │                          │
     │     instagram/oauth/   │                          │
     │     auth-url           │                          │
     ├───────────────────────>│                          │
     │                        │                          │
     │  3. Return auth URL    │                          │
     │<───────────────────────┤                          │
     │                        │                          │
     │  4. Redirect user      │                          │
     │     to Instagram       │                          │
     ├────────────────────────┼─────────────────────────>│
     │                        │                          │
     │                        │                          │  5. User authorizes
     │                        │                          │
     │  6. Callback with code │                          │
     │<───────────────────────┼──────────────────────────┤
     │                        │                          │
     │  7. POST /api/admin/   │                          │
     │     instagram/oauth/   │                          │
     │     exchange           │                          │
     ├───────────────────────>│                          │
     │                        │                          │
     │                        │  8. Exchange code for    │
     │                        │     access token         │
     │                        ├─────────────────────────>│
     │                        │                          │
     │                        │  9. Return tokens        │
     │                        │<─────────────────────────┤
     │                        │                          │
     │                        │  10. Save to .env        │
     │                        │      INSTAGRAM_*         │
     │                        │                          │
     │  11. {connected: true} │                          │
     │<───────────────────────┤                          │
     │                        │                          │
```

---

## 💾 Data Storage Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     File System Storage                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📄 sessions.json                                           │
│  {                                                          │
│    "session_123": {                                         │
│      "email": "admin@replai.com",                           │
│      "name": "Admin User",                                  │
│      "createdAt": "2026-07-23T10:00:00Z"                    │
│    }                                                        │
│  }                                                          │
│                                                             │
│  📄 business-info.json                                      │
│  {                                                          │
│    "business": {                                            │
│      "name": "My Shop",                                     │
│      "description": "...",                                  │
│      "services": [...],                                     │
│      "hours": {...},                                        │
│      "contact": {...},                                      │
│      "faqs": [...]                                          │
│    }                                                        │
│  }                                                          │
│                                                             │
│  📄 ai-settings.json                                        │
│  {                                                          │
│    "language": "en",                                        │
│    "responseStyle": "friendly",                             │
│    "maxLength": "medium"                                    │
│  }                                                          │
│                                                             │
│  📄 bookings.json                                           │
│  {                                                          │
│    "bookings": [                                            │
│      {                                                      │
│        "id": "b_123",                                       │
│        "customerName": "John Doe",                          │
│        "service": "Haircut",                                │
│        "date": "2026-07-23",                                │
│        "time": "10:00",                                     │
│        "status": "confirmed"                                │
│      }                                                      │
│    ]                                                        │
│  }                                                          │
│                                                             │
│  📄 .env                                                    │
│  AI_PROVIDER=groq                                           │
│  GROQ_API_KEY=xxx                                           │
│  TELEGRAM_BOT_TOKEN=xxx                                     │
│  INSTAGRAM_ACCESS_TOKEN=xxx                                 │
│  ...                                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Real-Time Updates

```
┌────────────────────────────────────────────────────────────┐
│              Dashboard Auto-Refresh System                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Every 30 seconds:                                         │
│                                                            │
│  1. fetch('/api/admin/stats')                              │
│     └─> Update stat cards                                 │
│                                                            │
│  2. fetch('/api/admin/chat-logs')                          │
│     └─> Update chat logs section                          │
│     └─> Refresh charts with new data                      │
│                                                            │
│  3. fetch('/api/admin/platform-status')                    │
│     └─> Update connection status badges                   │
│                                                            │
│  4. fetch('/api/instagram/poll', {method: 'POST'})         │
│     └─> Check for new Instagram messages                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🛣️ Complete Request/Response Examples

### 1. Login Request
```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "admin@replai.com",
  "password": "admin123"
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "sessionId": "session_1721734800123_abc123",
  "user": {
    "email": "admin@replai.com",
    "name": "Admin User"
  }
}
```

---

### 2. Get Stats Request
```http
GET /api/admin/stats HTTP/1.1
X-Session-ID: session_1721734800123_abc123
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "totalMessages": 142,
  "todayMessages": 23,
  "connectedPlatforms": 2
}
```

---

### 3. Save Business Info Request
```http
POST /api/admin/business-info HTTP/1.1
Content-Type: application/json
X-Session-ID: session_1721734800123_abc123

{
  "name": "Coffee Shop",
  "description": "Best coffee in town",
  "products": "Latte - $5\nCappuccino - $4.50",
  "hours": "Mon-Fri: 7:00-19:00\nSat-Sun: 8:00-16:00",
  "contact": "+1234567890, info@coffee.com",
  "faqs": "Q: Wi-Fi? | A: Yes, free Wi-Fi"
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true
}
```

---

### 4. Create Booking Request
```http
POST /api/admin/bookings HTTP/1.1
Content-Type: application/json
X-Session-ID: session_1721734800123_abc123

{
  "customerName": "Jane Smith",
  "customerPhone": "+1234567890",
  "service": "Haircut",
  "date": "2026-07-25",
  "time": "14:00",
  "notes": "First visit"
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "booking": {
    "id": "b_1721734900456_xyz789",
    "customerName": "Jane Smith",
    "customerPhone": "+1234567890",
    "service": "Haircut",
    "date": "2026-07-25",
    "time": "14:00",
    "notes": "First visit",
    "status": "confirmed",
    "createdAt": "2026-07-23T12:30:00.456Z"
  }
}
```

---

## 📊 State Management

```
┌──────────────────────────────────────────────────────────┐
│                   Browser (Frontend)                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  localStorage:                                           │
│  ├─ sessionId: "session_..."                             │
│  ├─ user: {...}                                          │
│  ├─ theme: "light" | "dark" | "auto"                     │
│  ├─ replai-language: "en" | "ru" | "ky"                  │
│  └─ onboardingCompleted: "true" | "false"                │
│                                                          │
│  In-Memory (JavaScript):                                 │
│  ├─ peakHoursChart: Chart instance                       │
│  ├─ platformChart: Chart instance                        │
│  ├─ dailyTrendChart: Chart instance                      │
│  └─ allBookingsCache: Array of bookings                  │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    Server (Backend)                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  In-Memory (Node.js):                                    │
│  ├─ sessions: Map (sessionId → session)                  │
│  ├─ users: Map (email → user)                            │
│  ├─ chatLogs: Array (last 100 messages)                  │
│  ├─ stats: {totalMessages, todayMessages}                │
│  └─ platformConnections: {telegram, instagram, ...}      │
│                                                          │
│  Persistent Storage:                                     │
│  ├─ sessions.json ──> Saved every 5 min                  │
│  ├─ bookings.json ──> Saved on every change              │
│  ├─ business-info.json ──> Saved on user action          │
│  ├─ ai-settings.json ──> Saved on user action            │
│  └─ .env ──> Saved on platform connection                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Layers

```
┌──────────────────────────────────────────────────────────┐
│                     Security Flow                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: Authentication Check                           │
│  ├─ Every page load checks sessionId                     │
│  ├─ Invalid session → redirect to login                  │
│  └─ Session expires after 24 hours                       │
│                                                          │
│  Layer 2: API Request Validation                         │
│  ├─ Check X-Session-ID header                            │
│  ├─ Verify session exists and valid                      │
│  └─ Return 401 if unauthorized                           │
│                                                          │
│  Layer 3: Input Sanitization                             │
│  ├─ Validate all form inputs                             │
│  ├─ Check required fields                                │
│  └─ Prevent injection attacks                            │
│                                                          │
│  Layer 4: HTTPS (Production)                             │
│  ├─ Encrypt all traffic                                  │
│  ├─ Secure cookies                                       │
│  └─ OAuth redirect URIs                                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Takeaways

1. **Frontend**: `admin-new.html` and `login.html` contain all UI
2. **Backend**: `server-new.js` handles all API requests
3. **AI**: `ai-engine-free.js` generates intelligent responses
4. **Storage**: JSON files persist data between restarts
5. **Auth**: Session-based authentication with localStorage
6. **Real-time**: Polling every 30s for updates
7. **Platforms**: Webhooks receive messages, AI responds
8. **Secure**: Multi-layer validation and session management

**Everything is already connected and ready to use!** 🚀

