# .kiro/ai/CLAUDE.md - AI Response Generation Patterns

## Groq API Integration (ai-engine-free.js)

### Invariants

- **Only use Groq LLaMA 3.3** (free tier)
- **Maximum 2000 tokens** per request (to stay under free limits)
- **Auto-detect language** from customer message
- **Cache context** (last 10 messages per conversation)
- **Timeout: 30 seconds** max per API call
- **Retry logic:** 1 retry on rate limit (429 error)

### Calling Pattern

```javascript
import { getAIResponse } from './ai-engine-free.js';

const response = await getAIResponse(
  "Can I book a haircut tomorrow?",        // Current message
  [
    { role: 'user', content: 'Hi' },
    { role: 'assistant', content: 'Hello!' },
    ...  // Last 10 messages
  ],
  'business-id-123',                       // For fetching AI settings
  'instagram'                              // Platform context
);

// Response shape:
{
  text: "Sure! We have availability at 2 PM.",
  language: "en",
  confidence: 0.85,
  isBooking: false,
  bookingDetails: null
}
```

### Response Format Requirements

- **text:** Must be concise (max 280 chars for social media)
- **language:** One of: en, ru, ky, other
- **confidence:** 0.0 - 1.0 (how confident AI is)
- **isBooking:** Boolean (did customer request booking?)
- **bookingDetails:** { service, date, time } or null

### System Prompt Template

```javascript
const systemPrompt = `You are a helpful customer service AI for ${businessName}.

Your rules:
1. Respond in the customer's language (auto-detect from their message)
2. Keep responses short (1-2 sentences max) for social media
3. Be friendly but professional
4. If customer asks to book, respond: "I'll note that down. Your ${service} booking is pending confirmation."
5. Never make up information about business hours or services
6. If you don't know, say: "Let me connect you with the team."

Business info:
- Name: ${businessName}
- Services: ${services}
- Hours: ${hours}
- Phone: ${phone}

${customInstructions}
`;
```

### Error Handling

```javascript
async function getAIResponse(...) {
  try {
    // Call Groq
    const response = await callGroqAPI(prompt);
    return parseResponse(response);
  } catch (error) {
    if (error.status === 429) {
      // Rate limited - wait and retry
      await sleep(2000);
      return getAIResponse(...);  // 1 retry
    } else if (error.status === 401) {
      console.error('Invalid API key');
      return fallbackResponse('API error. Please try again.');
    } else {
      console.error('Groq API error:', error.message);
      return fallbackResponse('Processing error. Please try again.');
    }
  }
}

function fallbackResponse(message) {
  return {
    text: message,
    language: 'en',
    confidence: 0,
    isBooking: false,
    bookingDetails: null
  };
}
```

### Token Management

```javascript
// Count tokens before sending to API
function countTokens(text) {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

function trimContextIfNeeded(messages, maxTokens = 2000) {
  let totalTokens = 0;
  const trimmed = [];
  
  // Go backwards (most recent first)
  for (let i = messages.length - 1; i >= 0; i--) {
    const msgTokens = countTokens(messages[i].content);
    if (totalTokens + msgTokens > maxTokens) break;
    trimmed.unshift(messages[i]);
    totalTokens += msgTokens;
  }
  
  return trimmed;
}
```

### Language Detection

```javascript
function detectLanguage(text) {
  // Simple heuristic
  if (/[а-яА-ЯёЁ]/.test(text)) return 'ru';  // Russian characters
  if (/[кө-яҢ]/.test(text)) return 'ky';     // Kyrgyz characters
  return 'en';                                // Default to English
}

// Use in system prompt:
const userLanguage = detectLanguage(userMessage);
const instructions = `Respond in ${userLanguage}.`;
```

### Booking Detection

```javascript
function detectBookingIntent(text, aiResponse) {
  const bookingKeywords = [
    'book',
    'appointment',
    'reservation',
    'когда',  // when (Russian)
    'хаанта',  // when (Kyrgyz)
    'время',  // time (Russian)
    'саат'   // time (Kyrgyz)
  ];
  
  const hasKeyword = bookingKeywords.some(kw => 
    text.toLowerCase().includes(kw)
  );
  
  // Also check if AI suggested booking
  const aiSaidBooking = aiResponse.includes('pending confirmation') || 
                        aiResponse.includes('note that down');
  
  return hasKeyword || aiSaidBooking;
}

// Parse date/time from response
function extractBookingDetails(aiResponse, business) {
  // If AI detected booking, extract proposed date/time
  // This is simplified - real implementation would parse AI response
  return {
    service: 'haircut',  // Default service
    date: null,          // AI might suggest a date
    time: null           // AI might suggest a time
  };
}
```

---

## Performance Optimization

### Caching Layer

```javascript
const responseCache = new Map();  // { messageHash: response }

async function getAIResponseCached(...args) {
  const cacheKey = hashMessage(args);
  
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }
  
  const response = await getAIResponse(...args);
  
  // Cache for 1 hour
  responseCache.set(cacheKey, response);
  setTimeout(() => responseCache.delete(cacheKey), 3600000);
  
  return response;
}

function hashMessage(args) {
  const crypto = require('crypto');
  return crypto
    .createHash('md5')
    .update(JSON.stringify(args))
    .digest('hex');
}
```

### Rate Limiting

```javascript
const rateLimiter = new Map();  // { businessId: { count, resetTime } }

function checkRateLimit(businessId) {
  const now = Date.now();
  const limit = rateLimiter.get(businessId) || { count: 0, resetTime: 0 };
  
  if (now > limit.resetTime) {
    // Reset window (1 hour)
    limit.count = 0;
    limit.resetTime = now + 3600000;
  }
  
  limit.count++;
  rateLimiter.set(businessId, limit);
  
  // Groq free tier: ~30 requests per minute
  if (limit.count > 1800) {
    throw new Error('Rate limit exceeded');
  }
}
```

---

## Testing AI Responses

### Golden Set (Evaluation)

```javascript
const goldenSet = [
  {
    input: "Can I book a haircut tomorrow?",
    expectedResponse: { isBooking: true },
    language: "en"
  },
  {
    input: "Когда вы открыты?",  // When are you open? (Russian)
    expectedResponse: { language: "ru" },
  },
  {
    input: "Hi I need help",
    expectedResponse: { confidence: { $gte: 0.7 } },
  }
];

async function evaluateAIEngine() {
  let passed = 0;
  let failed = 0;
  
  for (const test of goldenSet) {
    const response = await getAIResponse(test.input, [], 'test-biz', 'test');
    
    if (matchesExpected(response, test.expectedResponse)) {
      passed++;
    } else {
      failed++;
      console.log('Failed:', test.input, 'Got:', response);
    }
  }
  
  console.log(`Tests: ${passed}/${goldenSet.length} passed`);
}
```

---

*Maintained by Claude Code*
