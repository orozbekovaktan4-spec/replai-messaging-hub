# Plan Mode Guide for REPLAI

**Plan Mode** = Claude explores your codebase before making changes

## When to Use Plan Mode

Use `/plan` or `Shift+Tab` for:
- ✅ Major refactoring (> 3 files affected)
- ✅ Architectural changes (data model, API redesign)
- ✅ Multi-file rewrites (e.g., WhatsApp integration rebuild)
- ✅ Platform integration (new webhook receiver)
- ✅ Database migrations

Skip for:
- ❌ Single file bug fixes
- ❌ Small feature additions
- ❌ Typo corrections
- ❌ Config changes

## How to Use Plan Mode

### Step 1: Activate Plan Mode
```
You: /plan
Claude: I'll explore the codebase first before proposing changes.
```

### Step 2: Claude Explores
Claude will:
- Read directory structure
- Identify affected files
- Check dependencies
- Find edge cases
- Note potential risks

### Step 3: Claude Proposes Approach
```
Claude:
"To accomplish [task], I recommend:
1. [Step 1 - reasoning]
2. [Step 2 - reasoning]
3. [Step 3 - reasoning]

Files affected: [list]
Risks: [potential issues]
Tradeoffs: [pros/cons]

Proceed? [Yes/Modify/Cancel]"
```

### Step 4: You Respond
- **"Yes"** → Claude implements with clear direction
- **"Try different approach"** → Claude reconsiders
- **"Also handle X"** → Claude adds requirements

### Step 5: Claude Executes
With clear direction, implementation is efficient and complete.

---

## Real Example: WhatsApp Integration Rebuild

### Your Task
"Rebuild WhatsApp integration from Twilio to Meta API"

### Plan Mode Response
```
Current state:
- Twilio sandbox integration (testing only)
- Webhook exists but incomplete
- No real message sending

Proposed architecture:
1. Update .env for Meta credentials
2. Rewrite /webhook/whatsapp for Meta signature format
3. Implement authentication validation
4. Add message logging
5. Add sendWhatsAppMessage() function
6. Test with Meta's webhook tester

Files to modify:
- .env.example (add Meta vars)
- server-new.js (webhook + send function)
- ai-engine-free.js (ensure compatibility)

New files:
- (none)

Risks:
- Meta requires business verification
- Rate limits different from Twilio
- Webhook signature format change

Timeline estimate: 3-4 hours

Proceed?
```

### Your Response
"Yes, but prioritize: (1) Webhook works, (2) Message logging, (3) Sending. Skip business verification."

### Claude Executes
With priorities clear, Claude implements step-by-step, tests each part, then commits.

---

## Benefits

**Without Plan Mode:**
- 8 hours implementation
- Discover issues halfway through
- Major refactoring needed
- Frustrated

**With Plan Mode:**
- 2 hours plan review
- Issues caught upfront
- Clean implementation
- Confident

---

## Tips

1. **Always use for non-trivial rewrites** - Catches drifts early
2. **Review the plan carefully** - It's cheap to redirect here
3. **Ask questions in plan** - "What about X edge case?"
4. **Let Claude execute after approval** - Don't micromanage
5. **Take the plan as-is or modify once** - Don't iterate endlessly

---

## When Plan Mode Saves You

### Scenario 1: Database Migration
```
Plan discovers: 47 files read from DB, 23 write, 5 use complex joins

Recommendation: Migrate to PostgreSQL instead of MongoDB

Result: Saved 10 hours of rework
```

### Scenario 2: Platform Webhook
```
Plan discovers: Different signature formats, rate limits, auth methods

Recommendation: Create wrapper functions for all three platforms

Result: Consistent implementation across all webhooks
```

### Scenario 3: Refactoring Message Flow
```
Plan discovers: Message depends on 12 other components

Recommendation: Create abstraction layer first, then migrate step-by-step

Result: No broken production
```

---

*Use plan mode for anything non-trivial. It's the cheapest place to catch mistakes.*
