# 🚀 REPLAI API Quick Reference Card

## 🔐 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Email/password login |
| `POST` | `/api/auth/logout` | Logout user |
| `GET` | `/api/auth/verify` | Verify session (Header: X-Session-ID) |
| `GET` | `/api/auth/google` | Get Google OAuth URL |
| `GET` | `/api/auth/facebook` | Get Facebook OAuth URL |
| `GET` | `/api/auth/google/callback` | Google OAuth callback |
| `GET` | `/api/auth/facebook/callback` | Facebook OAuth callback |

**Example Login:**
```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'admin@replai.com',
    password: 'admin123'
  })
})
```

---

## 📊 Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/stats` | Get message statistics |
| `GET` | `/api/admin/chat-logs` | Get conversation history |
| `GET` | `/api/admin/platform-status` | Get platform connection status |
| `GET` | `/api/admin/settings` | Get all settings |

**Example Stats:**
```javascript
fetch('/api/admin/stats')
  .then(r => r.json())
  .then(data => {
    // { totalMessages: 42, todayMessages: 15 }
  })
```

---

## 🔌 Platform Connection Endpoints

### Telegram
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/admin/connect/telegram` | `{token}` | Connect Telegram bot |

### Instagram
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/instagram/oauth/auth-url` | Get Instagram auth URL |
| `POST` | `/api/admin/instagram/oauth/exchange` | Exchange code for token |
| `POST` | `/api/admin/instagram/oauth/refresh` | Refresh access token |
| `GET` | `/api/admin/instagram/status` | Check connection status |
| `POST` | `/api/instagram/poll` | Poll for new messages |

### WhatsApp
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/connect/whatsapp/qr` | Get QR code for linking |
| `POST` | `/api/admin/connect/whatsapp/settings` | Save WhatsApp settings |

### TikTok
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/admin/connect/tiktok` | `{token}` | Connect TikTok account |

---

## 🏢 Business Information Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/settings` | - | Get business settings |
| `POST` | `/api/admin/settings` | Full settings object | Save all settings |
| `POST` | `/api/admin/business-info` | Business data | Save business information |
| `POST` | `/api/admin/ai-settings` | AI config | Save AI settings |

**Save Business Info:**
```javascript
fetch('/api/admin/business-info', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'Coffee Shop',
    description: 'Best coffee',
    products: 'Latte - $5\nCappuccino - $4.50',
    hours: 'Mon-Fri: 7:00-19:00',
    contact: '+1234567890',
    faqs: 'Q: WiFi? | A: Yes'
  })
})
```

---

## 📅 Booking Endpoints

| Method | Endpoint | Body/Query | Description |
|--------|----------|------------|-------------|
| `GET` | `/api/admin/bookings?date=YYYY-MM-DD` | - | List bookings (optionally by date) |
| `GET` | `/api/admin/bookings/:id` | - | Get single booking |
| `GET` | `/api/admin/bookings/available?date=&service=` | - | Get available time slots |
| `POST` | `/api/admin/bookings` | Booking data | Create new booking |
| `PATCH` | `/api/admin/bookings/:id` | `{status, notes}` | Update booking |
| `DELETE` | `/api/admin/bookings/:id` | - | Cancel booking |

**Create Booking:**
```javascript
fetch('/api/admin/bookings', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    service: 'Haircut',
    date: '2026-07-25',
    time: '14:00',
    notes: 'First visit'
  })
})
```

**Update Status:**
```javascript
fetch('/api/admin/bookings/b_123', {
  method: 'PATCH',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    status: 'confirmed'  // pending, confirmed, completed, cancelled
  })
})
```

---

## 📬 Webhook Endpoints (Platform Incoming)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/webhook/twilio` | Twilio WhatsApp incoming |
| `POST` | `/webhook/telegram` | Telegram incoming (if configured) |
| `POST` | `/webhook/instagram` | Instagram incoming (Meta webhook) |

---

## 🎨 Static Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Login page (login.html) |
| `GET` | `/admin` | Admin dashboard (admin-new.html) |
| `GET` | `/privacy-policy` | Privacy policy page |
| `GET` | `/api/health` | Health check (returns "OK") |

---

## 🔑 Required Headers

### For Protected Routes:
```javascript
headers: {
  'X-Session-ID': localStorage.getItem('sessionId'),
  'Content-Type': 'application/json'
}
```

---

## 📦 Request Body Formats

### Login
```json
{
  "email": "admin@replai.com",
  "password": "admin123"
}
```

### Business Info
```json
{
  "name": "My Business",
  "description": "What we do",
  "products": "Item1 - $10\nItem2 - $20",
  "hours": "Mon-Fri: 9-5",
  "contact": "phone, email, address",
  "faqs": "Q: Question? | A: Answer"
}
```

### AI Settings
```json
{
  "language": "en",
  "responseStyle": "friendly",
  "responseLanguage": "auto",
  "maxLength": "medium"
}
```

### Create Booking
```json
{
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "service": "Haircut",
  "date": "2026-07-25",
  "time": "14:00",
  "notes": "Optional notes",
  "platform": "admin",
  "userId": ""
}
```

### Update Booking
```json
{
  "status": "confirmed",
  "notes": "Updated notes"
}
```

### Connect Telegram
```json
{
  "token": "123456:ABC-DEF..."
}
```

### Connect TikTok
```json
{
  "token": "your_tiktok_token"
}
```

---

## 📤 Response Formats

### Successful Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional information"
}
```

### Stats Response
```json
{
  "totalMessages": 142,
  "todayMessages": 23,
  "connectedPlatforms": 2
}
```

### Chat Logs Response
```json
[
  {
    "platform": "telegram",
    "userId": "12345",
    "userName": "John",
    "userMessage": "Hello",
    "aiResponse": "Hi! How can I help?",
    "timestamp": "2026-07-23T10:30:00Z",
    "type": "message"
  }
]
```

### Platform Status Response
```json
{
  "telegram": {
    "connected": true,
    "token": "123456:ABC..."
  },
  "instagram": {
    "connected": true,
    "username": "@myaccount",
    "accessToken": "...",
    "userId": "12345",
    "expiresAt": "2026-08-23T00:00:00Z"
  },
  "whatsapp": {
    "connected": false,
    "token": null,
    "phone": null
  }
}
```

### Bookings List Response
```json
{
  "bookings": [
    {
      "id": "b_1721734900456_xyz789",
      "customerName": "Jane Smith",
      "customerPhone": "+1234567890",
      "service": "Haircut",
      "date": "2026-07-25",
      "time": "14:00",
      "notes": "First visit",
      "status": "confirmed",
      "platform": "admin",
      "userId": "",
      "createdAt": "2026-07-23T12:30:00.456Z"
    }
  ]
}
```

### Available Slots Response
```json
{
  "slots": [
    "09:00", "09:30", "10:00", "10:30",
    "14:00", "14:30", "15:00"
  ]
}
```

---

## ⚡ Testing from Browser Console

### Test Authentication
```javascript
// Login
fetch('/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'admin@replai.com',
    password: 'admin123'
  })
}).then(r => r.json()).then(console.log)

// Verify session
fetch('/api/auth/verify', {
  headers: {'X-Session-ID': localStorage.getItem('sessionId')}
}).then(r => r.json()).then(console.log)
```

### Test Dashboard
```javascript
// Get stats
fetch('/api/admin/stats')
  .then(r => r.json())
  .then(console.log)

// Get chat logs
fetch('/api/admin/chat-logs')
  .then(r => r.json())
  .then(console.log)

// Get platform status
fetch('/api/admin/platform-status')
  .then(r => r.json())
  .then(console.log)
```

### Test Bookings
```javascript
// List bookings
fetch('/api/admin/bookings')
  .then(r => r.json())
  .then(console.log)

// Create booking
fetch('/api/admin/bookings', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    customerName: 'Test User',
    customerPhone: '+1234567890',
    service: 'Test Service',
    date: '2026-07-25',
    time: '10:00',
    notes: 'Test booking'
  })
}).then(r => r.json()).then(console.log)

// Get available slots
fetch('/api/admin/bookings/available?date=2026-07-25&service=Haircut')
  .then(r => r.json())
  .then(console.log)
```

---

## 🔐 Authentication Flow

```
1. POST /api/auth/login
   ↓
2. Server creates session
   ↓
3. Returns {sessionId, user}
   ↓
4. Store sessionId in localStorage
   ↓
5. Include in all requests:
   Header: X-Session-ID: {sessionId}
   ↓
6. Session valid for 24 hours
   ↓
7. POST /api/auth/logout to end session
```

---

## 📝 Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (invalid input) |
| `401` | Unauthorized (invalid session) |
| `404` | Not Found |
| `409` | Conflict (e.g., time slot taken) |
| `500` | Server Error |

---

## 🔄 Polling Intervals

| What | Interval |
|------|----------|
| Dashboard stats | 30 seconds |
| Chat logs | 30 seconds |
| Platform status | 30 seconds |
| Instagram messages | 30 seconds |
| Session save | 5 minutes |

---

## 💾 Data Storage

| File | Content | Auto-Save |
|------|---------|-----------|
| `sessions.json` | User sessions | Every 5 min |
| `business-info.json` | Business data | On change |
| `ai-settings.json` | AI config | On change |
| `bookings.json` | Appointments | On change |
| `.env` | API keys | Manual only |

---

## 🎯 Quick Commands

### Start Server
```bash
node server-new.js
```

### Different Port
```bash
PORT=3001 node server-new.js
```

### Check Server Running
```bash
curl http://localhost:3000/api/health
# Should return: OK
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@replai.com","password":"admin123"}'
```

### Get Stats
```bash
curl http://localhost:3000/api/admin/stats
```

---

## 📱 Access URLs

| Environment | URL |
|-------------|-----|
| Local | http://localhost:3000 |
| Local network | http://YOUR_IP:3000 |
| Production | https://your-domain.com |
| Railway | https://your-app.up.railway.app |

---

## 🚨 Common Errors

| Error | Solution |
|-------|----------|
| "Session not found" | Login again |
| "EADDRINUSE" | Port already in use, kill process |
| "Module not found" | Run `npm install` |
| "Invalid token" | Check API keys in `.env` |
| "Unauthorized" | Session expired, login again |

---

## 📞 Quick Support Checklist

If something's not working:

1. ✅ Server running? Check console
2. ✅ Logged in? Check localStorage.getItem('sessionId')
3. ✅ API responding? Test `/api/health`
4. ✅ .env configured? Check required keys
5. ✅ Browser console errors? Open DevTools
6. ✅ Network errors? Check Network tab

---

**Keep this reference handy for quick API lookups!** 📋

*Last updated: July 23, 2026*
