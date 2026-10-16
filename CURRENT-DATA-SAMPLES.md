# Current Data Structure Samples

## businesses.json

```json
[
  {
    "id": "business-123",
    "email": "aziz@barber.com",
    "name": "Aziz Barbershop",
    "industry": "barber",
    "ownerName": "Aziz",
    "password": "$2a$10$hashed_password_here",
    "whatsapp": {
      "connected": true,
      "phone": "+996555123456",
      "accessToken": "token_here"
    },
    "instagram": {
      "connected": true,
      "username": "aziz_barber",
      "businessAccountId": "123456",
      "accessToken": "instagram_token_here"
    },
    "telegram": {
      "connected": false
    },
    "plan": "professional",
    "subscriptionEnd": "2024-12-31T23:59:59.000Z",
    "messageCount": 156,
    "status": "active",
    "createdAt": "2024-09-01T10:00:00.000Z"
  }
]
```

## sessions.json

```json
{
  "business-123_user-456": {
    "history": [
      {
        "role": "user",
        "content": "Hello, I want to book appointment"
      },
      {
        "role": "assistant",
        "content": "Sure! What time works for you?"
      }
    ],
    "updatedAt": "2024-10-13T15:30:00.000Z"
  }
}
```

## platform-settings.json

```json
{
  "notifications": {
    "newBusiness": true,
    "systemAlerts": true,
    "weeklyReports": false
  },
  "security": {
    "adminPassword": "$2a$10$hashed_admin_password",
    "sessionTimeout": 3600
  },
  "general": {
    "platformName": "REPLAI",
    "supportEmail": "support@replai.ai",
    "defaultLanguage": "ru"
  }
}
```

## api-keys.json

```json
{
  "replaiKeys": [
    {
      "id": "key-1",
      "key": "rpl_live_abc123...",
      "name": "Production API Key",
      "status": "active",
      "createdAt": "2024-09-01T10:00:00.000Z"
    }
  ],
  "aiProviderKeys": [
    {
      "id": "ai-key-1",
      "provider": "groq",
      "name": "Groq Primary",
      "apiKey": "gsk_abc123...",
      "priority": 1,
      "status": "active",
      "requestCount": 1245,
      "lastUsed": "2024-10-13T15:00:00.000Z",
      "createdAt": "2024-09-01T10:00:00.000Z"
    }
  ]
}
```

## How Data is Currently Used in server-new.js

```javascript
// Loading data
const businesses = JSON.parse(fs.readFileSync('businesses.json', 'utf8'));
const sessions = JSON.parse(fs.readFileSync('sessions.json', 'utf8'));

// Saving data
function saveBusinesses() {
  fs.writeFileSync('businesses.json', JSON.stringify(businesses, null, 2));
}

// Finding business
const business = businesses.find(b => b.email === email);

// Updating business
business.messageCount++;
saveBusinesses();

// Session management
const sessionKey = `${businessId}_${userId}`;
if (!sessions[sessionKey]) {
  sessions[sessionKey] = { history: [], updatedAt: new Date() };
}
sessions[sessionKey].history.push(message);
```

## What Needs to Migrate

1. **Business data** → `Business` table
2. **Session/conversation history** → `Session` table
3. **Message logs** (currently in memory) → `Message` table
4. **Platform settings** → `PlatformSettings` table
5. **API keys** → Can stay in JSON or add `ApiKey` table
6. **Admin credentials** → `Admin` table

## Important Notes

- Passwords are already bcrypt hashed
- Dates are ISO strings
- JSON fields (whatsapp, instagram, telegram) should stay as JSON in Prisma
- Need to preserve all existing data during migration
- Current system has ~156 messages for Aziz's business
