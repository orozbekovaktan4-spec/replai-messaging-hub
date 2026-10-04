# Database Schema Reference Skill

This skill documents all JSON file structures. Use when adding fields or endpoints.

## Core Files

### users.json
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "passwordHash": "bcrypt",
    "businesses": ["business-id"],
    "createdAt": "2026-01-15T10:30:00Z",
    "role": "owner|admin|viewer"
  }
]
```

### sessions.json
```json
[
  {
    "sessionId": "secure-token",
    "userId": "uuid",
    "expiresAt": "2026-01-16T10:30:00Z"
  }
]
```

### businesses.json
```json
[
  {
    "id": "uuid",
    "name": "Business Name",
    "owner_id": "user-uuid",
    "services": [
      { "id": "svc1", "name": "Haircut", "duration_minutes": 30, "available": true }
    ],
    "hours": {
      "monday": ["09:00", "18:00"],
      "tuesday": null
    },
    "platforms": {
      "instagram": { "connected": true, "username": "@name", "accessToken": "..." },
      "telegram": { "connected": true, "botToken": "..." },
      "whatsapp": { "connected": false }
    }
  }
]
```

### bookings.json
```json
[
  {
    "id": "uuid",
    "business_id": "uuid",
    "customer_name": "John",
    "customer_phone": "+996...",
    "service": "Haircut",
    "date": "2026-01-20",
    "time": "14:00",
    "platform": "instagram",
    "status": "pending|confirmed|completed"
  }
]
```

### ai-settings.json
```json
[
  {
    "business_id": "uuid",
    "language": "auto-detect|en|ru|ky",
    "ai_provider": "groq",
    "model": "llama-3.3-70b",
    "temperature": 0.7,
    "system_prompt": "..."
  }
]
```

## Read/Write Functions

**Always use these patterns:**

```javascript
// Read
function readBusinesses() {
  try {
    return JSON.parse(fs.readFileSync('businesses.json', 'utf8'));
  } catch {
    return [];
  }
}

// Write (atomic)
function writeBusinesses(data) {
  fs.writeFileSync('businesses.json.tmp', JSON.stringify(data, null, 2));
  fs.renameSync('businesses.json.tmp', 'businesses.json');
}
```

## Relationships

- users.businesses[] → businesses.json id
- businesses.owner_id → users.json id
- bookings.business_id → businesses.json id
- bookings.platform_user_id → platform-specific ID

## Constraints

- Dates: ISO 8601 UTC format
- IDs: UUID v4
- Never null passwords (use bcryptjs)
- Never log API keys
- Times: 24-hour format (HH:MM)
