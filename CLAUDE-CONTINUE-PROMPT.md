# 🚀 REPLAI - Continue Building Prompt for Claude

Hi Claude! I'm a 16-year-old developer from Bishkek, Kyrgyzstan. I've already built a working AI messaging hub called **REPLAI** and I need your help to take it to the next level.

---

## 📌 WHO I AM & CONTEXT

- 16 years old, college student
- Living in Bishkek, Kyrgyzstan
- Built REPLAI from scratch (Node.js, Express, Groq AI)
- Target market: **Barber shops** (our focused niche)
- Goal: Build a SaaS product for barber shops to automate customer messages and bookings
- Budget: $0 (using free tiers only)
- Timeline: Part-time (evenings + weekends)

---

## ✅ WHAT I ALREADY HAVE (Working System)

### Current Tech Stack:
- **Backend:** Node.js + Express.js (ES6 modules)
- **AI:** Groq API (FREE) - LLaMA 3.3 70B
- **Storage:** JSON files (users.json, bookings.json, sessions.json, business-info.json)
- **Auth:** bcryptjs + session management + rate limiting
- **Platforms:** Instagram (connected), Telegram, WhatsApp (Twilio)
- **Admin Panel:** Single HTML page (admin-new.html)
- **Login Page:** login.html

### Current Files:
```
replai/
├── server-new.js          ← Main Express server (1800+ lines)
├── ai-engine-free.js      ← AI engine with Groq, HuggingFace, OpenRouter support
├── admin-new.html         ← Admin dashboard (for me to set up customers)
├── login.html             ← Authentication page
├── privacy-policy.html    ← Privacy policy
├── package.json           ← ES modules, Express, bcryptjs, Twilio, node-fetch
├── .env                   ← All API keys (Instagram connected @akt4n.o)
├── business-info.json     ← Business data (currently set to Aida Beauty Salon)
├── ai-settings.json       ← { provider, style, language, maxLength }
├── users.json             ← Admin users
├── sessions.json          ← Active sessions
└── bookings.json          ← Customer bookings
```

### What Already Works:
- ✅ Server runs on port 3000
- ✅ Login/registration with bcrypt
- ✅ Session management (24hr expiry, persists to file)
- ✅ Rate limiting on login (10 attempts/15min)
- ✅ Instagram connected via OAuth 2.0 (Meta Graph API v23)
- ✅ AI responds to Instagram DMs automatically
- ✅ Booking system (CRUD, availability checker, no double-booking)
- ✅ Admin dashboard with: dashboard, business info, AI settings, bookings, chat logs, platform connections
- ✅ Groq AI responds in English, Russian, Kyrgyz (auto-detect)
- ✅ Conversation history (last 10 messages per user)
- ✅ Webhook endpoints for Instagram, Telegram, WhatsApp

---

## 🎯 WHAT I NEED TO BUILD NEXT

### THE BIG PICTURE: Two-App Architecture

```
┌─────────────────────────────────────────────────┐
│           REPLAI PLATFORM                        │
├─────────────────────────────────────────────────┤
│                                                  │
│  App 1: SUPER ADMIN (localhost:3000)             │
│  ← Only I use this                              │
│  ← Set up new barber shop customers             │
│  ← Monitor all businesses                       │
│  ← Already exists (admin-new.html)              │
│                                                  │
│  App 2: BUSINESS OWNER DASHBOARD (port 3001)    │
│  ← Barber shop owners use this                  │
│  ← See today's bookings                         │
│  ← Manage schedule                              │
│  ← View AI conversations                        │
│  ← NEED TO BUILD THIS                           │
│                                                  │
│  AI BOT (running in background)                 │
│  ← Responds to customer messages               │
│  ← Books appointments automatically            │
│  ← Works on Instagram, Telegram, WhatsApp      │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🏗️ WHAT TO BUILD: Business Owner Dashboard

### Overview:
A **mobile-first web app** that barber shop owners use daily to manage their business. They access it from their phone browser. Simple, fast, beautiful.

### URL Structure:
```
/business          ← Login page for business owners
/business/dashboard ← Main dashboard (today's view)
/business/bookings  ← Full bookings management
/business/schedule  ← Working hours & availability
/business/messages  ← AI conversation logs
/business/settings  ← Business profile setup
```

### Authentication for Business Owners:
- Separate from super admin login
- Business owner gets: email + password (set by super admin when onboarding)
- Each business has a unique `businessId`
- Session stored in localStorage
- Auto-redirect to /business/dashboard if logged in

---

## 📱 SCREEN-BY-SCREEN SPECIFICATION

### Screen 1: Business Login (/business)

```
┌─────────────────────────┐
│                          │
│    ✂️ REPLAI             │
│    For Your Barber Shop  │
│                          │
│  [Email input]           │
│  [Password input]        │
│                          │
│  [Sign In Button]        │
│                          │
│  Need help? Contact us   │
│  t.me/replai_support     │
│                          │
└─────────────────────────┘
```

**Behavior:**
- POST to `/api/business/auth/login`
- Store `businessToken` + `businessId` in localStorage
- Redirect to `/business/dashboard`
- Show error if wrong credentials

---

### Screen 2: Dashboard (/business/dashboard) ← MOST IMPORTANT

```
┌─────────────────────────┐
│ ☀️ Good morning, Aziz!  │
│ Tuesday, Sep 22          │
├─────────────────────────┤
│                          │
│  📊 TODAY                │
│  ┌────┐ ┌────┐ ┌────┐   │
│  │ 8  │ │ 3  │ │ 5  │   │
│  │book│ │done│ │left│   │
│  └────┘ └────┘ └────┘   │
│                          │
│  📅 UPCOMING             │
│  ┌────────────────────┐  │
│  │ 14:00 - John D.    │  │
│  │ Men's Haircut      │  │
│  │ [Done] [Cancel]    │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ 14:30 - Mike R.    │  │
│  │ Beard Trim         │  │
│  │ [Done] [Cancel]    │  │
│  └────────────────────┘  │
│                          │
│  💬 RECENT MESSAGES      │
│  New: 3 customer DMs     │
│  [View Messages]         │
│                          │
└─────────────────────────┘
│ 🏠 │ 📅 │ 💬 │ ⚙️  │
└─────────────────────────┘
```

**Key Features:**
- Real-time today's bookings (auto-refresh every 30 seconds)
- Stats: total bookings, completed, remaining
- One-tap to mark booking as "Done" or "Cancel"
- New messages badge count
- Time-sorted list of today's appointments
- Next upcoming appointment highlighted

---

### Screen 3: Bookings (/business/bookings)

```
┌─────────────────────────┐
│ ← Bookings              │
│                          │
│  [< Sep 22 >]           │
│                          │
│  + Add Booking           │
│                          │
│  09:00 ✅ Ahmed K.       │
│         Haircut          │
│  09:30 ✅ Rustam M.      │
│         Beard            │
│  10:00 ⬜ Available      │
│  10:30 ⬜ Available      │
│  11:00 🔵 Bekzod T.      │
│         Haircut + Beard  │
│  ...                     │
│                          │
└─────────────────────────┘
```

**Features:**
- Date picker (navigate day by day)
- Color coded: ✅ done, 🔵 upcoming, ❌ cancelled
- Show available slots (grayed out)
- Tap booking → expand to see details + actions
- "+ Add Booking" button → modal form:
  - Customer name
  - Phone number
  - Service (dropdown from configured services)
  - Date + Time (only shows available slots)
  - Notes

---

### Screen 4: Schedule (/business/schedule)

```
┌─────────────────────────┐
│ ← Working Hours          │
│                          │
│  Monday    [09:00-20:00] │
│  Tuesday   [09:00-20:00] │
│  Wednesday [09:00-20:00] │
│  Thursday  [09:00-20:00] │
│  Friday    [09:00-20:00] │
│  Saturday  [10:00-18:00] │
│  Sunday    [CLOSED]  🔴  │
│                          │
│  Break time:             │
│  [13:00] to [14:00]      │
│                          │
│  Services:               │
│  ✂️ Haircut      - 500₸  │
│  🪒 Beard trim   - 300₸  │
│  ✂️🪒 Haircut+Beard-700₸ │
│                          │
│  [Save Changes]          │
└─────────────────────────┘
```

**Features:**
- Toggle days open/closed
- Set open and close times per day
- Add break time (blocked from bookings)
- Add/edit/remove services with prices
- Service duration setting (affects available slots)
- All changes save to business-info.json via API

---

### Screen 5: Messages (/business/messages)

```
┌─────────────────────────┐
│ ← Customer Messages      │
│                          │
│  [All] [Instagram] [TG]  │
│                          │
│  👤 Ahmed K.  IG  2min   │
│  "Do you have time at 3?"│
│  Bot: "Yes! Book here..."│
│                          │
│  👤 Rustam M. WA  1hr   │
│  "How much haircut?"     │
│  Bot: "500 сом"          │
│                          │
│  👤 John D.   IG  3hr    │
│  "Cancel my booking"     │
│  Bot: "Cancelled ✅"      │
│                          │
└─────────────────────────┘
```

**Features:**
- See all AI conversations
- Filter by platform (Instagram, Telegram, WhatsApp)
- See customer name, platform, time, last message
- Tap to expand full conversation thread
- Badge showing unread/new conversations

---

### Screen 6: Settings (/business/settings)

```
┌─────────────────────────┐
│ ← Settings               │
│                          │
│  🏪 BUSINESS PROFILE     │
│  Name: [Aziz Barber]     │
│  Phone: [+996555...]     │
│  Address: [Chuy Ave 5]   │
│                          │
│  🌐 SOCIAL LINKS         │
│  Instagram: [@azizbarber]│
│  WhatsApp: [+996555...]  │
│                          │
│  🤖 AI LANGUAGE          │
│  [Auto / Russian / Kyrgyz│
│   / English]             │
│                          │
│  🔔 NOTIFICATIONS        │
│  New booking: [ON]  🟢   │
│  Cancellation: [ON] 🟢   │
│                          │
│  [Save Settings]         │
│  [Logout]                │
└─────────────────────────┘
```

---

## 🔧 BACKEND CHANGES NEEDED

### New API Endpoints to Add to server-new.js:

#### Business Owner Authentication:
```javascript
POST /api/business/auth/login
  Body: { email, password, businessId }
  Response: { success, token, business }

GET /api/business/auth/verify
  Headers: { x-business-token }
  Response: { valid, business }

POST /api/business/auth/logout
  Body: { token }
  Response: { success }
```

#### Business Dashboard Data:
```javascript
GET /api/business/dashboard
  Headers: { x-business-token }
  Response: {
    todayBookings: [...],
    stats: { total, completed, remaining },
    recentMessages: [...],
    businessName: "Aziz Barber"
  }
```

#### Business Bookings:
```javascript
GET /api/business/bookings?date=2024-09-22
  Headers: { x-business-token }
  Response: { bookings: [...], availableSlots: [...] }

POST /api/business/bookings
  Headers: { x-business-token }
  Body: { customerName, customerPhone, service, date, time, notes }
  Response: { success, booking }

PATCH /api/business/bookings/:id
  Headers: { x-business-token }
  Body: { status }  // completed, cancelled
  Response: { success, booking }
```

#### Business Settings:
```javascript
GET /api/business/settings
  Headers: { x-business-token }
  Response: { business: {...}, aiSettings: {...} }

POST /api/business/settings
  Headers: { x-business-token }
  Body: { business: {...}, aiSettings: {...} }
  Response: { success }
```

#### Business Messages:
```javascript
GET /api/business/messages?platform=all&limit=50
  Headers: { x-business-token }
  Response: { messages: [...] }
```

### New Data: businesses.json
```json
{
  "businesses": [
    {
      "id": "biz_001",
      "name": "Aziz Barber Shop",
      "email": "aziz@barber.com",
      "passwordHash": "$2b$10$...",
      "phone": "+996555123456",
      "address": "Bishkek, Chuy Ave 5",
      "instagram": "@azizbarber",
      "createdAt": "2024-09-22T10:00:00.000Z",
      "active": true,
      "plan": "free"
    }
  ]
}
```

---

## 🎨 DESIGN SYSTEM

### Colors (Barber Shop Theme):
```css
:root {
  /* Primary - Dark & Professional */
  --primary: #1a1a2e;        /* Dark navy */
  --primary-light: #16213e;  /* Slightly lighter navy */
  --accent: #e94560;         /* Red accent (barber pole!) */
  --accent-light: #ff6b6b;   /* Light red */
  
  /* Status Colors */
  --success: #2ecc71;        /* Green - completed */
  --warning: #f39c12;        /* Orange - upcoming */
  --danger: #e74c3c;         /* Red - cancelled */
  
  /* Neutrals */
  --bg: #f8f9fa;             /* Light background */
  --card: #ffffff;           /* Card background */
  --text: #2c3e50;           /* Main text */
  --text-light: #7f8c8d;     /* Secondary text */
  --border: #ecf0f1;         /* Border color */
  
  /* Dark Mode */
  --bg-dark: #0f0f1a;
  --card-dark: #1a1a2e;
  --text-dark: #ecf0f1;
}
```

### Typography:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Mobile-First Breakpoints:
```css
/* Mobile: default (320px+) */
/* Tablet: 768px+ */
/* Desktop: 1024px+ */
```

### Component Style Rules:
- Rounded corners: border-radius 12px for cards, 8px for buttons
- Shadows: `box-shadow: 0 2px 12px rgba(0,0,0,0.08)`
- Bottom navigation bar (mobile style)
- Cards with subtle shadows
- Status badges with colored dots
- Pull-to-refresh feel (even though web)
- Smooth transitions (0.2s ease)

---

## 📐 TECHNICAL ARCHITECTURE

### File Structure to Create:
```
replai/
├── server-new.js          ← ADD new /api/business/* endpoints
├── business-dashboard/    ← NEW FOLDER
│   ├── index.html         ← Login page (/business)
│   ├── dashboard.html     ← Main dashboard (/business/dashboard)
│   ├── bookings.html      ← Bookings (/business/bookings)
│   ├── schedule.html      ← Schedule (/business/schedule)
│   ├── messages.html      ← Messages (/business/messages)
│   ├── settings.html      ← Settings (/business/settings)
│   ├── app.js             ← Shared JS (auth check, API calls, utils)
│   └── styles.css         ← Shared styles
├── businesses.json        ← NEW: business accounts storage
└── ... (existing files)
```

### Serving the Business Dashboard:
Add to server-new.js:
```javascript
// Serve business dashboard
app.use('/business', express.static(path.join(__dirname, 'business-dashboard')));

// Handle client-side routing
app.get('/business/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'business-dashboard', 'index.html'));
});
```

### Shared JavaScript (app.js):
```javascript
// Auth helpers
const BusinessAuth = {
  getToken: () => localStorage.getItem('businessToken'),
  getBusinessId: () => localStorage.getItem('businessId'),
  isLoggedIn: () => !!localStorage.getItem('businessToken'),
  logout: () => {
    localStorage.removeItem('businessToken');
    localStorage.removeItem('businessId');
    window.location.href = '/business';
  }
};

// API helper
const API = {
  async get(endpoint) {
    const res = await fetch(endpoint, {
      headers: { 'x-business-token': BusinessAuth.getToken() }
    });
    if (res.status === 401) BusinessAuth.logout();
    return res.json();
  },
  async post(endpoint, data) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-business-token': BusinessAuth.getToken()
      },
      body: JSON.stringify(data)
    });
    if (res.status === 401) BusinessAuth.logout();
    return res.json();
  }
};

// Toast notifications
function showToast(message, type = 'success') {
  // implementation
}

// Format time "14:30" → "2:30 PM"
function formatTime(time) {
  // implementation
}

// Format date for display
function formatDate(dateString) {
  // implementation
}
```

---

## 🏪 BARBER SHOP SPECIFIC FEATURES

### Pre-configured Services (Default for new barber shops):
```json
{
  "services": [
    { "name": "Haircut", "nameRu": "Стрижка", "price": "500 сом", "duration": 30 },
    { "name": "Beard trim", "nameRu": "Борода", "price": "300 сом", "duration": 20 },
    { "name": "Haircut + Beard", "nameRu": "Стрижка + борода", "price": "700 сом", "duration": 45 },
    { "name": "Kids haircut", "nameRu": "Детская стрижка", "price": "400 сом", "duration": 25 },
    { "name": "Head shave", "nameRu": "Налысо", "price": "400 сом", "duration": 25 }
  ]
}
```

### AI System Prompt for Barber Shop:
The AI should specifically:
- Know all barber services and prices
- Understand "сегодня есть время?" (do you have time today?)
- Understand "сколько стоит стрижка?" (how much is a haircut?)
- Book appointments by collecting: name, service, date, time
- Respond in Russian by default (CIS market)
- Use informal/friendly tone (barber shops are casual)
- Mention walk-ins are welcome if slots available

### Barber-Specific AI Prompt Template:
```
You are an AI assistant for {business_name}, a barber shop in {city}.

Services & Prices:
{services_list}

Working Hours:
{hours}

Address: {address}
Phone: {phone}

YOUR PERSONALITY:
- Friendly and casual (like a cool barber)
- Use "братан", "чувак" occasionally (if customer uses casual language)
- Keep responses SHORT (2-3 sentences max)
- Always end with a question or call to action

BOOKING FLOW:
1. Customer asks about availability → show available slots for today/tomorrow
2. Customer picks time → ask for name and phone
3. Confirm: "Записал тебя на {time}! Ждём тебя, братан 💈"
4. If slot taken → suggest next available time

COMMON QUESTIONS:
- "Есть места?" → Show today's availability
- "Сколько стоит?" → List services with prices
- "Где находитесь?" → Give address
- "Долго ждать?" → Check current queue
```

---

## 🚀 SUPER ADMIN UPGRADES NEEDED

### Add to existing admin-new.html:

**New Section: "Manage Businesses"**
```
┌─────────────────────────────────┐
│ 🏪 Businesses                    │
│                                  │
│ [+ Add New Barber Shop]          │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Aziz Barber Shop             │ │
│ │ @azizbarber • Active ✅       │ │
│ │ Joined: Sep 2024             │ │
│ │ Messages today: 12           │ │
│ │ Bookings today: 5            │ │
│ │ [Login as] [Edit] [Suspend]  │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Bros Barbershop              │ │
│ │ @brosbarbershop • Active ✅   │ │
│ │ Joined: Oct 2024             │ │
│ │ Messages today: 8            │ │
│ │ Bookings today: 3            │ │
│ │ [Login as] [Edit] [Suspend]  │ │
│ └──────────────────────────────┘ │
└─────────────────────────────────┘
```

**Add New Business Modal:**
```javascript
// When I onboard a new barber shop customer:
{
  businessName: "Aziz Barber",
  ownerName: "Aziz Karimov",
  email: "aziz@gmail.com",
  phone: "+996555123456",
  instagram: "@azizbarber",
  city: "Bishkek",
  address: "Chuy Ave 5",
  
  // Auto-generate login credentials
  businessId: "biz_001",  // auto-generated
  tempPassword: "barber123"  // shown once, owner changes it
}
```

---

## 📋 IMPLEMENTATION ORDER

**Please build in this exact order:**

### Step 1: Backend - New API Endpoints
1. Add businesses.json storage + helper functions
2. Add `POST /api/business/auth/login`
3. Add `GET /api/business/auth/verify`
4. Add `GET /api/business/dashboard`
5. Add `GET /api/business/bookings`
6. Add `POST /api/business/bookings`
7. Add `PATCH /api/business/bookings/:id`
8. Add `GET /api/business/messages`
9. Add `GET /api/business/settings`
10. Add `POST /api/business/settings`
11. Add `POST /api/admin/businesses` (super admin: add new business)
12. Add `GET /api/admin/businesses` (super admin: list all businesses)

### Step 2: Shared Files
1. Create `business-dashboard/` folder
2. Create `business-dashboard/styles.css` (full design system)
3. Create `business-dashboard/app.js` (auth helpers, API wrapper, utilities)

### Step 3: Business Dashboard Pages
1. `business-dashboard/index.html` (login page)
2. `business-dashboard/dashboard.html` (TODAY view - most important!)
3. `business-dashboard/bookings.html` (full calendar view)
4. `business-dashboard/schedule.html` (hours + services editor)
5. `business-dashboard/messages.html` (AI conversation logs)
6. `business-dashboard/settings.html` (business profile)

### Step 4: Super Admin Updates
1. Add "Businesses" section to admin-new.html
2. Add "Add New Business" form
3. Add business stats to dashboard

### Step 5: Sample Data
1. Create sample barber shop in businesses.json
2. Add barber-specific services to business-info.json
3. Add sample bookings for testing

### Step 6: Test Everything
1. Test business owner login
2. Test dashboard loads with real data
3. Test creating booking from business dashboard
4. Test marking booking as completed
5. Test messages view

---

## 🎯 SUCCESS CRITERIA

The build is complete when:
- [ ] Business owner can login at `/business`
- [ ] Dashboard shows today's bookings correctly
- [ ] Can mark booking as completed with one tap
- [ ] Can cancel booking with one tap
- [ ] Can add new booking manually
- [ ] Schedule page shows correct hours
- [ ] Messages page shows AI conversations
- [ ] Settings can be saved
- [ ] Works on mobile (375px width)
- [ ] Works on desktop too
- [ ] Super admin can add new business
- [ ] Super admin can see all businesses + stats
- [ ] Server starts without errors
- [ ] All API endpoints return correct data

---

## ⚡ QUICK WINS (Build These First)

If you can only build ONE thing, build:
**`/business/dashboard`** - The TODAY screen

This is what the barber owner will check 20x per day.
It needs to:
1. Show today's appointments in order
2. Let them mark as done with ONE tap
3. Show how many left for today
4. Look great on phone

Everything else is secondary to this one screen.

---

## 🔑 ENVIRONMENT & KEYS

The `.env` file already has:
```
AI_PROVIDER=groq
GROQ_API_KEY=already_set
INSTAGRAM_ACCESS_TOKEN=already_set (connected to @akt4n.o)
WEBHOOK_VERIFY_TOKEN=replai_secure_token_2026
PORT=3000
```

No new API keys needed - use what exists.

---

## 📝 CODING STANDARDS

Please follow these (matching existing code):
- ES6 modules (`import/export`) - NOT `require()`
- Async/await (not callbacks)
- Try/catch on all async operations
- Console.log with `[Module]` prefix: `console.log('[Business] ...')`
- JSON files for storage (no external database)
- Mobile-first CSS
- No external CSS frameworks (no Bootstrap/Tailwind)
- Vanilla JavaScript only (no React/Vue)
- Add comments explaining complex logic

---

## 🆘 IF YOU GET STUCK

- Check existing `server-new.js` for patterns to follow
- Check existing `admin-new.html` for UI patterns
- The booking logic is already in `server-new.js` - reuse it
- The session management pattern is in `server-new.js` - follow it
- Ask me if anything is unclear

---

## 🎬 START HERE

Begin with **Step 1** (backend API endpoints), then move to the business dashboard UI.

When you're done with each step, tell me:
- ✅ What you built
- 🧪 How to test it
- ⏭️ What's next

Let's build the best barber shop AI booking system in Central Asia! 💈🚀
