# .kiro/backend/CLAUDE.md - Server-Side Conventions

## Server.js / Express Patterns

### Route Structure

**All routes defined in server-new.js**

```javascript
// Public routes (no auth required)
app.get('/', (req, res) => { /* login.html */ });
app.post('/login', handleLogin);
app.post('/webhook/instagram', handleInstagramWebhook);
app.post('/webhook/telegram', handleTelegramWebhook);

// Protected routes (require auth)
app.get('/api/admin/stats', requireAuth, getStats);
app.post('/api/admin/business-info', requireAuth, saveBusiness);
app.get('/api/admin/bookings', requireAuth, getBookings);

// Public but signature-validated (webhooks)
app.post('/webhook/*', validateSignature, handleWebhook);
```

**Invariants:**
- Public routes first (no middleware)
- Webhook receivers second (validate signature)
- Protected routes last (require session)

### Authentication Middleware

```javascript
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function requireBusinessAuth(req, res, next) {
  const businessId = req.body.businessId || req.query.businessId;
  if (!businessId || !userHasAccessToBusiness(req.session.userId, businessId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// Usage:
app.post('/api/admin/save-business', requireAuth, requireBusinessAuth, (req, res) => {
  // Verified: user is authenticated and owns business
});
```

### Error Handling

**Pattern:**
```javascript
try {
  // Business logic
  const data = await processData();
  res.json({ success: true, data });
} catch (error) {
  console.error('[RouteName]', error.message);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
}
```

**Never:**
- ❌ Return raw error messages to client (expose internals)
- ❌ Log request bodies with sensitive data
- ❌ Forget try/catch on async code

### Request Validation

```javascript
app.post('/api/admin/endpoint', requireAuth, (req, res) => {
  // Validate required fields
  if (!req.body.email) return res.status(400).json({ error: 'Email required' });
  if (!req.body.email.includes('@')) return res.status(400).json({ error: 'Invalid email' });
  
  // Type check if needed
  if (typeof req.body.name !== 'string') {
    return res.status(400).json({ error: 'Name must be string' });
  }
  
  // Proceed
  // ...
});
```

---

## File I/O Patterns (JSON Storage)

### Reading Files

```javascript
function readUsersFile() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read users.json:', error);
    return [];  // Empty array on error
  }
}
```

### Writing Files (Atomic)

```javascript
function writeUsersFile(users) {
  try {
    // Write to temp file first
    const tempPath = path.join(__dirname, 'users.json.tmp');
    fs.writeFileSync(tempPath, JSON.stringify(users, null, 2), 'utf8');
    
    // Atomic rename
    fs.renameSync(tempPath, path.join(__dirname, 'users.json'));
  } catch (error) {
    console.error('Failed to write users.json:', error);
    // Don't throw - caller should handle
  }
}
```

**Why atomic?** Prevents corruption if write is interrupted.

### Reading Business Data

```javascript
function getBusinessById(businessId) {
  const businesses = readBusinessesFile();
  return businesses.find(b => b.id === businessId);
}
```

**Invariant:** Always read → modify → write (never partial updates)

---

## Webhook Receiver Patterns

### Instagram Webhook

```javascript
app.post('/webhook/instagram', (req, res) => {
  // 1. Validate signature immediately
  if (!validateInstagramSignature(req)) {
    return res.status(403).json({ error: 'Invalid signature' });
  }
  
  // 2. Return 200 OK immediately (don't block)
  res.status(200).send('ok');
  
  // 3. Process asynchronously
  (async () => {
    try {
      const { entry } = req.body;
      for (const e of entry) {
        for (const msg of e.messaging) {
          await processInstagramMessage(msg);
        }
      }
    } catch (error) {
      console.error('[Instagram Webhook] Process error:', error);
    }
  })();
});

function validateInstagramSignature(req) {
  const signature = req.get('X-Hub-Signature-256');
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  const payload = JSON.stringify(req.body);
  
  const expectedSignature = 'sha256=' + 
    crypto.createHmac('sha256', appSecret)
      .update(payload)
      .digest('hex');
  
  return signature === expectedSignature;
}
```

**Invariants:**
- Validate signature first
- Return 200 immediately (don't block)
- Process asynchronously
- Log all errors

### Telegram Webhook

```javascript
app.post('/webhook/telegram', (req, res) => {
  // 1. Validate (Telegram token in URL)
  if (req.params.token !== process.env.TELEGRAM_BOT_TOKEN) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  
  // 2. Return 200 immediately
  res.status(200).send('ok');
  
  // 3. Process asynchronously
  (async () => {
    try {
      const { message } = req.body;
      if (message) await processTelegramMessage(message);
    } catch (error) {
      console.error('[Telegram Webhook] Process error:', error);
    }
  })();
});
```

### WhatsApp Webhook (TO BE COMPLETED)

```javascript
app.post('/webhook/whatsapp', (req, res) => {
  // TODO: Implement
  // 1. Validate Meta signature
  // 2. Return 200 immediately
  // 3. Process message
  res.status(200).send('ok');
});
```

---

## Message Processing Pattern

```javascript
async function processInstagramMessage(msg) {
  const { sender, message, timestamp } = msg;
  const senderId = sender.id;
  const messageText = message.text;
  
  // 1. Deduplicate (check message ID against chat_logs)
  if (await messageExists(senderId, msg.mid)) {
    console.log('Duplicate message, skipping');
    return;
  }
  
  // 2. Find or create customer record
  let customer = getCustomerByPlatformId('instagram', senderId);
  if (!customer) {
    customer = createCustomer('instagram', senderId);
  }
  
  // 3. Log incoming message
  logMessage({
    customer_id: customer.id,
    platform: 'instagram',
    direction: 'incoming',
    text: messageText,
    timestamp: new Date(timestamp * 1000).toISOString()
  });
  
  // 4. Get AI response
  const aiResponse = await getAIResponse(
    messageText,
    getMessageContext(customer.id),
    customer.business_id,
    'instagram'
  );
  
  // 5. Log outgoing message
  logMessage({
    customer_id: customer.id,
    platform: 'instagram',
    direction: 'outgoing',
    text: aiResponse.text,
    timestamp: new Date().toISOString()
  });
  
  // 6. Send to platform
  await sendInstagramMessage(senderId, aiResponse.text);
  
  // 7. If booking detected, create booking record
  if (aiResponse.isBooking && aiResponse.bookingDetails) {
    createBooking(customer.id, aiResponse.bookingDetails);
  }
}
```

---

## Environment & Configuration

### Loading .env

```javascript
import dotenv from 'dotenv';

dotenv.config();  // Load .env on startup

// Validate required vars
const requiredVars = [
  'GROQ_API_KEY',
  'INSTAGRAM_APP_ID',
  'INSTAGRAM_APP_SECRET'
];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`❌ Missing required: ${varName}`);
    process.exit(1);
  }
}
```

### Using Config

```javascript
const API_KEY = process.env.GROQ_API_KEY;
const PORT = process.env.PORT || 3000;

// Never hardcode:
// ❌ const API_KEY = 'gsk_...'
```

---

## Logging Conventions

```javascript
// Format: [ServiceName] message
console.log('[Instagram] Connected as @username');
console.error('[Webhook] Failed to process message:', error.message);
console.warn('[AI Engine] Rate limit approaching');

// Don't log:
// ❌ console.log(process.env.API_KEY)
// ❌ console.log(userData)  // Contains passwords
// ❌ console.log(requestBody)  // May contain secrets
```

---

## Performance Patterns

### Caching Customer Context

```javascript
const messageCache = new Map();  // { customerId: [msg1, msg2, ...] }

function getMessageContext(customerId, limit = 10) {
  if (messageCache.has(customerId)) {
    return messageCache.get(customerId).slice(-limit);
  }
  
  const messages = readChatLogs(customerId);
  messageCache.set(customerId, messages);
  return messages.slice(-limit);
}

// Invalidate cache on new message
function logMessage(msg) {
  messageCache.delete(msg.customer_id);  // Clear cache
  // Write to file...
}
```

### Batch Operations

```javascript
async function processWebhookBatch(messages) {
  // Process in parallel (not sequential)
  const promises = messages.map(msg => processMessage(msg));
  await Promise.all(promises);
}
```

---

*Maintained by Claude Code*
