# 🚀 REPLAI - Fast Client Onboarding System

## Goal: Client goes from signup → working AI in 5 minutes (zero manual work from you)

---

## Current vs Target

### Current (Manual - 30+ min per client)
1. ❌ You manually add to businesses.json
2. ❌ You send login credentials
3. ❌ Client logs in
4. ❌ You help them connect Instagram
5. ❌ You help them connect Telegram
6. ❌ You configure AI settings
7. ❌ You test it works
8. ❌ You train them how to use

**Problem:** Can't scale, you're the bottleneck

### Target (Automated - 5 min, zero manual work)
1. ✅ Client clicks "Sign Up" button
2. ✅ Fills form (business name, email, password)
3. ✅ Email verification
4. ✅ Onboarding wizard (step-by-step)
   - Connect Instagram (1 click OAuth)
   - Connect Telegram (scan QR code)
   - Set business info (hours, services, pricing)
5. ✅ AI automatically configured
6. ✅ Test message sent
7. ✅ Client sees dashboard
8. ✅ Done! 🎉

**Result:** You can add 100 clients/day with zero work

---

## Technical Implementation

### Step 1: Self-Service Signup (2 hours)

**Create `/signup` page:**

```javascript
// Signup flow
POST /api/auth/signup
{
  businessName: "Barber Aziz",
  email: "aziz@barber.com",
  password: "securepass",
  phone: "+996555001001"
}

Response:
{
  businessId: "biz_002",
  token: "jwt_token_here",
  verificationEmailSent: true
}
```

**What it does:**
1. Creates new business in businesses.json
2. Hashes password (bcrypt)
3. Generates business ID
4. Sends verification email
5. Returns JWT token
6. Redirects to onboarding wizard

**Files to create:**
- `signup.html` - Signup form
- Update `server-new.js` - Add POST /api/auth/signup route

---

### Step 2: Onboarding Wizard (3 hours)

**Create `/onboarding` page (step-by-step):**

#### Screen 1: Welcome
```
🎉 Welcome to REPLAI!

Let's set up your AI assistant in 3 easy steps:
1. Connect Instagram (1 min)
2. Connect Telegram (1 min)  
3. Configure your business (2 min)

[Start Setup →]
```

#### Screen 2: Connect Instagram
```
📱 Connect Your Instagram

Click button below to connect your Instagram business account.
We'll automatically start replying to your DMs.

[Connect Instagram with Meta]
  ↓
Meta OAuth popup
  ↓
✅ Connected! @username
```

**Technical:**
```javascript
GET /api/onboarding/instagram/connect
  → Redirect to Meta OAuth
  → https://www.facebook.com/v23.0/dialog/oauth?...
  
GET /api/onboarding/instagram/callback?code=...
  → Exchange code for token
  → Save to business account
  → Mark step complete
  → Redirect to next step
```

#### Screen 3: Connect Telegram
```
💬 Connect Your Telegram Bot

Option A: Create New Bot (Easy)
[Create Bot Automatically] ← We make bot for you

Option B: Use Existing Bot
1. Message @BotFather on Telegram
2. Send: /newbot
3. Follow instructions
4. Copy token and paste below:

[Token: ___________________]
[Connect Telegram Bot]
```

**Technical:**
```javascript
// Option A: Auto-create (Telegram API limitation: can't auto-create)
// Show QR code instead

// Option B: Manual token
POST /api/onboarding/telegram/connect
{
  botToken: "8324920431:AAF..."
}

Response:
{
  success: true,
  botUsername: "@your_business_bot"
}
```

#### Screen 4: Business Info
```
ℹ️ Tell Us About Your Business

This helps AI give accurate responses.

Business Name: [Barber Aziz_______]
Category: [Barbershop ▼]
  - Barbershop
  - Salon
  - Restaurant
  - Retail
  - Services
  - Other

Business Hours:
Monday-Friday: [09:00] to [18:00]
Saturday: [10:00] to [16:00]
Sunday: [Closed]

Services & Prices:
1. Haircut - $10
2. Beard trim - $5
3. [Add Service]

Address: [Optional]
Phone: [+996555001001]

[Save & Continue]
```

**Technical:**
```javascript
POST /api/onboarding/business-info
{
  name: "Barber Aziz",
  category: "barbershop",
  hours: { mon-fri: "09:00-18:00", ... },
  services: [
    { name: "Haircut", price: 10 },
    { name: "Beard trim", price: 5 }
  ],
  address: "...",
  phone: "+996555001001"
}
```

#### Screen 5: AI Configuration
```
🤖 Configure Your AI Assistant

AI Response Style:
( ) Professional - Formal and polite
(•) Friendly - Warm and conversational
( ) Casual - Relaxed and fun

Auto-Reply:
[x] Enable AI auto-replies
[ ] Notify me for every message (no auto-reply)

Business Hours Behavior:
(•) Reply 24/7
( ) Only reply during business hours
( ) Auto-reply after hours: "We're closed. We'll respond when we open."

[Test AI Response]
```

#### Screen 6: Test & Done
```
✅ All Set! Let's Test It

Send a test message to your Instagram:
@your_username

Or test Telegram:
@your_business_bot

We'll show you the AI response in real-time.

[I sent a test message]
  ↓
✅ Test successful! AI replied in 2 seconds.

[Go to Dashboard →]
```

---

### Step 3: One-Click Platform Connections (4 hours)

**Instagram OAuth Flow:**

```javascript
// Current: Manual token copy-paste (hard!)
// New: OAuth flow (1 click!)

// Step 1: Redirect to Meta
app.get('/connect/instagram', (req, res) => {
  const authUrl = `https://www.facebook.com/v23.0/dialog/oauth?
    client_id=${FACEBOOK_APP_ID}
    &redirect_uri=${CALLBACK_URL}/connect/instagram/callback
    &scope=instagram_basic,instagram_manage_messages,pages_show_list
    &state=${businessId}`;
  
  res.redirect(authUrl);
});

// Step 2: Handle callback
app.get('/connect/instagram/callback', async (req, res) => {
  const { code, state: businessId } = req.query;
  
  // Exchange code for token
  const tokenRes = await fetch('https://graph.facebook.com/v23.0/oauth/access_token', {
    method: 'POST',
    body: JSON.stringify({
      client_id: FACEBOOK_APP_ID,
      client_secret: FACEBOOK_APP_SECRET,
      redirect_uri: CALLBACK_URL,
      code
    })
  });
  
  const { access_token } = await tokenRes.json();
  
  // Get Instagram account
  const accountRes = await fetch(
    `https://graph.facebook.com/v23.0/me/accounts?access_token=${access_token}`
  );
  const { data } = await accountRes.json();
  const instagramAccount = data[0].instagram_business_account;
  
  // Save to business
  updateBusiness(businessId, {
    instagramConnected: true,
    instagramToken: access_token,
    instagramAccountId: instagramAccount.id
  });
  
  res.redirect('/onboarding?step=telegram');
});
```

**Telegram Bot Setup:**

```javascript
// Option 1: Show instructions
app.get('/connect/telegram', (req, res) => {
  res.send(`
    <h2>Create Your Telegram Bot</h2>
    <ol>
      <li>Open Telegram and message @BotFather</li>
      <li>Send: /newbot</li>
      <li>Choose a name: "Barber Aziz Bot"</li>
      <li>Choose username: "barber_aziz_bot"</li>
      <li>Copy the token BotFather gives you</li>
      <li>Paste it below</li>
    </ol>
    <input id="token" placeholder="8324920431:AAF...">
    <button onclick="connectBot()">Connect</button>
  `);
});

// Option 2: QR code (easier!)
app.get('/connect/telegram/qr', (req, res) => {
  const botToken = generateBotToken(); // Pre-created pool of bots
  const qrCode = generateQR(`https://t.me/${botUsername}?start=${businessId}`);
  
  res.send(`
    <h2>Scan QR Code to Start Bot</h2>
    <img src="${qrCode}">
    <p>Waiting for you to scan...</p>
  `);
  
  // Poll until user scans
  waitForTelegramStart(businessId).then(() => {
    // Connected!
    updateBusiness(businessId, {
      telegramConnected: true,
      telegramBotToken: botToken
    });
  });
});
```

---

### Step 4: Email Verification (1 hour)

```javascript
// Send verification email
const sendVerificationEmail = async (email, businessId) => {
  const token = crypto.randomBytes(32).toString('hex');
  
  // Save token
  verificationTokens.set(token, { email, businessId, expires: Date.now() + 86400000 });
  
  // Send email (using free service like SendGrid, Mailgun, or Resend)
  await sendEmail({
    to: email,
    subject: 'Verify your REPLAI account',
    html: `
      <h1>Welcome to REPLAI! 🎉</h1>
      <p>Click the link below to verify your email:</p>
      <a href="https://replai-xc95.onrender.com/verify?token=${token}">
        Verify Email
      </a>
      <p>This link expires in 24 hours.</p>
    `
  });
};

// Verify endpoint
app.get('/verify', (req, res) => {
  const { token } = req.query;
  const data = verificationTokens.get(token);
  
  if (!data || data.expires < Date.now()) {
    return res.send('Invalid or expired token');
  }
  
  // Mark verified
  updateBusiness(data.businessId, { emailVerified: true });
  verificationTokens.delete(token);
  
  res.redirect('/onboarding');
});
```

---

### Step 5: Pre-Built Templates (30 min)

**Industry Templates (Auto-configure based on category):**

```javascript
const industryTemplates = {
  barbershop: {
    services: [
      { name: 'Haircut', price: 500 },
      { name: 'Beard trim', price: 300 },
      { name: 'Haircut + Beard', price: 700 }
    ],
    hours: { 'mon-fri': '09:00-19:00', sat: '10:00-18:00', sun: 'closed' },
    greeting: "Hello! Welcome to {businessName}. How can I help you today?",
    aiPrompt: "You are a professional barber shop assistant. Be friendly and help customers book appointments."
  },
  
  restaurant: {
    services: [
      { name: 'Dine-in reservation' },
      { name: 'Takeout order' },
      { name: 'Delivery' }
    ],
    hours: { 'daily': '11:00-22:00' },
    greeting: "Welcome to {businessName}! Would you like to make a reservation or place an order?",
    aiPrompt: "You are a restaurant assistant. Help customers with reservations, menu questions, and orders."
  },
  
  // Add more industries...
};

// Auto-apply template on signup
app.post('/api/auth/signup', async (req, res) => {
  const { businessName, category } = req.body;
  const template = industryTemplates[category] || industryTemplates.default;
  
  const business = {
    id: generateId(),
    name: businessName,
    category,
    ...template, // Auto-apply template
    createdAt: new Date()
  };
  
  saveBusinesses(business);
  res.json({ businessId: business.id });
});
```

---

### Step 6: Onboarding Progress Tracking (30 min)

```javascript
// Track where client is in onboarding
const onboardingStatus = {
  signup: { completed: true, completedAt: '2026-10-08T10:00:00Z' },
  emailVerified: { completed: true, completedAt: '2026-10-08T10:05:00Z' },
  instagramConnected: { completed: false },
  telegramConnected: { completed: false },
  businessInfo: { completed: false },
  aiConfig: { completed: false },
  tested: { completed: false }
};

// Progress bar in UI
<div class="progress">
  <div class="progress-bar" style="width: 40%">2 of 5 steps</div>
</div>

// Save to businesses.json
{
  "id": "biz_002",
  "name": "Barber Aziz",
  "onboarding": {
    "completed": false,
    "currentStep": "instagram",
    "progress": 40
  }
}

// Resume onboarding
app.get('/onboarding', (req, res) => {
  const business = getCurrentBusiness(req);
  const step = business.onboarding.currentStep;
  
  // Redirect to current step
  res.redirect(`/onboarding/${step}`);
});
```

---

## 🎯 Implementation Priority

### Phase 1: Basic Self-Service (Week 1)
**Goal:** Client can signup and connect platforms without your help

1. **Day 1:** Signup page + JWT auth (2h)
2. **Day 2:** Onboarding wizard UI (3h)
3. **Day 3:** Instagram OAuth (4h)
4. **Day 4:** Telegram connection (3h)
5. **Day 5:** Business info form (2h)
6. **Day 6:** Testing + bug fixes (4h)
7. **Day 7:** Documentation + video tutorial (2h)

**Result:** Client onboarding time: 30min → 10min

### Phase 2: One-Click Setup (Week 2)
**Goal:** Client onboarding in 5 minutes

1. **Email verification** (1h)
2. **Industry templates** (2h)
3. **Progress tracking** (1h)
4. **Test automation** (send test message automatically) (2h)
5. **Welcome email with tips** (1h)

**Result:** Client onboarding time: 10min → 5min

### Phase 3: Zero-Touch Onboarding (Week 3)
**Goal:** Client onboarding in 2 minutes

1. **Pre-created Telegram bots pool** (you create 100 bots in advance)
2. **QR code connect** (scan QR, done)
3. **AI auto-fills business info** (from Instagram bio)
4. **Skip manual testing** (auto-test in background)
5. **Smart defaults** (works out of box, configure later if needed)

**Result:** Client onboarding time: 5min → 2min

---

## 📊 Technical Architecture

### Current (Manual)
```
Client
  ↓
You (manual work)
  ↓
businesses.json
  ↓
Server
```

### Target (Automated)
```
Client
  ↓
Signup Form → /api/auth/signup
  ↓
Onboarding Wizard → /onboarding
  ↓
Connect Instagram → Meta OAuth → Save token
  ↓
Connect Telegram → Bot setup → Save token
  ↓
Business Info → Form → Save to DB
  ↓
AI Config → Defaults applied
  ↓
Test → Auto-send test message
  ↓
Dashboard → Client sees everything working
```

**Zero manual work from you!**

---

## 🛠️ Technical Stack Additions

### New Dependencies
```bash
npm install jsonwebtoken nodemailer qrcode
```

- **jsonwebtoken** - JWT auth tokens
- **nodemailer** - Email verification
- **qrcode** - Generate QR codes for Telegram

### New Files to Create
```
/signup.html          - Signup form
/onboarding.html      - Onboarding wizard
/verify-email.html    - Email verification page
/onboarding/*.html    - Individual onboarding steps
```

### New API Routes
```javascript
POST   /api/auth/signup              - Create account
GET    /verify?token=...             - Verify email
GET    /onboarding                   - Onboarding wizard
GET    /connect/instagram            - Instagram OAuth
GET    /connect/instagram/callback   - OAuth callback
POST   /connect/telegram             - Connect Telegram bot
POST   /api/onboarding/business-info - Save business info
POST   /api/onboarding/ai-config     - Configure AI
POST   /api/onboarding/test          - Send test message
GET    /api/onboarding/status        - Check progress
```

---

## 💡 Smart Features

### Auto-Pilot Mode
```javascript
// Client just enters email, everything else is automatic
POST /api/auth/quick-signup
{
  email: "aziz@barber.com",
  businessName: "Barber Aziz"
}

Response:
{
  message: "Check your email for next steps!",
  onboardingLink: "https://replai.com/onboard/abc123"
}

// Email contains:
// 1. Instagram connect link (1 click)
// 2. Telegram bot QR code (scan)
// 3. "Setup complete! Go to dashboard"
```

### Smart Defaults
```javascript
// AI analyzes Instagram profile and auto-fills
const instagramProfile = await getInstagramProfile(accountId);

// Extract from bio:
// "💈 Barber Shop | Bishkek | 10am-7pm | Call: +996555001001"

const aiParsed = {
  businessType: "barbershop", // from emoji + text
  location: "Bishkek",        // from text
  hours: "10:00-19:00",       // from text
  phone: "+996555001001"      // from text
};

// Auto-apply, client just confirms
```

### Progress Emails
```javascript
// Day 1: Signup
"Welcome! You're 20% done. Next: Connect Instagram"

// Day 2: Instagram connected
"Great! You're 60% done. Next: Connect Telegram"

// Day 3: Not completed
"You're so close! Just 1 more step to activate your AI assistant"

// Day 7: Still not done
"Need help? We can finish setup for you in 5 minutes (Book a call)"
```

---

## 🎯 Success Metrics

### Current State
- Onboarding time: 30+ minutes
- Your time per client: 20 minutes
- Max clients per day: 3-4
- Completion rate: 50% (many give up)

### After Implementation
- Onboarding time: 5 minutes
- Your time per client: 0 minutes (fully automated!)
- Max clients per day: Unlimited
- Completion rate: 90%+ (easy = more complete)

### Business Impact
- **10x faster onboarding** = 10x more clients
- **Zero manual work** = You focus on marketing/sales
- **Better experience** = Higher conversion
- **Scalable** = Can grow to 1000+ clients

---

## 📝 Next Steps

### This Week (Priority: HIGH)
1. Create signup page (2h)
2. Add JWT authentication (2h)
3. Build onboarding wizard skeleton (2h)
4. Implement Instagram OAuth (4h)

### Next Week
1. Telegram bot connection (3h)
2. Business info form (2h)
3. Email verification (1h)
4. Industry templates (2h)

### Week 3
1. Progress tracking (1h)
2. Test automation (2h)
3. QR code generation (1h)
4. Documentation (2h)

---

## 🚀 Result

**Before:** You manually onboard 1 client/hour = 8 clients/day max

**After:** System automatically onboards unlimited clients = 100+ clients/day possible

**This is how you scale from 10 clients to 1000 clients!**

---

Want me to start implementing the signup page now?
