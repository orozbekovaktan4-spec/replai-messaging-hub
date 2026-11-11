# 🚀 Full Implementation Prompt for Claude Code

## CONTEXT & GOAL

You are implementing a **Business Onboarding Questionnaire System** for REPLAI - an AI-powered messaging automation platform. The system needs to collect detailed business information from owners and automatically generate a custom RAG (Retrieval Augmented Generation) knowledge base for their AI assistant.

---

## CURRENT SYSTEM ARCHITECTURE

### **Tech Stack:**
- **Backend:** Node.js + Express
- **Database:** Prisma ORM with PostgreSQL
- **AI Engine:** Groq API (free LLM)
- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Deployment:** Render.com

### **Key Files:**
- `/server-new.js` - Main Express server
- `/ai-engine-free.js` - AI response generation
- `/business-info.json` - Primary RAG knowledge base (single global file)
- `/admin-super.html` - Admin dashboard
- `/db.js` - Database operations with Prisma

### **Database Schema (Prisma):**
```prisma
model Business {
  id              String    @id
  email           String    @unique
  name            String
  industry        String?
  ownerName       String?
  password        String
  instagram       String?   // JSON: {connected, userId, username, accessToken, config}
  whatsapp        String?   // JSON: {connected, token, phoneId}
  telegram        String?   // JSON: {connected, token}
  plan            String?
  subscriptionEnd DateTime?
  messageCount    Int       @default(0)
  status          String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### **Current RAG System:**
```javascript
// ai-engine-free.js loads ONE global business-info.json at startup
const businessInfo = JSON.parse(fs.readFileSync('./business-info.json', 'utf8'));

// Used in createSystemPrompt() to generate AI responses
function createSystemPrompt(language, userId) {
  const { business } = businessInfo;
  return `You are an AI customer service assistant for ${business.name}...`;
}
```

**Current Limitation:** ONE global RAG for ALL businesses. Need to make it per-business.

---

## REQUIREMENTS

### **Phase 1: Business Onboarding Wizard**

Create a multi-step wizard that collects:

**Step 1: Basic Information**
- Business name (required)
- Business description (required) - detailed, for AI context
- Industry/category (dropdown)
- Owner/contact name (required)

**Step 2: Contact Information**
- Phone number (required)
- Email (required)
- Full address (required)
- Website (optional)

**Step 3: Business Hours**
- Operating hours for each day (Monday-Sunday)
- Visual time picker (open time, close time)
- "Closed" checkbox for days off
- Default: Mon-Fri 09:00-18:00, Sat 10:00-16:00, Sun closed

**Step 4: Services & Products**
- Dynamic list of services
- Each service has:
  - Name (required)
  - Description (required)
  - Price (required)
  - Duration in minutes (required)
- Add/remove service buttons
- Minimum 1 service required

**Step 5: Frequently Asked Questions**
- Dynamic list of Q&A pairs
- Each FAQ has:
  - Question (required)
  - Answer (required)
- Add/remove FAQ buttons
- Optional (0+ FAQs allowed)

**Step 6: AI Configuration**
- AI tone/personality (dropdown):
  - Professional & Formal
  - Friendly & Approachable (default)
  - Casual & Relaxed
  - Luxury & Premium
- Default language (dropdown):
  - Auto-detect customer language (default)
  - English only
  - Russian only
  - Kyrgyz only
- Response length (dropdown):
  - Short & Concise (default)
  - Balanced
  - Detailed & Thorough
- Custom instructions (textarea, optional)

**Step 7: Review & Confirm**
- Show summary of all entered data
- Allow going back to edit
- "Create Business" button

**Step 8: Success Screen**
- Confirmation animation
- "Go to Dashboard" button

### **Phase 2: Backend API Endpoint**

Create `/api/admin/create-business-with-rag` that:
1. Receives all business data from wizard
2. Generates unique business ID
3. Creates business in database
4. Generates custom `business-info-{businessId}.json` file
5. Returns success/failure

### **Phase 3: Per-Business RAG System**

Modify AI engine to load business-specific RAG:
1. When webhook arrives, identify business by Instagram userId
2. Load that business's specific RAG file
3. Generate AI response using business-specific context
4. Each business has independent AI knowledge

---

## DETAILED IMPLEMENTATION GUIDE

### **Task 1: Create Onboarding Wizard Frontend**

**File:** `/business-onboarding-wizard.html`

**Design Requirements:**
- Modern, clean UI with gradient background
- Step-by-step wizard with progress bar
- Form validation on each step
- Smooth transitions between steps
- Mobile-responsive (but desktop-first)
- Use Lucide icons for visual appeal
- Color scheme: Purple gradient (#667eea → #764ba2)

**Key Features:**
- Progress bar showing completion percentage
- Step indicators (dots)
- "Back" and "Next" buttons
- Dynamic service/FAQ addition
- Time picker for business hours with "Closed" toggle
- Review screen showing all collected data
- Success animation on completion

**Validation Rules:**
- Step 1: All fields required
- Step 2: Valid email, phone, non-empty address
- Step 4: At least 1 service required
- Step 7: Final validation before submit

**JavaScript Functions Needed:**
```javascript
- nextStep() - Advance to next step with validation
- previousStep() - Go back one step
- validateStep(stepNumber) - Validate current step
- showStep(stepNumber) - Display specific step
- updateProgress() - Update progress bar
- addService() - Add new service input
- addFAQ() - Add new FAQ input
- removeItem(id, type) - Remove service or FAQ
- collectServices() - Gather all service data
- collectFAQs() - Gather all FAQ data
- collectBusinessHours() - Gather hours data
- showReview() - Display review screen
- createBusiness() - Call API to create business
```

---

### **Task 2: Create Backend API Endpoint**

**File:** `/server-new.js`

Add new endpoint after existing business management endpoints:

```javascript
// Create business with custom RAG knowledge base
app.post('/api/admin/create-business-with-rag', async (req, res) => {
  try {
    const {
      name, description, industry, ownerName,
      email, phone, address, website,
      hours, services, faqs,
      aiTone, aiLanguage, responseLength, customInstructions,
      businessId
    } = req.body;

    // 1. Validate required fields
    if (!name || !description || !email || !phone || !address || !ownerName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    if (!services || services.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one service is required' 
      });
    }

    // 2. Generate business-info JSON structure
    const businessInfo = {
      business: {
        name,
        description,
        hours: hours || {},
        services: services || [],
        serviceDuration: services[0]?.duration || 30,
        contact: {
          phone,
          email,
          address,
          website: website || ''
        },
        faqs: faqs || []
      }
    };

    // 3. Save business-specific RAG file
    const fs = await import('fs');
    const path = await import('path');
    const ragFilePath = path.join(__dirname, `business-info-${businessId}.json`);
    fs.writeFileSync(ragFilePath, JSON.stringify(businessInfo, null, 2), 'utf8');
    
    console.log(`[Admin] Created RAG file: business-info-${businessId}.json`);

    // 4. Create business in database
    const business = await db.createBusiness({
      id: businessId,
      email,
      name,
      industry: industry || 'General',
      ownerName,
      password: await bcrypt.hash('changeme123', 10), // Default password
      plan: 'free',
      status: 'active',
      messageCount: 0
    });

    // 5. Store AI configuration in database (optional: add to schema if needed)
    // For now, it's in the RAG file which is sufficient

    console.log(`[Admin] ✅ Business created: ${businessId} - ${name}`);

    res.json({
      success: true,
      message: 'Business created successfully',
      business: {
        id: business.id,
        name: business.name,
        email: business.email
      },
      ragFile: `business-info-${businessId}.json`
    });

  } catch (error) {
    console.error('[Admin] Error creating business:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

---

### **Task 3: Modify AI Engine for Per-Business RAG**

**File:** `/ai-engine-free.js`

**Current Code:**
```javascript
// OLD: Global RAG loaded once at startup
const businessInfo = JSON.parse(fs.readFileSync('./business-info.json', 'utf8'));

function createSystemPrompt(language, userId) {
  const { business } = businessInfo;
  return `You are an AI assistant for ${business.name}...`;
}
```

**New Code:**
```javascript
// NEW: Load business-specific RAG dynamically
function loadBusinessInfo(businessId) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Try business-specific file first
    const specificPath = path.join(__dirname, `business-info-${businessId}.json`);
    if (fs.existsSync(specificPath)) {
      return JSON.parse(fs.readFileSync(specificPath, 'utf8'));
    }
    
    // Fallback to default
    const defaultPath = path.join(__dirname, 'business-info.json');
    if (fs.existsSync(defaultPath)) {
      return JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
    }
    
    throw new Error('No business info file found');
  } catch (error) {
    console.error('[AI] Error loading business info:', error);
    return null;
  }
}

// Modified: Accept businessId parameter
function createSystemPrompt(language, userId, businessId) {
  const businessInfo = loadBusinessInfo(businessId);
  if (!businessInfo) {
    return 'You are a helpful AI assistant.'; // Fallback prompt
  }
  
  const { business } = businessInfo;
  const responseLanguage = languageNames[language] || languageNames.auto;
  const bookingContext = createBookingContext(userId);

  return `You are an AI customer service assistant for ${business.name}. ${business.description}

YOUR ROLE:
You help customers by providing accurate information about our business, products, services, hours, and pricing. You are professional, helpful, and efficient.

BUSINESS INFORMATION:

📍 ${business.name}
${business.description}

⏰ BUSINESS HOURS:
${Object.entries(business.hours).map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`).join('\n')}

💼 SERVICES & PRICING:
${business.services.map(s => `• ${s.name} - ${s.description}\n  Price: ${s.price}`).join('\n')}

📞 CONTACT INFORMATION:
Phone: ${business.contact.phone}
Email: ${business.contact.email}
Address: ${business.contact.address}
${business.contact.website ? `Website: ${business.contact.website}` : ''}

${business.faqs && business.faqs.length > 0 ? `❓ FREQUENTLY ASKED QUESTIONS:
${business.faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}` : ''}

${bookingContext}

BOOKING INSTRUCTIONS:
- When a customer wants to book, ask for the service, date, time, customer name, and phone number.
- After collecting details, confirm with: "I'll book you for [service] on [date] at [time]. Shall I proceed?"
- On confirmation, create the reservation through the booking system/API.
- Never double-book a time slot. Check reserved slots and suggest another available time if needed.
- If a customer asks about their bookings, use the Customer active bookings listed above.
- For cancellations, offer to cancel only after the customer confirms.

RESPONSE GUIDELINES:
1. ALWAYS greet new customers professionally: "Hello! Welcome to ${business.name}. How can I help you today?"
2. Keep responses SHORT and DIRECT (2-3 sentences maximum)
3. Use bullet points for lists (hours, services, prices)
4. ONLY provide information from the business details above
5. If asked about something not in your knowledge, say: "For that specific information, please contact us at ${business.contact.phone} or ${business.contact.email}"
6. NEVER make up prices, hours, or services
7. Be warm but professional - you represent a business
8. End responses with a helpful question or call-to-action when appropriate
9. Always respond in ${responseLanguage}. If set to same language, detect the customer's language and match it.
10. For booking requests, collect the required details and follow BOOKING INSTRUCTIONS instead of redirecting them

TONE: Professional, helpful, efficient, and friendly - like a well-trained customer service representative.`;
}

// Modified: Pass businessId through the call chain
export async function getAIResponse(userId, userMessage, language = readSavedLanguage(), businessId = null) {
  const provider = process.env.AI_PROVIDER || 'groq';
  const maxRetries = 3;
  let lastError = null;
  let currentKeyId = null;

  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }

  const history = conversationHistory.get(userId);

  history.push({
    role: 'user',
    content: userMessage
  });

  if (history.length > 10) {
    history.splice(0, history.length - 10);
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const keyData = aiKeyManager.getNextKey(provider);
      currentKeyId = keyData.id;

      console.log(`🤖 [AI] Attempt ${attempt + 1}/${maxRetries} using key: ${keyData.name} (${keyData.provider})`);

      let assistantMessage;
      switch (provider) {
        case 'groq':
          // Pass businessId to groq function
          assistantMessage = await getGroqResponse(userMessage, history, language, userId, businessId, keyData.apiKey);
          break;
        // ... other providers
      }

      aiKeyManager.updateKeyStats(keyData.id, true);

      history.push({
        role: 'assistant',
        content: assistantMessage
      });

      return assistantMessage;

    } catch (error) {
      lastError = error;
      // ... error handling
    }
  }

  console.error(`❌ [AI] All attempts failed. Last error:`, lastError?.message);
  const fallbackLang = language === 'auto' ? 'en' : language;
  return fallbackMessages[fallbackLang] || fallbackMessages.en;
}

// Modified Groq function to accept businessId
async function getGroqResponse(userMessage, history, language, userId, businessId, apiKey) {
  try {
    const messages = [
      { role: 'system', content: createSystemPrompt(language, userId, businessId) },
      ...history
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: messages,
        max_tokens: 200,
        temperature: 0.3,
        top_p: 0.9
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('[Groq] API Error:', data.error);
      throw new Error(data.error.message || 'Groq API error');
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('[Groq] Unexpected response format:', JSON.stringify(data));
      throw new Error('Invalid response format from Groq');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('[Groq] Error:', error.message);
    throw error;
  }
}
```

---

### **Task 4: Update Instagram Message Handler**

**File:** `/server-new.js`

Find `handleInstagramMessage` function and modify:

```javascript
async function handleInstagramMessage(event) {
  const startTime = Date.now();
  try {
    const senderId = event.sender.id;
    const recipientId = event.recipient.id; // Instagram Business Account ID
    const messageText = event.message.text;

    console.log('[Instagram DM] Received from:', senderId, 'to:', recipientId);
    console.log('[Instagram DM] Message:', messageText);

    // Find business by Instagram userId
    const businesses = await db.getAllBusinesses();
    const business = businesses.find(b => {
      try {
        const ig = typeof b.instagram === 'string' ? JSON.parse(b.instagram) : b.instagram;
        return ig && ig.userId === recipientId;
      } catch (e) {
        return false;
      }
    });

    if (!business) {
      console.error('[Instagram DM] No business found for Instagram userId:', recipientId);
      return;
    }

    console.log('[Instagram DM] Business found:', business.name);

    // Get Instagram config
    let instagramData = typeof business.instagram === 'string' ? JSON.parse(business.instagram) : business.instagram;
    const config = instagramData.config || {};

    if (!config.dmEnabled) {
      console.log('[Instagram DM] DM agent disabled for business:', business.name);
      return;
    }

    // Generate AI response - PASS BUSINESS ID HERE
    const replyText = await getAIResponse(senderId, messageText, 'auto', business.id);

    // Send reply
    const accessToken = (instagramData.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN || '').trim();
    await sendInstagramMessage(recipientId, senderId, replyText, accessToken);

    console.log('[Instagram DM] Reply sent successfully');

    // Log message
    const responseTime = Date.now() - startTime;
    logMessage({
      businessId: business.id,
      platform: 'instagram',
      direction: 'out',
      sender: recipientId,
      recipient: senderId,
      message: replyText,
      status: 'sent',
      responseTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Instagram DM] Handler error:', error);
  }
}
```

---

### **Task 5: Integrate Wizard into Admin Panel**

**File:** `/admin-super.html`

Add button to open wizard:

```javascript
// Find the "Add New Business" button and modify onclick:
<button class="btn-primary-large" onclick="openOnboardingWizard()">
    <i data-lucide="plus" style="width: 20px; height: 20px;"></i>
    <span>Add New Business</span>
</button>

<script>
function openOnboardingWizard() {
    window.location.href = '/business-onboarding-wizard.html';
}
</script>
```

Or embed as modal:

```javascript
function openOnboardingWizard() {
    // Open wizard in iframe modal
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = `
        <iframe src="/business-onboarding-wizard.html" 
                style="width: 95%; height: 95%; border: none; border-radius: 20px;">
        </iframe>
    `;
    document.body.appendChild(modal);
    
    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            loadBusinessesDashboard(); // Refresh list
        }
    });
}
</script>
```

---

## TESTING CHECKLIST

After implementation, verify:

### **Frontend Wizard:**
- [ ] All 7 steps display correctly
- [ ] Progress bar updates
- [ ] Form validation works
- [ ] Can add/remove services
- [ ] Can add/remove FAQs
- [ ] Business hours picker works
- [ ] Closed checkbox disables time inputs
- [ ] Review screen shows all data
- [ ] API call succeeds on submit
- [ ] Success screen appears
- [ ] "Go to Dashboard" redirects correctly

### **Backend API:**
- [ ] `/api/admin/create-business-with-rag` accepts POST
- [ ] Validates required fields
- [ ] Generates unique business ID
- [ ] Creates database record
- [ ] Generates `business-info-{id}.json` file
- [ ] Returns success response
- [ ] Handles errors gracefully

### **AI Engine:**
- [ ] `getAIResponse()` accepts businessId parameter
- [ ] Loads correct RAG file per business
- [ ] Falls back to default if file missing
- [ ] System prompt includes business-specific data
- [ ] Different businesses get different AI responses

### **Integration:**
- [ ] Instagram webhook identifies correct business
- [ ] Passes business ID to AI engine
- [ ] AI responds with correct business context
- [ ] Business 1 Instagram → Business 1 AI knowledge
- [ ] Business 2 Instagram → Business 2 AI knowledge

---

## SUCCESS CRITERIA

✅ **Wizard Complete:**
- User can fill out all 7 steps
- Data is collected correctly
- Business is created in database
- Custom RAG file is generated

✅ **Per-Business RAG Working:**
- Each business has own `business-info-{id}.json`
- AI loads correct RAG based on business ID
- Different businesses get different AI responses
- No interference between businesses

✅ **Production Ready:**
- Error handling implemented
- Loading states shown
- Validation messages clear
- Mobile-responsive (optional)
- Admin panel integrated

---

## EXAMPLE DATA FOR TESTING

**Test Business 1: Jewelry Store**
```json
{
  "name": "White Gold",
  "description": "Premium jewelry store specializing in gold, silver, and custom jewelry designs",
  "industry": "Jewelry",
  "services": [
    {"name": "Custom Design", "description": "Create unique pieces", "price": "5,000 сом", "duration": 30},
    {"name": "Ring Resizing", "description": "Perfect fit", "price": "500 сом", "duration": 20}
  ],
  "hours": {
    "monday": "10:00-19:00",
    "tuesday": "10:00-19:00",
    "wednesday": "10:00-19:00",
    "thursday": "10:00-19:00",
    "friday": "10:00-19:00",
    "saturday": "10:00-18:00",
    "sunday": "closed"
  },
  "faqs": [
    {"question": "Do you buy gold?", "answer": "Yes, we buy gold jewelry at competitive market rates."}
  ]
}
```

**Test Business 2: Barber Shop**
```json
{
  "name": "Aziz Barber Shop",
  "description": "Professional barber shop offering men's haircuts, beard grooming, and styling services",
  "industry": "Barbershop",
  "services": [
    {"name": "Haircut", "description": "Classic men's haircut", "price": "500 сом", "duration": 30},
    {"name": "Beard Trim", "description": "Beard shaping", "price": "300 сом", "duration": 20}
  ],
  "hours": {
    "monday": "09:00-20:00",
    "tuesday": "09:00-20:00",
    "wednesday": "09:00-20:00",
    "thursday": "09:00-20:00",
    "friday": "09:00-20:00",
    "saturday": "10:00-18:00",
    "sunday": "closed"
  }
}
```

---

## FILES TO MODIFY

1. **Create:** `/business-onboarding-wizard.html` (new file)
2. **Modify:** `/server-new.js` (add endpoint, update handler)
3. **Modify:** `/ai-engine-free.js` (per-business RAG loading)
4. **Modify:** `/admin-super.html` (integrate wizard button)

---

## DEPLOYMENT STEPS

1. Implement all changes locally
2. Test with 2 different businesses
3. Verify AI responses are business-specific
4. Commit changes:
   ```bash
   git add .
   git commit -m "Add business onboarding wizard with per-business RAG"
   git push
   ```
5. Wait 2 minutes for Render deployment
6. Test in production

---

## ADDITIONAL NOTES

### **Security Considerations:**
- Sanitize all user inputs before saving
- Validate email format
- Prevent XSS in form fields
- Rate limit the API endpoint
- Require authentication for API (add auth middleware)

### **Future Enhancements:**
- Upload business logo
- Add product catalog (beyond services)
- Multi-language support for wizard
- Preview AI responses before creating
- Import/export business data
- Duplicate business template
- Business categories with pre-filled templates

---

## PROMPT FOR CLAUDE CODE

Copy everything above and paste into Claude Code with this instruction:

```
Implement the Business Onboarding Questionnaire System as described above.

Focus on:
1. Creating the beautiful wizard UI (/business-onboarding-wizard.html)
2. Adding the API endpoint (/api/admin/create-business-with-rag) 
3. Modifying AI engine for per-business RAG loading
4. Updating Instagram handler to pass businessId

Use the existing code structure and follow the patterns already in place.
Test thoroughly and ensure different businesses get different AI responses.
```

---

**END OF PROMPT**
