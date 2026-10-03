# 🎯 Simple Meta-Prompt (Copy to Any AI)

**Give this to ChatGPT, Gemini, or any AI to generate a Claude-ready prompt:**

---

Create a detailed technical prompt that I can give to Claude AI to build a complete Node.js application called **REPLAI** - a multi-platform AI messaging hub.

## What REPLAI Does:
- Receives customer messages from Instagram, Telegram, and WhatsApp
- Uses AI (Groq's free LLaMA 3.3) to automatically respond
- Manages appointment bookings with availability checking
- Has a complete admin dashboard to manage everything
- Includes authentication, session management, and security

## Technical Requirements:

**Backend:**
- Node.js with Express.js
- ES6 modules (import/export)
- File-based JSON storage (no database)
- bcryptjs for passwords
- Twilio for WhatsApp

**Frontend:**
- Pure HTML/CSS/JavaScript (NO frameworks)
- Single-page admin panel
- Responsive design with dark mode

**Core Features to Build:**

1. **Authentication System**
   - Register/Login with email and password
   - bcrypt password hashing
   - Session management (24-hour expiration)
   - Rate limiting (10 attempts per 15 min)
   - Sessions persist to JSON file

2. **AI Response Engine (ai-engine-free.js)**
   - Groq API integration (FREE)
   - Conversation history (last 10 messages)
   - Context-aware with business info
   - Multi-language (English, Russian, Kyrgyz)
   - Booking-aware responses

3. **Booking System**
   - CRUD operations
   - Available time slot checker (30-min intervals)
   - Prevent double-booking
   - Parse business hours from JSON
   - Support for closed days

4. **Admin Panel (admin-new.html)**
   - Dashboard with stats
   - Business info editor (hours, services, FAQs)
   - AI settings (provider, language, style)
   - Bookings management
   - Chat logs viewer
   - Platform connections
   - Dark mode toggle

5. **Platform Webhooks**
   - Instagram: POST /webhook/instagram (Meta Graph API)
   - Telegram: POST /webhook/telegram (Bot API)
   - WhatsApp: POST /webhook/twilio (Twilio SDK)

**Files to Create:**
```
server-new.js          # Main Express server
ai-engine-free.js      # AI response engine
admin-new.html         # Admin dashboard
login.html             # Auth page
package.json           # Dependencies
.env.example           # Environment template
business-info.json     # Business data
ai-settings.json       # AI config
users.json             # User accounts
sessions.json          # Active sessions
bookings.json          # Customer bookings
README.md              # Documentation
```

**API Endpoints Needed:**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/verify
POST /api/admin/bookings
GET /api/admin/bookings
GET /api/admin/bookings/available
PATCH /api/admin/bookings/:id
DELETE /api/admin/bookings/:id
GET /api/admin/settings
POST /api/admin/settings
POST /api/admin/ai-settings
POST /webhook/instagram
POST /webhook/telegram
POST /webhook/twilio
```

**Environment Variables:**
```
AI_PROVIDER=groq
GROQ_API_KEY=your_key
PORT=3000
INSTAGRAM_APP_ID=
TELEGRAM_BOT_TOKEN=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
WEBHOOK_VERIFY_TOKEN=
```

**Key Functions:**
```javascript
// Booking helpers
function generateBookingId()
function getAvailableSlotsFor(date, service)
function parseTimeToMinutes(time)
function minutesToTime(minutes)

// Session helpers
function loadSessions()
function saveSessions()
function cleanupExpiredSessions()

// User helpers
function loadUsers()
function saveUsers(data)
function getUserByEmail(email)

// AI functions
export async function getAIResponse(userId, message, language)
```

**Sample Business Data:**
```json
{
  "business": {
    "name": "Aida Beauty Salon",
    "description": "Professional beauty salon",
    "hours": {
      "monday": "09:00-20:00",
      "tuesday": "09:00-20:00",
      "sunday": "closed"
    },
    "services": [
      {
        "name": "Women's haircut",
        "price": "800 сом",
        "duration": 60
      }
    ],
    "contact": {
      "phone": "+996555123456",
      "email": "salon@example.com"
    }
  }
}
```

**Implementation Phases:**
1. Core setup (Express, package.json, health check)
2. Authentication (register, login, sessions)
3. AI Engine (Groq integration, prompts)
4. Admin Panel (dashboard, editors)
5. Bookings (CRUD, availability)
6. Webhooks (Instagram, Telegram, WhatsApp)
7. Polish (errors, loading, docs)

**Success Criteria:**
- Server starts on port 3000
- Can register and login
- Sessions persist across restart
- Admin panel works on mobile
- AI responds to messages
- Bookings prevent double-booking
- All webhooks handle incoming messages
- Complete README included

**Security:**
- bcrypt 10 rounds for passwords
- Rate limit login attempts
- Validate all inputs
- Session expiration after 24 hours
- No API keys in client code

---

Please generate a COMPLETE, DETAILED prompt (at least 800-1000 lines) that includes:
- Full technical specifications
- All file structures and code examples
- Step-by-step implementation guide
- Helper function implementations
- Complete API documentation
- Testing checklist
- Deployment instructions
- Troubleshooting guide

The prompt should be so comprehensive that Claude can build the entire working application without needing to ask clarifying questions.

Make it production-ready, well-documented, and follow all best practices.

Generate the full Claude prompt now!
