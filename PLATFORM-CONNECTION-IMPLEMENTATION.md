# 🔌 Platform Connection Implementation - Copy Fusion AI Exactly

**Goal:** 1:1 connection flow like Fusion AI for Instagram, WhatsApp, and Telegram

---

## Instagram Connection (Copy Fusion Exactly)

### UI Flow (Designer):

**Page 1: Prerequisites Check**
```
┌─────────────────────────────────────┐
│ Connect Instagram                    │
├─────────────────────────────────────┤
│                                      │
│ Before connecting, make sure:       │
│                                      │
│ ☐ You have a Business or Creator   │
│   account (not Personal)            │
│                                      │
│   How to check: Look for            │
│   "Professional Dashboard" or       │
│   "Insights" on your profile        │
│                                      │
│   [How to Switch →]                 │
│                                      │
│ ☐ Message access is enabled        │
│                                      │
│   Settings → Messages → Message     │
│   controls → Toggle ON "Allow       │
│   access to messages"               │
│                                      │
│   [Show Instructions →]             │
│                                      │
│ [✓ I've completed these steps]     │
│                                      │
│ [Connect Instagram →]               │
└─────────────────────────────────────┘
```

**Page 2: Authorization**
```
Opens Meta OAuth popup:
→ User clicks "Allow"
→ Redirect to callback
→ Show success notification
→ Redirect to Instagram settings
```

**Page 3: Instagram Settings**
```
┌─────────────────────────────────────┐
│ Instagram Settings                   │
├─────────────────────────────────────┤
│                                      │
│ Status: ● Connected (@username)     │
│                                      │
│ ┌───────────────────────────────┐  │
│ │ Activate AI Agent             │  │
│ │ ────────────────○ ON          │  │
│ └───────────────────────────────┘  │
│                                      │
│ Where should AI respond?            │
│                                      │
│ ☑ Direct Messages (DMs)            │
│ ☑ Comments on posts                │
│                                      │
│ ─────────────────────────────────  │
│                                      │
│ Response Rules:                     │
│                                      │
│ Rule 1: Reply to All DMs           │
│ ┌─────────────────────────────┐   │
│ │ Trigger: (leave empty)       │   │
│ │                              │   │
│ │ Response Type:               │   │
│ │ ○ AI Generated (Dynamic)     │   │
│ │ ○ Template Answer            │   │
│ │ ○ Extended Prompt            │   │
│ └─────────────────────────────┘   │
│                                      │
│ [+ Add Another Rule]                │
│                                      │
│ Rule 2: Keyword "цены" → prices    │
│ ┌─────────────────────────────┐   │
│ │ Trigger: цены, price         │   │
│ │                              │   │
│ │ ● Extended Prompt            │   │
│ │ Дополнительный контекст:     │   │
│ │ Стрижка - 500 сом            │   │
│ │ Борода - 300 сом             │   │
│ └─────────────────────────────┘   │
│                                      │
│ ─────────────────────────────────  │
│                                      │
│ Comment-to-DM Funnel:               │
│                                      │
│ ☑ Reply in comments                │
│   Template: "Отправил вам в DM! 💬"│
│                                      │
│ ☑ Send Direct Message              │
│   ● AI Generated                    │
│   ○ Template                        │
│                                      │
│ [Save Settings]                     │
└─────────────────────────────────────┘
```

### Backend Implementation:

```javascript
// 1. Prerequisites check endpoint
GET /api/instagram/prerequisites
Response: {
  checks: [
    { 
      id: "professional_account",
      title: "Professional Account",
      description: "Switch to Business or Creator",
      howTo: "Profile → Menu → Settings → Switch to Professional",
      required: true
    },
    {
      id: "message_access",
      title: "Message Access Enabled",
      description: "Allow access to messages",
      howTo: "Settings → Messages → Toggle ON 'Allow access'",
      required: true
    }
  ]
}

// 2. Start OAuth flow
GET /api/instagram/connect?businessId=biz_001
→ Redirect to:
https://www.facebook.com/v23.0/dialog/oauth?
  client_id=YOUR_APP_ID&
  redirect_uri=https://replai.com/callback/instagram&
  scope=instagram_basic,instagram_manage_messages,instagram_manage_comments&
  state=biz_001

// 3. Callback handler
GET /api/callback/instagram?code=ABC123&state=biz_001
→ Exchange code for token
→ Get Instagram account info
→ Save to database:
{
  businessId: "biz_001",
  platform: "instagram",
  username: "@barber_aziz",
  accountId: "17841442927870144",
  accessToken: "encrypted_token",
  connected: true,
  settings: {
    enabled: false, // User must turn ON manually
    directMessages: true,
    comments: true,
    rules: []
  }
}
→ Redirect to /instagram/settings

// 4. Update settings
PUT /api/instagram/settings
{
  businessId: "biz_001",
  enabled: true,
  directMessages: true,
  comments: true,
  rules: [
    {
      id: "rule_001",
      trigger: "", // Empty = all messages
      responseType: "ai_generated"
    },
    {
      id: "rule_002",
      trigger: "цены,price,стоимость",
      responseType: "extended_prompt",
      context: "Стрижка - 500 сом\nБорода - 300 сом"
    }
  ],
  commentToDM: {
    enabled: true,
    replyInComments: true,
    commentTemplate: "Отправил вам в DM! 💬",
    sendDM: true,
    dmType: "ai_generated"
  }
}

// 5. Message processing logic
async function processInstagramMessage(message) {
  const business = await getBusiness(message.recipientId);
  const settings = business.instagram.settings;
  
  // Check if enabled
  if (!settings.enabled) return;
  
  // Check if it's a DM or comment
  const isComment = message.type === 'comment';
  if (isComment && !settings.comments) return;
  if (!isComment && !settings.directMessages) return;
  
  // Match rules
  const matchedRule = settings.rules.find(rule => {
    if (!rule.trigger) return true; // Empty = match all
    const keywords = rule.trigger.split(',').map(k => k.trim().toLowerCase());
    return keywords.some(k => message.text.toLowerCase().includes(k));
  });
  
  if (!matchedRule) return;
  
  // Generate response based on rule type
  let response;
  switch (matchedRule.responseType) {
    case 'ai_generated':
      response = await getAIResponse(business.id, message.text);
      break;
    case 'template':
      response = matchedRule.template;
      break;
    case 'extended_prompt':
      const extendedPrompt = `
        ${business.aiPrompt}
        
        Additional context for this question:
        ${matchedRule.context}
      `;
      response = await getAIResponse(business.id, message.text, extendedPrompt);
      break;
  }
  
  // Send response
  if (isComment) {
    // Comment-to-DM funnel
    if (settings.commentToDM.enabled) {
      // Reply in comments
      if (settings.commentToDM.replyInComments) {
        await replyToComment(message.commentId, settings.commentToDM.commentTemplate);
      }
      
      // Send DM
      if (settings.commentToDM.sendDM) {
        const dmText = settings.commentToDM.dmType === 'ai_generated' 
          ? response 
          : settings.commentToDM.dmTemplate;
        await sendInstagramDM(message.senderId, dmText);
      }
    } else {
      // Just reply to comment
      await replyToComment(message.commentId, response);
    }
  } else {
    // Direct message
    await sendInstagramDM(message.senderId, response);
  }
}
```

---

## WhatsApp Connection (QR Code Method - Personal WhatsApp)

### UI Flow:

**Page 1: Connection Method Selection**
```
┌─────────────────────────────────────┐
│ Connect WhatsApp                     │
├─────────────────────────────────────┤
│                                      │
│ Choose connection method:           │
│                                      │
│ ┌─────────────────────────────┐   │
│ │ 📱 Personal WhatsApp         │   │
│ │                              │   │
│ │ Link your existing WhatsApp  │   │
│ │ using QR code               │   │
│ │                              │   │
│ │ ✓ Setup in 30 seconds       │   │
│ │ ✓ Works immediately         │   │
│ │                              │   │
│ │ [Connect →]                  │   │
│ └─────────────────────────────┘   │
│                                      │
│ ┌─────────────────────────────┐   │
│ │ 🏢 WhatsApp Business API     │   │
│ │                              │   │
│ │ Official Meta integration    │   │
│ │                              │   │
│ │ ⚠ Requires Business account │   │
│ │ ⚠ Needs Meta approval       │   │
│ │                              │   │
│ │ [Connect →]                  │   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Page 2: QR Code Scan (Personal WhatsApp)**
```
┌─────────────────────────────────────┐
│ Scan QR Code                        │
├─────────────────────────────────────┤
│                                      │
│ Instructions:                       │
│                                      │
│ 1. Open WhatsApp on your phone     │
│                                      │
│ 2. Go to Settings → Linked Devices │
│                                      │
│ 3. Tap "Link a Device" (+)         │
│                                      │
│ 4. Scan this QR code:              │
│                                      │
│    ┌─────────────────┐             │
│    │                 │             │
│    │   [QR CODE]     │             │
│    │                 │             │
│    └─────────────────┘             │
│                                      │
│ ⏱ Waiting for scan...              │
│                                      │
│ ⚠ Important:                        │
│ • Use accounts 3+ months old       │
│ • Don't spam or bulk message       │
│                                      │
│ [I understand, proceed]            │
└─────────────────────────────────────┘
```

**Page 3: Connected Success**
```
┌─────────────────────────────────────┐
│ WhatsApp Connected! ✓               │
├─────────────────────────────────────┤
│                                      │
│ Phone: +996 555 001 001            │
│ Status: ● Active                    │
│                                      │
│ ┌───────────────────────────────┐  │
│ │ Activate AI Agent             │  │
│ │ ────────────────○ ON          │  │
│ └───────────────────────────────┘  │
│                                      │
│ ┌───────────────────────────────┐  │
│ │ Reply in Groups               │  │
│ │ ────────────────○ OFF         │  │
│ │                               │  │
│ │ ⚠ Recommended OFF to avoid    │  │
│ │ spamming shared group chats   │  │
│ └───────────────────────────────┘  │
│                                      │
│ [Go to Dashboard]                   │
└─────────────────────────────────────┘
```

### Backend Implementation:

```javascript
// Use whatsapp-web.js library
const { Client, LocalAuth, QRCode } = require('whatsapp-web.js');

// 1. Initialize WhatsApp client
POST /api/whatsapp/init
{
  businessId: "biz_001"
}

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: `business_${businessId}`
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox']
  }
});

// 2. Generate QR code
client.on('qr', async (qr) => {
  // Send QR code to frontend via WebSocket or polling
  await saveQRCode(businessId, qr);
  
  // Notify frontend
  io.emit(`qr:${businessId}`, { qr });
});

// 3. Connection successful
client.on('ready', async () => {
  const info = await client.info;
  
  // Save connection
  await updateBusiness(businessId, {
    whatsapp: {
      connected: true,
      phone: info.wid.user, // Phone number
      name: info.pushname,
      settings: {
        enabled: false, // User must turn ON
        replyInGroups: false
      }
    }
  });
  
  // Notify frontend
  io.emit(`connected:${businessId}`, { 
    phone: info.wid.user,
    name: info.pushname
  });
});

// 4. Handle incoming messages
client.on('message', async (message) => {
  const business = await getBusinessByWhatsAppPhone(message.to);
  const settings = business.whatsapp.settings;
  
  // Check if enabled
  if (!settings.enabled) return;
  
  // Check if it's a group
  const chat = await message.getChat();
  if (chat.isGroup && !settings.replyInGroups) return;
  
  // Generate AI response
  const response = await getAIResponse(business.id, message.body);
  
  // Send response
  await message.reply(response);
  
  // Log conversation
  await logConversation({
    businessId: business.id,
    platform: 'whatsapp',
    customerId: message.from,
    userMessage: message.body,
    aiResponse: response
  });
});

// 5. Update settings
PUT /api/whatsapp/settings
{
  businessId: "biz_001",
  enabled: true,
  replyInGroups: false
}
```

---

## WhatsApp Business API (Official Meta)

### UI Flow:

**Page 1: Meta Authorization**
```
[Connect WhatsApp Business] button
→ Opens Meta OAuth popup
→ User logs into Facebook
→ Clicks "Continue"
```

**Page 2: Select Business & Account**
```
┌─────────────────────────────────────┐
│ Connect WhatsApp Business           │
├─────────────────────────────────────┤
│                                      │
│ Business Portfolio:                 │
│ [Replai ▼]                          │
│ [+ Create new portfolio]            │
│                                      │
│ WhatsApp Business Account:          │
│ ○ Connect existing account         │
│ ○ Create new account               │
│                                      │
│ [Next →]                            │
└─────────────────────────────────────┘
```

**Page 3: Phone Number Entry**
```
┌─────────────────────────────────────┐
│ Phone Number                        │
├─────────────────────────────────────┤
│                                      │
│ Country: [KG +996 ▼]               │
│                                      │
│ Phone: [555 001 001_____________]  │
│                                      │
│ This number must be active in       │
│ WhatsApp Business app              │
│                                      │
│ [Next →]                            │
└─────────────────────────────────────┘
```

**Page 4: QR Code Scan (WhatsApp Business)**
```
Same as personal WhatsApp QR page,
but user scans from WhatsApp Business app
instead of regular WhatsApp
```

**Page 5: Confirm & Grant Permissions**
```
┌─────────────────────────────────────┐
│ Review What You Share               │
├─────────────────────────────────────┤
│                                      │
│ REPLAI will be able to:            │
│                                      │
│ ✓ Send and receive messages        │
│ ✓ View message history             │
│ ✓ Manage contacts                  │
│ ✓ Create message templates         │
│                                      │
│ [Confirm]  [Cancel]                 │
└─────────────────────────────────────┘
```

**Page 6: Success**
```
✓ Your account is connected to REPLAI

[Finish]
```

### Backend Implementation:

```javascript
// 1. Initiate Meta OAuth
GET /api/whatsapp-business/connect?businessId=biz_001
→ Redirect to:
https://www.facebook.com/v23.0/dialog/oauth?
  client_id=YOUR_APP_ID&
  config_id=YOUR_CONFIG_ID&
  redirect_uri=https://replai.com/callback/whatsapp&
  state=biz_001&
  response_type=code

// 2. Handle callback
GET /api/callback/whatsapp?code=ABC123&state=biz_001
→ Exchange code for token
→ Get WhatsApp Business Account ID
→ Get Phone Number ID
→ Save to database

// 3. Send/receive messages
const axios = require('axios');

async function sendWhatsAppMessage(phoneNumberId, to, message) {
  await axios.post(
    `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: message }
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

// 4. Webhook handler
POST /webhook/whatsapp
{
  object: 'whatsapp_business_account',
  entry: [{
    changes: [{
      value: {
        messages: [{
          from: '996555001001',
          text: { body: 'Сколько стоит стрижка?' }
        }]
      }
    }]
  }]
}

→ Extract message
→ Generate AI response
→ Send via sendWhatsAppMessage()
```

---

## Telegram Connection

### UI Flow:

**Page 1: Instructions**
```
┌─────────────────────────────────────┐
│ Connect Telegram Bot                │
├─────────────────────────────────────┤
│                                      │
│ Follow these steps:                 │
│                                      │
│ 1. Open Telegram                    │
│                                      │
│ 2. Search for @BotFather            │
│                                      │
│ 3. Send command: /newbot            │
│                                      │
│ 4. Choose name:                     │
│    Barber Aziz Bot                  │
│                                      │
│ 5. Choose username:                 │
│    barber_aziz_bot                  │
│                                      │
│ 6. Copy the token BotFather gives  │
│                                      │
│ [I have my token →]                 │
└─────────────────────────────────────┘
```

**Page 2: Enter Token**
```
┌─────────────────────────────────────┐
│ Paste Bot Token                     │
├─────────────────────────────────────┤
│                                      │
│ Token from @BotFather:             │
│                                      │
│ ┌─────────────────────────────┐   │
│ │ 8324920431:AAFduCXo_L8146   │   │
│ │ XM9Nawx7ZIqlXgAGgaUpM       │   │
│ └─────────────────────────────┘   │
│                                      │
│ Example:                            │
│ 1234567890:ABCdefGHIjklMNOpqr      │
│                                      │
│ [Connect Bot]                       │
└─────────────────────────────────────┘
```

**Page 3: Test Bot**
```
┌─────────────────────────────────────┐
│ Bot Connected! ✓                    │
├─────────────────────────────────────┤
│                                      │
│ Bot: @barber_aziz_bot              │
│ Status: ● Active                    │
│                                      │
│ Test your bot:                      │
│                                      │
│ [Open in Telegram →]                │
│ t.me/barber_aziz_bot               │
│                                      │
│ Send /start to begin               │
│                                      │
│ ┌───────────────────────────────┐  │
│ │ Activate AI Agent             │  │
│ │ ────────────────○ ON          │  │
│ └───────────────────────────────┘  │
│                                      │
│ [Go to Dashboard]                   │
└─────────────────────────────────────┘
```

### Backend Implementation:

```javascript
// 1. Connect bot
POST /api/telegram/connect
{
  businessId: "biz_001",
  botToken: "8324920431:AAFduCXo_L8146XM9Nawx7ZIqlXgAGgaUpM"
}

// Verify token
const botInfo = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
if (!botInfo.ok) return { error: 'Invalid token' };

const bot = await botInfo.json();

// Set webhook
await fetch(
  `https://api.telegram.org/bot${botToken}/setWebhook`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: `https://replai.com/webhook/telegram/${businessId}`
    })
  }
);

// Save to database
await updateBusiness(businessId, {
  telegram: {
    connected: true,
    botToken: encrypt(botToken),
    username: bot.result.username,
    settings: {
      enabled: false
    }
  }
});

return {
  success: true,
  botUsername: bot.result.username,
  testUrl: `https://t.me/${bot.result.username}`
};

// 2. Handle messages
POST /webhook/telegram/:businessId
{
  message: {
    from: { id: 123456, first_name: 'Timur' },
    text: 'Сколько стоит стрижка?'
  }
}

const business = await getBusiness(businessId);
if (!business.telegram.settings.enabled) return;

// Generate AI response
const response = await getAIResponse(businessId, message.text);

// Send response
await fetch(
  `https://api.telegram.org/bot${business.telegram.botToken}/sendMessage`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: message.from.id,
      text: response
    })
  }
);
```

---

## Summary: Connection Status Dashboard

**Channels Tab in Dashboard:**
```
┌────────────────────────────────────────────────────┐
│ Connected Channels                                 │
├────────────────────────────────────────────────────┤
│                                                     │
│ ┌──────────────────────────────────────────────┐ │
│ │ 📸 Instagram                                  │ │
│ │ Status: ● Connected                           │ │
│ │ Account: @barber_aziz                        │ │
│ │ AI: ● Active                                  │ │
│ │                                               │ │
│ │ [Settings] [Disconnect]                       │ │
│ └──────────────────────────────────────────────┘ │
│                                                     │
│ ┌──────────────────────────────────────────────┐ │
│ │ 💬 WhatsApp                                   │ │
│ │ Status: ● Connected                           │ │
│ │ Phone: +996 555 001 001                      │ │
│ │ AI: ● Active                                  │ │
│ │                                               │ │
│ │ [Settings] [Disconnect]                       │ │
│ └──────────────────────────────────────────────┘ │
│                                                     │
│ ┌──────────────────────────────────────────────┐ │
│ │ ✈️ Telegram                                   │ │
│ │ Status: ● Connected                           │ │
│ │ Bot: @barber_aziz_bot                        │ │
│ │ AI: ● Active                                  │ │
│ │                                               │ │
│ │ [Settings] [Disconnect]                       │ │
│ └──────────────────────────────────────────────┘ │
│                                                     │
│ [+ Add Another Channel]                            │
└────────────────────────────────────────────────────┘
```

---

## Implementation Priority:

1. **Day 1-2:** Instagram connection (most important)
2. **Day 3:** Telegram connection (easiest)
3. **Day 4-5:** WhatsApp QR code method (for testing)
4. **Day 6-7:** WhatsApp Business API (official, approved accounts only)

---

**Give this to your coder to implement 1:1 like Fusion! 🚀**
