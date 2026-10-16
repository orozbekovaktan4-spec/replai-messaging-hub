# 🎯 REPLAI Implementation Plan - Beat Fusion AI

**Team:** Designer + Coder + Product (You)  
**Timeline:** 2 weeks to MVP that beats Fusion  
**Goal:** Copy their best features + add what they're missing

---

## Week 1: Core Features (Copy Fusion)

### Day 1-2: Self-Service Onboarding

#### DESIGNER Tasks:
**Figma mockups for:**
1. Signup page (email, password, business name)
2. Business type selector (barbershop, restaurant, salon, etc.)
3. Instagram link input page
4. AI loading animation (fun, not boring spinner)
5. Business info confirmation page (edit extracted data)
6. Success page with "Test Your AI" button

**Design requirements:**
- Mobile-first
- Clean, modern (like Fusion but better)
- Progress bar (5 steps visible)
- Use new REPLAI colors from landing page
- Confidence-building copy ("Your AI is learning...")

#### CODER Tasks:
**Backend routes to implement:**

```javascript
// Signup flow
POST /api/auth/signup
{
  email: "aziz@barber.com",
  password: "secure123",
  businessName: "Barber Aziz"
}
Response: { businessId, token, onboardingUrl }

POST /api/onboarding/business-type
{
  businessId: "biz_001",
  category: "barbershop" // or restaurant, salon, taxi, etc
}
Response: { template: { services, hours, greeting } }

POST /api/onboarding/extract-instagram
{
  businessId: "biz_001",
  instagramUrl: "https://instagram.com/barber_aziz"
}
Response: {
  extracted: {
    username: "barber_aziz",
    bio: "💈 Barbershop in Bishkek...",
    services: ["Haircut - 500 KGS", "Beard - 300 KGS"],
    hours: "Mon-Fri 9-19",
    phone: "+996555001001",
    address: "Bishkek"
  },
  aiStatus: "training" // show loading animation
}

GET /api/onboarding/status/:businessId
Response: {
  step: "instagram_extract",
  progress: 60,
  aiReady: false
}

POST /api/onboarding/confirm-business-info
{
  businessId: "biz_001",
  services: [...],
  hours: {...},
  greeting: "..."
}
Response: { aiReady: true, testChatUrl: "/test-chat" }
```

**Frontend pages to create:**
- `/signup` - Email/password form
- `/onboarding/business-type` - Category selector with icons
- `/onboarding/instagram` - Paste link, auto-extract
- `/onboarding/confirm` - Edit extracted data
- `/onboarding/complete` - Success + CTA to test chat

**Key feature: Instagram scraping**
```javascript
// Use Groq AI to extract from Instagram bio
async function extractFromInstagram(username) {
  // Fetch Instagram profile (use unofficial API or scraping)
  const bio = await fetchInstagramBio(username);
  
  // Use AI to extract structured data
  const prompt = `
    Extract business information from this Instagram bio:
    "${bio}"
    
    Return JSON:
    {
      services: ["service - price"],
      hours: "Mon-Fri 9-19",
      phone: "+996...",
      address: "..."
    }
  `;
  
  const extracted = await getAIResponse('system', prompt);
  return JSON.parse(extracted);
}
```

---

### Day 3-4: Test Chat (Before Going Live)

#### DESIGNER Tasks:
**Figma mockups for:**
1. Test chat page (looks like real messaging app)
2. Suggested test questions (buttons to click)
3. "Edit AI Response" modal (if response is wrong)
4. "AI Quality" indicator (confidence score)
5. "Go Live" confirmation modal

**Design requirements:**
- Chat bubbles like WhatsApp/Telegram
- User messages = right (blue)
- AI messages = left (gray)
- Typing indicator animation
- Copy example questions from Fusion screenshots

#### CODER Tasks:
**Test chat system:**

```javascript
// Test chat endpoint (doesn't save to real conversations)
POST /api/test-chat
{
  businessId: "biz_001",
  message: "Сколько стоит стрижка?"
}
Response: {
  reply: "Стрижка стоит 500 сом. Хотите записаться?",
  confidence: 0.95,
  sources: ["services.json", "business_profile"]
}

// Edit response (trains AI)
POST /api/test-chat/feedback
{
  businessId: "biz_001",
  originalMessage: "Сколько стоит стрижка?",
  wrongResponse: "...",
  correctResponse: "Стрижка 500 сом, борода 300 сом"
}
Response: { updated: true }

// Go live (activates AI)
POST /api/onboarding/go-live
{
  businessId: "biz_001",
  confirmed: true
}
Response: { 
  live: true,
  dashboardUrl: "/business/dashboard"
}
```

**Frontend pages:**
- `/test-chat` - Interactive chat interface
- Suggested questions based on industry
- Edit response modal
- Go live button (big, prominent)

---

### Day 5-6: Business Profile Editor

#### DESIGNER Tasks:
**Figma mockups for:**
1. Business info tab (like Fusion screenshot #13)
2. Services & prices list (add/edit/delete)
3. Business hours picker (visual, not text)
4. Location/contact info
5. AI tone selector (professional/friendly/casual)
6. Save button with confirmation

**Design requirements:**
- Tabbed interface (Info, Services, Hours, AI Settings)
- Inline editing (click to edit, no separate pages)
- Visual feedback (green checkmark when saved)
- Mobile-friendly forms

#### CODER Tasks:
**Business profile API:**

```javascript
// Get business profile
GET /api/business/:id/profile
Response: {
  name: "Barber Aziz",
  category: "barbershop",
  services: [
    { id: 1, name: "Haircut", price: 500, duration: 30 },
    { id: 2, name: "Beard", price: 300, duration: 15 }
  ],
  hours: {
    monday: { open: "09:00", close: "19:00" },
    tuesday: { open: "09:00", close: "19:00" },
    ...
  },
  contact: {
    phone: "+996555001001",
    address: "Bishkek, 7 mcr 26/.2",
    instagram: "@barber_aziz"
  },
  aiSettings: {
    tone: "friendly",
    greeting: "Здравствуйте! Добро пожаловать в Barber Aziz",
    fallback: "Извините, я уточню у администратора"
  }
}

// Update profile
PUT /api/business/:id/profile
{
  services: [...],
  hours: {...},
  aiSettings: {...}
}
Response: { updated: true }

// Add/edit/delete service
POST /api/business/:id/services
DELETE /api/business/:id/services/:serviceId
PUT /api/business/:id/services/:serviceId
```

**Frontend:**
- `/business/settings` - Full profile editor
- Inline editing with auto-save
- Undo/redo functionality
- Preview AI changes in real-time

---

### Day 7: Safety Mode + Lead Capture

#### DESIGNER Tasks:
**Figma mockups for:**
1. Safety mode toggle (dashboard settings)
2. Lead capture table (like CRM lite)
3. Lead detail view (expand to see conversation)
4. Export to CSV button
5. Telegram notification settings

**Design requirements:**
- Clear on/off toggle for safety mode
- Table with filters (date, platform, status)
- Lead cards on mobile
- Export button prominent

#### CODER Tasks:
**Safety mode implementation:**

```javascript
// AI response with safety checks
async function getAIResponseSafe(businessId, userMessage) {
  const business = await getBusiness(businessId);
  const safetyMode = business.settings.safetyMode;
  
  // Get AI response
  let response = await getAIResponse(businessId, userMessage);
  
  // Safety checks
  if (safetyMode && containsBookingConfirmation(response)) {
    // Don't confirm automatically
    response = "Спасибо! Я уточню наличие времени у администратора и напишу вам.";
    
    // Notify owner
    await notifyOwner(businessId, {
      type: "booking_request",
      customer: userMessage,
      platform: "instagram"
    });
  }
  
  return response;
}
```

**Lead capture system:**

```javascript
// Save lead when customer provides contact
POST /api/leads/capture
{
  businessId: "biz_001",
  platform: "instagram",
  customerId: "12345",
  customerName: "Extracted from conversation",
  phone: "+996...",
  message: "First message",
  context: "Asked about haircut, wants appointment"
}

// Get leads
GET /api/leads?businessId=biz_001&status=new
Response: {
  leads: [
    {
      id: "lead_001",
      name: "Timur",
      phone: "+996555001001",
      platform: "instagram",
      firstMessage: "Сколько стоит стрижка?",
      lastMessage: "Хочу записаться на завтра",
      status: "new",
      createdAt: "2026-10-08T10:00:00Z"
    }
  ]
}

// Export to CSV
GET /api/leads/export?businessId=biz_001
Response: CSV file download
```

**Frontend:**
- `/business/leads` - Lead management table
- Filters: date range, platform, status
- Click lead to see full conversation
- Export button
- Mark as contacted/closed

---

## Week 2: Better Than Fusion

### Day 8-9: Instagram/Telegram One-Click Connect

#### DESIGNER Tasks:
**Mockups for:**
1. Channel connection cards (like Fusion screenshot #12)
2. Instagram OAuth flow (one button, no scary login/password)
3. Telegram bot setup wizard (step by step)
4. Connection status badges (connected/disconnected)
5. Disconnect confirmation modal

#### CODER Tasks:
**Instagram OAuth (already exists, just improve UX):**
```javascript
// Simplify connection flow
GET /connect/instagram?businessId=biz_001
// → Redirect to Meta OAuth
// → Auto-save token on callback
// → Show success message
```

**Telegram bot wizard:**
```javascript
// Step-by-step Telegram setup
POST /api/connect/telegram/start
{
  businessId: "biz_001"
}
Response: {
  step: 1,
  instruction: "Open Telegram and message @BotFather",
  nextCommand: "/newbot"
}

POST /api/connect/telegram/token
{
  businessId: "biz_001",
  botToken: "8324920431:AAF..."
}
Response: {
  connected: true,
  botUsername: "@barber_aziz_bot",
  testUrl: "https://t.me/barber_aziz_bot"
}
```

---

### Day 10-11: Analytics Dashboard

#### DESIGNER Tasks:
**Mockups for:**
1. Dashboard overview (cards: messages, leads, response rate)
2. 24-hour activity chart (like we have but prettier)
3. Platform breakdown donut chart
4. 7-day trend line
5. Recent conversations list
6. Quick actions (pause AI, view leads, settings)

**Design requirements:**
- Match Fusion's clean analytics style
- Add filters (date range, platform)
- Real-time updates (WebSocket or polling)
- Mobile dashboard view

#### CODER Tasks:
**Enhanced analytics:**
```javascript
// Dashboard stats
GET /api/analytics/dashboard?businessId=biz_001
Response: {
  today: {
    messages: 45,
    leads: 3,
    responseRate: 98,
    avgResponseTime: "2s"
  },
  charts: {
    hourly: [...], // 24-hour data
    platforms: { instagram: 60, telegram: 40 },
    weekly: [...] // 7-day trend
  },
  recentConversations: [
    {
      customerId: "123",
      platform: "instagram",
      lastMessage: "Хочу записаться",
      timestamp: "2026-10-08T14:30:00Z"
    }
  ]
}
```

---

### Day 12-13: Premium Features (Beat Fusion)

#### What Fusion doesn't have (our advantages):

1. **Owner Approval Mode**
   - AI drafts response, owner approves before sending
   - Perfect for businesses that want control

2. **Daily Digest**
   - Telegram message every morning with:
     - Yesterday's stats
     - New leads
     - Pending actions

3. **Pause for Specific Customer**
   - One button: "I'll handle this customer myself"
   - AI stops responding, owner takes over

4. **Local Templates Library**
   - Bishkek-specific examples:
     - Barbershops
     - Beauty salons
     - Restaurants (Kyrgyz/Russian menu)
     - Driving schools
     - Repair services

5. **Smart Fallbacks**
   - When AI doesn't know answer:
     - "I'll check and get back to you"
     - Notifies owner
     - Learns from owner's response

#### DESIGNER Tasks:
Design all 5 features above.

#### CODER Tasks:
Implement all 5 features above.

---

### Day 14: Polish + Testing

#### ALL TEAM:
1. Test entire flow (signup → onboarding → test chat → go live)
2. Fix bugs
3. Write user guide
4. Create demo video (1 minute)
5. Prepare for launch

---

## Technical Architecture

### Frontend Stack:
- Vanilla JS (keep it simple, no React bloat)
- Chart.js for analytics
- Tailwind CSS (if designer wants utility classes)
- WebSocket for real-time updates (optional)

### Backend Stack:
- Node.js + Express (current)
- JSON files → PostgreSQL (when >100 users)
- JWT auth
- Redis for caching (optional)

### AI Stack:
- Groq API (current - free tier)
- Fallback to Hugging Face if Groq quota exceeded
- Context: business profile + last 10 messages

### Deployment:
- Render.com (current)
- PostgreSQL addon (when needed)
- Uptime monitoring (UptimeRobot)

---

## Feature Comparison: Fusion vs REPLAI

| Feature | Fusion AI | REPLAI (After 2 weeks) | Our Advantage |
|---------|-----------|------------------------|---------------|
| **Onboarding** | 5-10 min | 2 min | ✅ 5x faster |
| **Free tier** | 3-day trial | 100 msgs/mo forever | ✅ Permanent |
| **Pricing** | 6,034 KGS/mo | 1,500 KGS/mo | ✅ 4x cheaper |
| **Test chat** | ✅ Yes | ✅ Yes | ✅ Same |
| **Instagram extract** | ✅ Yes | ✅ Yes | ✅ Same |
| **Safety mode** | ❌ No (makes fake bookings!) | ✅ Yes | ✅ Better |
| **Owner approval** | ❌ No | ✅ Yes | ✅ Unique |
| **Lead export** | CRM only | CSV + Telegram | ✅ Simpler |
| **Local focus** | General | Bishkek-specific | ✅ Unique |
| **WhatsApp** | ✅ Yes | ⏳ Coming soon | ❌ Behind |
| **CRM integration** | amoCRM, Bitrix | ⏳ Later | ❌ Behind |

**Bottom line:** We beat them on price, speed, safety, and local focus. They beat us on integrations (which come later).

---

## Division of Labor

### YOU (Product Lead):
- Define features (you're doing this now ✅)
- Talk to customers
- Set priorities
- Test everything
- Write copy/content
- Make final decisions

### DESIGNER:
- All Figma mockups (pages + components)
- UI/UX flow
- Color scheme (use landing page colors)
- Icons and illustrations
- Mobile responsive designs
- Style guide

### CODER:
- All backend APIs
- All frontend pages
- Database schema
- AI integration
- Testing
- Deployment
- Bug fixes

---

## Success Metrics (After 2 Weeks)

**Technical:**
- [ ] Signup working (no manual work)
- [ ] Onboarding complete in <3 min
- [ ] Test chat functional
- [ ] Instagram auto-extract working
- [ ] Safety mode preventing fake bookings
- [ ] Lead capture working
- [ ] Analytics dashboard live
- [ ] Mobile responsive

**Business:**
- [ ] 10 beta users signed up
- [ ] 5 users completed onboarding
- [ ] 3 users went live
- [ ] 1 paying customer (1,500 KGS)
- [ ] 100+ AI messages sent
- [ ] 5+ leads captured
- [ ] Zero fake booking disasters

---

## Next Steps (RIGHT NOW)

1. **You:** Share this doc with designer + coder
2. **Designer:** Start Figma mockups (Day 1-2 screens first)
3. **Coder:** Read current codebase, understand structure
4. **Team meeting:** Agree on timeline + tools (Telegram group? Notion?)

---

## Communication

**Daily standup (15 min):**
- What did you do yesterday?
- What will you do today?
- Any blockers?

**Tools:**
- **Telegram group** - Quick messages
- **Figma** - Design collaboration
- **GitHub** - Code collaboration
- **This doc** - Single source of truth

---

## Budget Estimate

**Costs:**
- Render: $0 (free tier)
- Domain: $10/year (optional)
- Nothing else!

**Revenue (Month 1):**
- 10 free users = $0
- 5 basic users = 7,500 KGS ($75)
- 1 pro user = 3,500 KGS ($35)
- **Total: 11,000 KGS/month** ($110)

Split 3 ways = 3,666 KGS each ($37/person)

Not rich, but proves concept! Scale to 50 users = 50,000 KGS/mo split = decent money for 16-year-olds! 💰

---

**LET'S BUILD THIS! 🚀**
