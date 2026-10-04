# Architecture Rules & Patterns Skill

Use this skill when designing new features or refactoring.

## Non-Negotiable Principles

1. **Stateless servers** - all state in JSON files
2. **Free Groq AI only** - never call other LLMs
3. **OAuth where possible** - avoid passwords
4. **Webhook-based messaging** - platforms send to us
5. **No database** - JSON files for MVP simplicity

## Service Boundaries

```
┌─────────────────────────────────┐
│ Authentication (login.html)     │
│ Cannot call AI or business logic │
└─────────────┬───────────────────┘
              │
┌─────────────▼───────────────────┐
│ Business Logic (server-new.js)  │
│ Routes to data/AI/platforms     │
└─────────────┬───────────────────┘
              │
      ┌───────┴──────┬───────┐
      │              │       │
┌─────▼──┐ ┌────────▼───┐ ┌─▼──────┐
│ AI     │ │ Webhooks   │ │Platforms│
│(Groq)  │ │(receive)   │ │(send)   │
└────────┘ └────────────┘ └─────────┘
```

Never cross boundaries.

## Request/Response Format

**All API responses must have one of:**
```javascript
{ success: true, data: {...} }
{ error: "message", code: "CODE" }
```

Never:
- ❌ { ok: true }
- ❌ { message: "..." }
- ❌ Just raw data

## Webhook Pattern

1. Validate signature immediately
2. Return 200 OK immediately (don't block)
3. Process asynchronously
4. Log all errors
5. Deduplicate by message ID

## Message Flow Invariant

```
Customer Message → Webhook Receiver
  ↓ (Extract: sender_id, text, platform)
Process Message → Get AI Response
  ↓ (Call Groq, get response)
Send to Platform → Update Chat Logs
  ↓ (Notify customer)
Done
```

Every step must succeed independently.

## Authentication Pattern

```javascript
// Protected route:
app.post('/api/admin/endpoint', requireAuth, (req, res) => {
  // req.session.userId is verified
});

// Business-specific:
app.post('/api/admin/business', requireAuth, requireBusinessAuth, (req, res) => {
  // req.session.userId verified + owns business
});
```

**Never skip auth checks.**

## Error Handling

```javascript
try {
  // code
  res.json({ success: true, data: result });
} catch (error) {
  console.error('[RouteName]', error.message);
  res.status(500).json({ error: 'Internal error', code: 'INTERNAL_ERROR' });
}
```

Never expose raw errors to client.

## Testing Checklist

Before shipping any change:
- [ ] Credentials still work (aziz@barber.com / barber123)
- [ ] Can log in without errors
- [ ] Can connect at least one platform
- [ ] No credentials in logs
- [ ] Response times < 1s
- [ ] Mobile responsive

## Deployment

- Push to main branch on GitHub
- Render auto-deploys
- Wait 2 minutes
- Test on production URL
- If broken: revert commit immediately
