# 🤖 Build REPLAI from Zero - Complete Claude Prompt

## 📋 Project Overview

I need you to build a complete multi-platform AI messaging hub called **REPLAI** that handles customer inquiries across Instagram, Telegram, and WhatsApp using AI automation.

---

## 🎯 Core Requirements

### 1. **Project Type**
- Node.js backend application using Express.js
- ES Modules (type: "module" in package.json)
- Single-page admin panel (vanilla JavaScript, no frameworks)
- RESTful API architecture

### 2. **Technology Stack**

**Backend:**
- Node.js with Express.js
- ES6+ modules (import/export)
- File-based storage (JSON files)
- bcryptjs for password hashing
- dotenv for environment variables
- node-fetch for API calls
- Twilio SDK for WhatsApp

**Frontend:**
- Vanilla HTML/CSS/JavaScript
- No frameworks (React, Vue, etc.)
- Responsive design
- Dark/light theme support

**AI Engine:**
- Groq API (primary - FREE)
- Support for multiple providers:
  - Hugging Face
  - OpenRouter
  - Together AI
- Configurable provider selection

---

## 🏗️ Project Structure

```
replai/
├── server-new.js              # Main Express server
├── ai-engine-free.js          # AI response engine with multi-provider support
├── admin-new.html             # Admin panel UI
├── login.html                 # Login/registration page
├── privacy-policy.html        # Privacy policy page
├── package.json               # Dependencies
├── .env                       # Environment variables (DO NOT COMMIT)
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── business-info.json         # Business data storage
├── ai-settings.json           # AI configuration
├── users.json                 # User accounts storage
├── sessions.json              # Active sessions storage
├── bookings.json              # Customer bookings storage
└── railway.json               # Railway deployment config
```

---

## 🔧 Core Features to Implement

### A. Authentication System

**Requirements:**
1. Email/password registration and login
2. Password hashing with bcrypt (10 rounds)
3. Session management (24-hour expiration)
4. Rate limiting: max 10 login attempts per 15 minutes per IP
5. Session persistence to JSON file
6. Google OAuth integration (optional - with proper redirect URI handling)

**API Endpoints:**
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/auth/verify` - Verify session validity
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Handle Google OAuth callback

**Files:**
- `users.json` - Store user accounts
  ```json
  {
    "users": [
      {
        "email": "admin@replai.com",
        "name": "Admin",
        "passwordHash": "$2b$10$...",
        "createdAt": "2026-08-10T15:00:00.000Z"
      }
    ]
  }
  ```
- `sessions.json` - Store active sessions
  ```json
  {
    "session_id": {
      "email": "admin@replai.com",
      "name": "Admin",
      "createdAt": "2026-09-22T10:00:00.000Z",
      "lastActivity": "2026-09-22T12:30:00.000Z"
    }
  }
  ```

**Security:**
- Never store plain text passwords
- Validate email format
- Minimum 8 character passwords
- Auto-cleanup expired sessions
- CSRF protection through session validation

---

### B. AI Response Engine (ai-engine-free.js)

**Core Functionality:**
1. Load business information from JSON
2. Create context-aware system prompts
3. Support multiple AI providers (Groq, Hugging Face, OpenRouter, Together AI)
4. Maintain conversation history per user (last 10 messages)
5. Support booking context awareness
6. Multi-language support (English, Russian, Kyrgyz, auto-detect)

**Key Functions:**
```javascript
export async function getAIResponse(userId, userMessage, language = 'auto')
export function getUserBookings(userId)
export function clearHistory(userId)
```

**System Prompt Structure:**
- Business name and description
- Operating hours
- Services and pricing
- Contact information
- FAQs
- Booking instructions
- Current customer bookings
- Reserved time slots
- Response guidelines

**Response Guidelines:**
1. Short and direct (2-3 sentences max)
2. Professional but friendly tone
3. Use bullet points for lists
4. Only provide factual business information
5. Never make up data
6. Collect booking details: service, date, time, name, phone
7. Check availability before confirming bookings
8. Respond in customer's language (or configured language)

**AI Provider Integration:**

**Groq (Primary - FREE):**
```javascript
// API: https://api.groq.com/openai/v1/chat/completions
// Model: llama-3.3-70b-versatile
// Max tokens: 200
// Temperature: 0.3
```

**Fallback Messages:**
- English, Russian, and Kyrgyz fallback messages
- Include business contact information
- Used when AI provider fails

---

### C. Booking System

**Features:**
1. Create, read, update, delete bookings
2. Check available time slots
3. Prevent double-booking
4. Filter by date, status, customer
5. Support manual admin bookings
6. Support AI-assisted bookings

**Business Hours Logic:**
- Parse hours from business-info.json
- Support "closed" days
- 30-minute time slot intervals
- Configurable service duration
- Check existing bookings to prevent conflicts

**API Endpoints:**
```
POST   /api/admin/bookings              # Create booking
GET    /api/admin/bookings              # List all bookings (filter by date)
GET    /api/admin/bookings/available    # Get available time slots
GET    /api/admin/bookings/:id          # Get single booking
PATCH  /api/admin/bookings/:id          # Update booking status
DELETE /api/admin/bookings/:id          # Cancel booking
```

**Booking Object Structure:**
```json
{
  "id": "b_1726999200_abc123",
  "customerName": "John Doe",
  "customerPhone": "+996555123456",
  "service": "Women's haircut",
  "date": "2026-09-25",
  "time": "14:00",
  "notes": "First time customer",
  "platform": "instagram",
  "userId": "instagram_user_123",
  "status": "confirmed",
  "createdAt": "2026-09-22T10:00:00.000Z"
}
```

**Status Types:** confirmed, completed, cancelled, no-show

---

### D. Platform Integrations

#### 1. Instagram (Meta Graph API v23.0+)

**OAuth 2.0 Flow:**
1. User clicks "Connect Instagram" in admin panel
2. Redirect to Instagram OAuth authorization
3. Request permissions: instagram_business_basic, instagram_business_manage_messages, instagram_business_manage_comments
4. Handle callback with authorization code
5. Exchange code for access token
6. Store token in .env file
7. Get Instagram user ID and username

**Webhook Setup:**
- Endpoint: `POST /webhook/instagram`
- Verify token validation
- Handle incoming messages
- Send AI responses
- Log conversations

**API Integration:**
- Meta Graph API base URL: https://graph.facebook.com/v23.0
- Message sending: POST to /me/messages
- Token refresh support (60-day expiration)

**Environment Variables:**
```
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/admin/instagram/oauth/callback
INSTAGRAM_ACCESS_TOKEN=stored_after_oauth
INSTAGRAM_USER_ID=stored_after_oauth
INSTAGRAM_USERNAME=stored_after_oauth
INSTAGRAM_TOKEN_EXPIRES_AT=stored_after_oauth
```

#### 2. Telegram

**Setup:**
1. Get bot token from @BotFather
2. Store in TELEGRAM_BOT_TOKEN env variable
3. Set webhook: POST to Telegram API with webhook URL

**Webhook:**
- Endpoint: `POST /webhook/telegram`
- Receive messages
- Extract user ID and message text
- Send AI response
- Log conversation

**API:**
- Base URL: https://api.telegram.org/bot{token}
- Send message: POST /sendMessage
- Set webhook: POST /setWebhook

#### 3. WhatsApp (Twilio Sandbox)

**Setup:**
1. Create Twilio account
2. Get Account SID and Auth Token
3. Use Twilio WhatsApp sandbox number
4. Configure webhook URL in Twilio console

**Webhook:**
- Endpoint: `POST /webhook/twilio`
- Parse incoming message (Body, From)
- Generate AI response
- Send via Twilio SDK
- Log conversation

**Environment Variables:**
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
```

#### 4. WhatsApp (Cloud API - Optional)

**Alternative to Twilio:**
- Direct Meta WhatsApp Cloud API
- Requires business verification
- Better for production

**Environment Variables:**
```
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_PHONE_ID=your_phone_id
```

---

### E. Admin Panel (admin-new.html)

**Single-Page Application Structure:**

**Sections:**
1. **Dashboard**
   - Today's statistics
   - Total messages counter
   - Platform connection status
   - Recent activity feed

2. **Business Info**
   - Business name, description
   - Operating hours (per day)
   - Services with pricing
   - Contact information
   - FAQs management

3. **AI Settings**
   - Provider selection (Groq, Hugging Face, etc.)
   - Language preference (English, Russian, Kyrgyz, Auto)
   - Response style (Professional, Friendly, Casual)
   - Max response length (Short, Medium, Long)

4. **Bookings**
   - Calendar view
   - Create new booking form
   - List view with filters
   - Status management
   - Available slots checker

5. **Chat Logs**
   - Real-time message display
   - Filter by platform, date
   - User conversation history
   - Export functionality

6. **Connect Platforms**
   - Instagram OAuth flow
   - Telegram bot setup
   - WhatsApp configuration
   - Connection status indicators

7. **Settings**
   - User profile
   - Change password
   - Export data
   - System health check

**UI Features:**
- Responsive design (mobile-friendly)
- Dark mode support
- Loading states
- Error handling
- Toast notifications
- Modal dialogs
- Tab navigation
- Form validation

**API Integration:**
- Fetch with sessionId in headers
- Handle 401 (redirect to login)
- Error handling with user feedback
- Optimistic updates

---

### F. File Storage Structure

#### business-info.json
```json
{
  "business": {
    "name": "Your Business Name",
    "description": "Business description",
    "hours": {
      "monday": "09:00-20:00",
      "tuesday": "09:00-20:00",
      "wednesday": "09:00-20:00",
      "thursday": "09:00-20:00",
      "friday": "09:00-20:00",
      "saturday": "09:00-20:00",
      "sunday": "closed"
    },
    "services": [
      {
        "name": "Service Name",
        "description": "Service description",
        "price": "Price",
        "duration": 30
      }
    ],
    "contact": {
      "phone": "+1234567890",
      "email": "contact@business.com",
      "address": "Business address",
      "website": "https://website.com"
    },
    "faqs": [
      {
        "question": "Question text",
        "answer": "Answer text"
      }
    ],
    "serviceDuration": 30
  }
}
```

#### ai-settings.json
```json
{
  "provider": "groq",
  "style": "professional",
  "language": "auto",
  "maxLength": "medium"
}
```

---

## 🌐 Server Configuration

### Express Server Setup

**Port:** 3000 (or from PORT env variable)

**Middleware:**
- express.json()
- express.urlencoded({ extended: true })
- express.static() for serving HTML files

**Routes Order (Important!):**
1. Explicit routes first (/, /admin, /api/*, /webhook/*)
2. Static file middleware last
3. Prevent route conflicts

**Error Handling:**
- Try-catch blocks on all async routes
- Console logging for debugging
- User-friendly error messages
- Status codes: 200, 400, 401, 404, 409, 429, 500

**CORS:**
- Not needed for same-origin requests
- Add if deploying frontend separately

---

## 📦 Package.json

```json
{
  "name": "business-chatbot",
  "version": "1.0.0",
  "description": "Multi-platform AI chatbot for business inquiries",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node server-new.js",
    "dev": "node --watch server-new.js"
  },
  "keywords": ["chatbot", "ai", "telegram", "groq", "llama", "web"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "dotenv": "^16.6.1",
    "express": "^4.22.2",
    "node-fetch": "^3.3.2",
    "twilio": "^6.0.2"
  }
}
```

---

## 🔐 Environment Variables (.env)

```bash
# AI Configuration
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here

# Server
PORT=3000
NODE_ENV=development

# Instagram (Meta Graph API)
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/admin/instagram/oauth/callback
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_USER_ID=
INSTAGRAM_USERNAME=
INSTAGRAM_TOKEN_EXPIRES_AT=

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886

# WhatsApp (Cloud API - Optional)
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_ID=your_phone_id

# Webhooks
WEBHOOK_VERIFY_TOKEN=your_secure_random_token

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Other AI Providers (Optional)
HUGGINGFACE_API_KEY=
OPENROUTER_API_KEY=
TOGETHER_API_KEY=
```

---

## 🚀 Deployment Configuration

### Railway (railway.json)
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server-new.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### .gitignore
```
node_modules/
.env
sessions.json
bookings.json
ig-session.json
.DS_Store
*.log
```

---

## 📱 Login Page (login.html)

**Features:**
- Toggle between login and registration forms
- Email/password fields with validation
- Google Sign-In button (OAuth integration)
- "Create account" / "Back to login" link
- Remember session with localStorage
- Auto-redirect if already logged in
- Error message display
- Responsive design

**Flow:**
1. User enters email/password
2. Click "Sign In" or "Create Account"
3. Frontend sends POST to /api/auth/login or /api/auth/register
4. On success, store sessionId in localStorage
5. Redirect to /admin

---

## 🎨 Admin Panel Design Guidelines

**Color Scheme:**
- Primary: #4A90E2 (blue)
- Success: #5CB85C (green)
- Warning: #F0AD4E (orange)
- Danger: #D9534F (red)
- Background (light): #F5F7FA
- Background (dark): #1E1E1E
- Text (light): #2C3E50
- Text (dark): #E0E0E0

**Typography:**
- Font: System font stack (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
- Headings: 600 weight
- Body: 400 weight
- Code: monospace

**Components:**
- Cards with shadows
- Rounded buttons
- Input fields with focus states
- Status badges (connected/disconnected)
- Loading spinners
- Toast notifications (top-right corner)
- Modal overlays

---

## 🔄 Chat Log Storage

**In-Memory Array (chatLogs):**
```javascript
const chatLogs = [];

// Log structure
{
  platform: 'instagram',
  userId: 'user_12345',
  userName: 'john_doe',
  userMessage: 'Hello, what are your hours?',
  aiResponse: 'We are open Monday-Saturday 09:00-20:00...',
  timestamp: '2026-09-22T12:30:00.000Z',
  type: 'message' // or 'booking'
}
```

**Max 100 logs** - Remove oldest when exceeding limit

---

## 📊 Statistics Tracking

**In-Memory Stats:**
```javascript
const stats = {
  totalMessages: 0,
  todayMessages: 0,
  lastResetDate: new Date().toDateString()
};
```

**Reset daily** - Check date on each message

---

## 🔧 Helper Functions to Implement

### Booking Helpers
```javascript
function generateBookingId() // Generate unique booking ID
function parseTimeToMinutes(time) // Convert "14:30" to minutes
function minutesToTime(minutes) // Convert minutes to "14:30"
function getDayKey(dateString) // Get day name from date
function getAvailableSlotsFor(date, service) // Get free slots
function ensureBookingsFile() // Create file if not exists
function readBookingsStore() // Read bookings.json
function writeBookingsStore(store) // Write bookings.json
```

### Environment Helpers
```javascript
function upsertEnvValues(values) // Update .env file programmatically
function updateInstagramConnectionFromEnv() // Sync platform connection status
function isInstagramTokenExpired() // Check token expiration
```

### Session Helpers
```javascript
function loadSessions() // Load sessions from file on startup
function saveSessions() // Save sessions to file
function loadUsers() // Load users from file
function saveUsers(users) // Save users to file
function getUserByEmail(email) // Find user by email
function addUser(user) // Add new user
```

---

## 🧪 Testing Checklist

**Authentication:**
- [ ] Register new account
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Rate limiting (11 failed attempts)
- [ ] Session persistence across server restart
- [ ] Session expiration after 24 hours
- [ ] Logout functionality
- [ ] Google OAuth flow (if configured)

**Bookings:**
- [ ] Create booking manually
- [ ] Check available slots
- [ ] Prevent double-booking
- [ ] Update booking status
- [ ] Cancel booking
- [ ] Filter by date
- [ ] AI-assisted booking flow

**AI Responses:**
- [ ] Answer business hours question
- [ ] Answer pricing question
- [ ] Answer FAQ
- [ ] Handle booking request
- [ ] Maintain conversation context
- [ ] Multi-language support
- [ ] Fallback when API fails

**Platform Integration:**
- [ ] Instagram webhook receives messages
- [ ] Instagram sends responses
- [ ] Telegram webhook works
- [ ] WhatsApp (Twilio) works
- [ ] Conversation logging

**Admin Panel:**
- [ ] Dashboard shows stats
- [ ] Edit business info saves
- [ ] Edit AI settings applies
- [ ] View chat logs
- [ ] Create booking from admin
- [ ] Platform connection status
- [ ] Responsive on mobile

---

## 🎯 Implementation Steps

### Phase 1: Core Setup (Start Here)
1. Initialize Node.js project with package.json
2. Install dependencies
3. Create .env.example and .env files
4. Set up Express server in server-new.js
5. Add health check endpoint
6. Test server starts on port 3000

### Phase 2: Authentication
1. Create users.json and sessions.json structure
2. Implement user registration endpoint
3. Implement login endpoint with bcrypt
4. Implement session verification
5. Implement logout
6. Add rate limiting
7. Create login.html page
8. Test complete auth flow

### Phase 3: AI Engine
1. Create business-info.json with sample data
2. Implement ai-engine-free.js
3. Add Groq API integration
4. Implement system prompt generation
5. Add conversation history tracking
6. Add fallback error handling
7. Test AI responses

### Phase 4: Admin Panel
1. Create admin-new.html structure
2. Add authentication check
3. Implement navigation tabs
4. Build dashboard section
5. Build business info editor
6. Build AI settings editor
7. Build chat logs viewer
8. Test UI responsiveness

### Phase 5: Bookings
1. Create bookings.json structure
2. Implement booking CRUD endpoints
3. Implement availability checker
4. Add booking to AI engine context
5. Build bookings UI in admin panel
6. Test booking flow end-to-end

### Phase 6: Platform Integrations
1. Implement Instagram OAuth flow
2. Implement Instagram webhook
3. Implement Telegram webhook
4. Implement WhatsApp (Twilio) webhook
5. Add platform connection status to admin
6. Test each platform separately

### Phase 7: Polish & Deploy
1. Add error handling everywhere
2. Add loading states in UI
3. Add toast notifications
4. Create privacy-policy.html
5. Test on mobile devices
6. Create deployment documentation
7. Deploy to Railway or similar
8. Configure production environment variables

---

## 📖 API Documentation

### Health Check
```
GET /api/health
Response: "OK"
```

### Authentication
```
POST /api/auth/register
Body: { email, name, password }
Response: { success, message, user }

POST /api/auth/login
Body: { email, password }
Response: { success, sessionId, user }

POST /api/auth/logout
Body: { sessionId }
Response: { success }

GET /api/auth/verify
Headers: { x-session-id }
Response: { valid, user }
```

### Admin Settings
```
GET /api/admin/settings
Response: { business: {...} }

POST /api/admin/settings
Body: { business: {...} }
Response: { success, message }

POST /api/admin/ai-settings
Body: { provider, style, language, maxLength }
Response: { success }
```

### Bookings
```
POST /api/admin/bookings
Body: { customerName, customerPhone, service, date, time, notes, platform, userId }
Response: { success, booking }

GET /api/admin/bookings?date=2026-09-25
Response: { bookings: [...] }

GET /api/admin/bookings/available?date=2026-09-25&service=Haircut
Response: { slots: ["09:00", "09:30", ...] }

GET /api/admin/bookings/:id
Response: { booking: {...} }

PATCH /api/admin/bookings/:id
Body: { status, time, date, notes }
Response: { success, booking }

DELETE /api/admin/bookings/:id
Response: { success, message }
```

### Platform Webhooks
```
POST /webhook/instagram
Body: Instagram webhook payload
Response: 200 OK

POST /webhook/telegram
Body: Telegram update payload
Response: 200 OK

POST /webhook/twilio
Body: Twilio webhook payload (Form URL encoded)
Response: 200 OK
```

### Instagram OAuth
```
GET /api/admin/instagram/oauth/start
Response: Redirect to Instagram OAuth

GET /api/admin/instagram/oauth/callback?code=...
Response: Redirect to admin panel with success/error

GET /api/admin/instagram/connection
Response: { connected, username, userId, expiresAt }

POST /api/admin/instagram/disconnect
Response: { success, message }
```

---

## 🐛 Common Issues & Solutions

### Issue: Sessions not persisting
**Solution:** Ensure saveSessions() is called after session changes and on interval

### Issue: Instagram webhook not receiving messages
**Solution:** 
1. Check webhook is subscribed to messages
2. Verify WEBHOOK_VERIFY_TOKEN matches Meta app settings
3. Ensure public URL is accessible (use ngrok for local testing)

### Issue: AI responses are too long
**Solution:** Reduce max_tokens in AI provider call (currently 200)

### Issue: Double-booking happening
**Solution:** Check getAvailableSlotsFor() excludes all non-cancelled bookings

### Issue: Login rate limiting not working
**Solution:** Ensure loginAttempts Map is checking and updating correctly

### Issue: Google OAuth redirect URI mismatch
**Solution:** 
1. Ensure GOOGLE_REDIRECT_URI in .env matches Google Console
2. Use exact same URI in both places (http vs https matters)
3. For local: http://localhost:3000/api/auth/google/callback

---

## 💡 Best Practices

1. **Never commit .env** - Always use .env.example as template
2. **Validate user input** - Check email format, password length, required fields
3. **Handle errors gracefully** - Try-catch on all async operations
4. **Log important events** - Console.log for debugging and monitoring
5. **Use explicit types** - Convert to String/Number where needed
6. **Keep responses short** - AI should be concise (2-3 sentences)
7. **Check token expiration** - Instagram tokens expire in 60 days
8. **Sanitize file operations** - Ensure JSON files exist before reading
9. **Use environment variables** - Never hardcode API keys or secrets
10. **Test on mobile** - Admin panel should be responsive

---

## 🚀 Quick Start Commands

```bash
# Initialize project
mkdir replai
cd replai
npm init -y

# Install dependencies
npm install express dotenv bcryptjs node-fetch twilio

# Create files
touch server-new.js ai-engine-free.js admin-new.html login.html
touch .env .env.example .gitignore
touch business-info.json ai-settings.json users.json sessions.json bookings.json

# Run development server
npm run dev

# Run production server
npm start
```

---

## 📝 Example Business Data

```json
{
  "business": {
    "name": "Aida Beauty Salon",
    "description": "Professional beauty salon offering haircuts, coloring, nail services, and skincare treatments.",
    "hours": {
      "monday": "09:00-20:00",
      "tuesday": "09:00-20:00",
      "wednesday": "09:00-20:00",
      "thursday": "09:00-20:00",
      "friday": "09:00-20:00",
      "saturday": "09:00-20:00",
      "sunday": "closed"
    },
    "services": [
      {
        "name": "Women's haircut",
        "description": "Professional women's haircut with consultation",
        "price": "800 сом",
        "duration": 60
      },
      {
        "name": "Men's haircut",
        "description": "Classic or modern men's haircut",
        "price": "500 сом",
        "duration": 45
      },
      {
        "name": "Hair coloring",
        "description": "Full hair coloring with professional products",
        "price": "2500 сом",
        "duration": 120
      },
      {
        "name": "Manicure",
        "description": "Classic manicure with nail care",
        "price": "1000 сом",
        "duration": 45
      },
      {
        "name": "Gel polish",
        "description": "Long-lasting gel polish application",
        "price": "1200 сом",
        "duration": 60
      }
    ],
    "contact": {
      "phone": "+996 555 123456",
      "email": "aida.salon@example.com",
      "address": "Bishkek, Chuy Ave 100",
      "website": ""
    },
    "faqs": [
      {
        "question": "How do I book an appointment?",
        "answer": "You can message us directly here or call +996 555 123456. Please provide the service, date, time, your name and phone number."
      },
      {
        "question": "What payment methods do you accept?",
        "answer": "We accept cash, bank cards, and mobile payments."
      },
      {
        "question": "Can I cancel or reschedule?",
        "answer": "Yes, please notify us at least 3 hours before your appointment."
      }
    ],
    "serviceDuration": 30
  }
}
```

---

## 🎓 Learning Resources

**For AI Integration:**
- Groq API Docs: https://console.groq.com/docs
- Hugging Face: https://huggingface.co/docs/api-inference
- OpenRouter: https://openrouter.ai/docs

**For Platforms:**
- Instagram Graph API: https://developers.facebook.com/docs/instagram-api
- Telegram Bot API: https://core.telegram.org/bots/api
- Twilio WhatsApp: https://www.twilio.com/docs/whatsapp

**For Deployment:**
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- Fly.io: https://fly.io/docs

---

## ✅ Definition of Done

The project is complete when:
- [ ] Server starts successfully on port 3000
- [ ] User can register and login
- [ ] Session persists across server restart
- [ ] Admin panel loads and shows all sections
- [ ] Business info can be edited and saved
- [ ] AI settings can be changed
- [ ] AI responds to test messages
- [ ] Bookings can be created and managed
- [ ] Available slots are calculated correctly
- [ ] No double-booking possible
- [ ] At least one platform (Instagram or Telegram) is connected
- [ ] Webhooks receive and respond to messages
- [ ] Chat logs display correctly
- [ ] Mobile responsive design works
- [ ] All API endpoints return proper status codes
- [ ] Error handling is in place
- [ ] README.md is created
- [ ] Project can be deployed to Railway/Render

---

## 🎯 Success Criteria

**Performance:**
- Page load < 2 seconds
- AI response < 3 seconds
- No memory leaks (bounded arrays)

**Security:**
- Passwords hashed with bcrypt
- Rate limiting on login
- Session validation on all admin endpoints
- No API keys in client-side code

**Usability:**
- Intuitive admin interface
- Clear error messages
- Mobile-friendly design
- Fast booking process

**Reliability:**
- Graceful error handling
- Fallback messages when AI fails
- Data persistence (JSON files)
- Session recovery after restart

---

## 📞 Support & Next Steps

Once basic version is working:

**Enhancements:**
1. Add SMS notifications for bookings
2. Add calendar sync (Google Calendar)
3. Add customer database
4. Add analytics dashboard
5. Add multi-language admin panel
6. Add webhook retry logic
7. Add booking reminders
8. Add payment integration
9. Add customer reviews
10. Add team member management

**Scaling:**
1. Move from JSON files to PostgreSQL/MongoDB
2. Add Redis for session management
3. Add queue system for webhooks
4. Add load balancing
5. Add monitoring (Sentry, LogRocket)
6. Add automated backups
7. Add CDN for static assets

---

## 🏁 Final Notes

This is a **production-ready** foundation that:
- Costs $0/month to run (free Groq API)
- Handles real customer conversations
- Manages bookings automatically
- Works across multiple platforms
- Is easy to deploy and maintain
- Can be white-labeled for any business

Build it step-by-step, test thoroughly, and you'll have a powerful AI messaging hub that can handle hundreds of customers!

**Good luck building REPLAI! 🚀**

---

**Document Version:** 1.0  
**Created:** September 22, 2026  
**Author:** REPLAI Team  
**License:** MIT
