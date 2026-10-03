# 🎯 Meta-Prompt Generator for REPLAI

## Instructions: Give this to ANY AI to generate a Claude-ready prompt

---

**Copy everything below this line and give it to ChatGPT, Gemini, or any AI:**

---

# Generate a Complete Build Prompt for Claude

I need you to create a comprehensive, detailed prompt that I can give to Claude (Anthropic's AI) to build a complete multi-platform AI messaging hub called **REPLAI** from scratch.

## Context:
REPLAI is a Node.js application that uses AI to automatically respond to customer messages across Instagram, Telegram, and WhatsApp. It includes a booking system, admin panel, and full authentication.

## Your Task:
Generate a single, comprehensive prompt that includes ALL of the following specifications. The prompt should be ready to copy-paste directly to Claude.

---

## Required Specifications to Include:

### 1. Project Overview
- Multi-platform AI messaging hub
- Node.js backend with Express.js
- Vanilla JavaScript frontend (no frameworks)
- File-based JSON storage
- RESTful API architecture
- ES6 modules (type: "module")

### 2. Technology Stack
**Backend:**
- Express.js for server
- bcryptjs for password hashing
- dotenv for environment variables
- node-fetch for API calls
- Twilio SDK for WhatsApp
- ES6+ import/export modules

**Frontend:**
- Pure HTML/CSS/JavaScript
- No React, Vue, or Angular
- Responsive design
- Dark mode support

**AI Provider:**
- Primary: Groq API (FREE - LLaMA 3.3 70B)
- Support for: Hugging Face, OpenRouter, Together AI
- Configurable provider selection

### 3. Core Features to Implement

#### A. Authentication System
- Email/password registration
- Login with bcrypt hashing (10 rounds)
- Session management (24-hour expiration)
- Rate limiting: 10 login attempts per 15 minutes per IP
- Session persistence to sessions.json file
- Google OAuth (optional)
- Logout functionality

**API Endpoints:**
```
POST /api/auth/register
POST /api/auth/login  
POST /api/auth/logout
GET /api/auth/verify
GET /api/auth/google
GET /api/auth/google/callback
```

#### B. AI Response Engine (ai-engine-free.js)
- Load business info from business-info.json
- Create context-aware system prompts with:
  - Business name, description, hours
  - Services and pricing
  - Contact info
  - FAQs
  - Current customer bookings
  - Reserved time slots
- Maintain conversation history (last 10 messages per user)
- Multi-language support (English, Russian, Kyrgyz, auto-detect)
- Fallback error messages

**Key Functions:**
```javascript
export async function getAIResponse(userId, userMessage, language = 'auto')
export function getUserBookings(userId)
export function clearHistory(userId)
```

**Groq Integration:**
- API: https://api.groq.com/openai/v1/chat/completions
- Model: llama-3.3-70b-versatile
- Max tokens: 200
- Temperature: 0.3

#### C. Booking System
- Create, read, update, delete bookings
- Check available time slots (30-minute intervals)
- Prevent double-booking
- Parse business hours from JSON
- Support "closed" days
- Filter by date, status, customer
- Manual admin bookings
- AI-assisted bookings

**API Endpoints:**
```
POST /api/admin/bookings
GET /api/admin/bookings?date=YYYY-MM-DD
GET /api/admin/bookings/available?date=YYYY-MM-DD&service=ServiceName
GET /api/admin/bookings/:id
PATCH /api/admin/bookings/:id
DELETE /api/admin/bookings/:id
```

**Booking Object:**
```json
{
  "id": "b_timestamp_random",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "service": "Service Name",
  "date": "2024-12-25",
  "time": "14:00",
  "notes": "Optional notes",
  "platform": "instagram",
  "userId": "platform_user_id",
  "status": "confirmed",
  "createdAt": "ISO timestamp"
}
```

Status types: confirmed, completed, cancelled, no-show

#### D. Platform Integrations

**Instagram (Meta Graph API v23.0+):**
- OAuth 2.0 flow
- Permissions: instagram_business_basic, instagram_business_manage_messages, instagram_business_manage_comments
- Webhook endpoint: POST /webhook/instagram
- Verify token validation
- Send AI responses via Graph API
- Store access token in .env

**Telegram:**
- Bot token from @BotFather
- Webhook endpoint: POST /webhook/telegram
- Send messages via Telegram Bot API
- Extract user ID and message text

**WhatsApp (Twilio):**
- Twilio Account SID and Auth Token
- Webhook endpoint: POST /webhook/twilio
- Parse form-urlencoded data (Body, From fields)
- Send via Twilio SDK

#### E. Admin Panel (admin-new.html)
Single-page application with these sections:

1. **Dashboard**
   - Today's message count
   - Total messages
   - Platform connection status
   - Recent activity feed

2. **Business Info**
   - Name, description
   - Hours per day (Monday-Sunday)
   - Services with price and duration
   - Contact information
   - FAQs management

3. **AI Settings**
   - Provider selection dropdown
   - Language (EN, RU, KY, Auto)
   - Response style (Professional, Friendly, Casual)
   - Max length (Short, Medium, Long)

4. **Bookings**
   - Create booking form
   - List view with filters
   - Status management
   - Available slots checker

5. **Chat Logs**
   - Real-time message display
   - Filter by platform
   - Conversation history

6. **Connect Platforms**
   - Instagram OAuth button
   - Telegram setup instructions
   - WhatsApp configuration
   - Connection status indicators

7. **Settings**
   - User profile
   - Change password
   - System health check

**UI Requirements:**
- Responsive (mobile-friendly)
- Dark mode toggle
- Loading states
- Error messages
- Toast notifications
- Tab navigation
- Form validation

### 4. File Structure
```
replai/
├── server-new.js
├── ai-engine-free.js
├── admin-new.html
├── login.html
├── privacy-policy.html
├── package.json
├── .env (DO NOT COMMIT)
├── .env.example
├── .gitignore
├── railway.json
├── business-info.json
├── ai-settings.json
├── users.json
├── sessions.json
└── bookings.json
```

### 5. Data File Structures

**business-info.json:**
```json
{
  "business": {
    "name": "Your Business",
    "description": "Description",
    "hours": {
      "monday": "09:00-17:00",
      "tuesday": "09:00-17:00",
      "wednesday": "09:00-17:00",
      "thursday": "09:00-17:00",
      "friday": "09:00-17:00",
      "saturday": "10:00-15:00",
      "sunday": "closed"
    },
    "services": [
      {
        "name": "Service Name",
        "description": "Description",
        "price": "Price",
        "duration": 60
      }
    ],
    "contact": {
      "phone": "+1234567890",
      "email": "email@example.com",
      "address": "Address",
      "website": "https://website.com"
    },
    "faqs": [
      {
        "question": "Question?",
        "answer": "Answer."
      }
    ],
    "serviceDuration": 30
  }
}
```

**users.json:**
```json
{
  "users": [
    {
      "email": "admin@replai.com",
      "name": "Admin",
      "passwordHash": "$2b$10$...",
      "createdAt": "ISO timestamp"
    }
  ]
}
```

**ai-settings.json:**
```json
{
  "provider": "groq",
  "style": "professional",
  "language": "auto",
  "maxLength": "medium"
}
```

### 6. Environment Variables (.env)
```bash
# AI Configuration
AI_PROVIDER=groq
GROQ_API_KEY=your_api_key

# Server
PORT=3000
NODE_ENV=development

# Instagram
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/admin/instagram/oauth/callback
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_USER_ID=
INSTAGRAM_USERNAME=
INSTAGRAM_TOKEN_EXPIRES_AT=

# Telegram
TELEGRAM_BOT_TOKEN=

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=whatsapp:+14155238886

# Webhooks
WEBHOOK_VERIFY_TOKEN=your_secure_token

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### 7. Helper Functions Needed

**Booking Helpers:**
```javascript
function generateBookingId()
function parseTimeToMinutes(time) // "14:30" -> 870
function minutesToTime(minutes) // 870 -> "14:30"
function getDayKey(dateString) // "2024-12-25" -> "monday"
function getAvailableSlotsFor(date, service)
function readBookingsStore()
function writeBookingsStore(store)
```

**Session Helpers:**
```javascript
function loadSessions()
function saveSessions()
function cleanupExpiredSessions()
function loadUsers()
function saveUsers(usersData)
function getUserByEmail(email)
function addUser(user)
```

**Environment Helpers:**
```javascript
function upsertEnvValues(values) // Update .env programmatically
```

### 8. Implementation Phases

**Phase 1: Core Setup**
1. Create package.json with dependencies
2. Set up Express server
3. Add health check endpoint
4. Create .env.example
5. Test server starts

**Phase 2: Authentication**
1. Implement registration endpoint
2. Implement login with bcrypt
3. Add session management
4. Add rate limiting
5. Create login.html
6. Test auth flow

**Phase 3: AI Engine**
1. Create ai-engine-free.js
2. Add Groq integration
3. Implement system prompt
4. Add conversation history
5. Add fallback handling
6. Test AI responses

**Phase 4: Admin Panel**
1. Create admin-new.html structure
2. Add navigation tabs
3. Build dashboard
4. Build business info editor
5. Build AI settings
6. Build chat logs viewer

**Phase 5: Bookings**
1. Create booking endpoints
2. Implement availability logic
3. Prevent double-booking
4. Build booking UI
5. Test booking flow

**Phase 6: Platform Webhooks**
1. Instagram webhook
2. Telegram webhook
3. WhatsApp webhook
4. Test each platform

**Phase 7: Polish**
1. Error handling
2. Loading states
3. Toast notifications
4. Mobile responsiveness
5. Documentation

### 9. Security Requirements
- bcrypt with 10 rounds for passwords
- Never store plain text passwords
- Validate email format
- Minimum 8 characters for passwords
- 24-hour session expiration
- Rate limiting: 10 attempts per 15 min per IP
- Session validation on all admin routes
- CSRF protection via session tokens

### 10. Testing Checklist
The built project should pass these tests:
- [ ] Server starts successfully
- [ ] Health check returns "OK"
- [ ] Can register new user
- [ ] Can login with correct password
- [ ] Cannot login with wrong password
- [ ] Rate limiting blocks after 10 attempts
- [ ] Session persists across server restart
- [ ] Can create booking
- [ ] Cannot double-book same time slot
- [ ] Available slots are correct
- [ ] AI responds to test message
- [ ] Admin panel loads
- [ ] All sections work
- [ ] Mobile responsive

### 11. Success Criteria
- All files created and working
- Server runs on port 3000
- No errors in console
- Admin login works
- Sample data included
- Complete documentation
- Ready for deployment

---

## Output Format for Generated Prompt:

Please structure your generated prompt like this:

```
# Build REPLAI - AI Messaging Hub

I need you to build a complete multi-platform AI messaging hub called REPLAI from scratch.

## Project Overview
[Detailed overview]

## Technology Stack
[List all technologies]

## Core Features
[Detailed feature descriptions]

## File Structure
[Show all files to create]

## Implementation Steps
[Step-by-step guide]

## Code Examples
[Provide code snippets for key functions]

## Testing
[What to test]

## Deployment
[How to deploy]

Make sure the project is production-ready and follows all best practices.
```

---

## Important Notes for Your Generated Prompt:

1. **Be Extremely Detailed** - Claude works best with comprehensive specifications
2. **Include Code Examples** - Show key function signatures and structures
3. **Specify File Order** - Tell Claude which files to create first
4. **Include Sample Data** - Provide example business-info.json content
5. **Error Handling** - Mention to add try-catch blocks everywhere
6. **Documentation** - Ask for a complete README.md
7. **Testing** - Include instructions to test each feature
8. **Deployment** - Add Railway/Render deployment configs

---

## Generate the Prompt Now

Please create a comprehensive, production-ready prompt (at least 1000 lines) that I can copy and give to Claude to build this entire REPLAI project from zero. Make it detailed enough that Claude can build everything without asking clarifying questions.

The prompt should result in a fully working application with:
- Complete authentication system
- AI-powered responses
- Booking management
- Admin dashboard
- Multi-platform webhooks
- Full documentation
- Production-ready code

Go ahead and generate the complete Claude prompt!
