# 🤖 Prompt for Claude: REPLAI PostgreSQL Migration

## Copy-Paste This Entire Prompt to Claude

---

Hi Claude!

I'm building REPLAI - an AI messaging hub for businesses in Kyrgyzstan. Currently the system uses JSON files for data storage, but I need to migrate to PostgreSQL to scale to 100+ businesses.

**My Goal:** Migrate from JSON files to PostgreSQL using Prisma, following the guide step-by-step with your help.

**My Tech Stack:**
- Node.js + Express backend
- Vanilla HTML/CSS/JS frontend
- Currently using JSON files (businesses.json, sessions.json, etc.)
- Need to move to: PostgreSQL + Prisma ORM

**What I've Already Done:**
1. ✅ Created Supabase account
2. ✅ Got DATABASE_URL: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`
3. ✅ Added DATABASE_URL to .env file
4. ✅ Installed packages: `npm install @prisma/client prisma bcryptjs jsonwebtoken`

**What I Need Help With:**

I'm following this guide: `/Users/ak/replai/AI-POWERED-MIGRATION-GUIDE.md`

I'm currently on: **[DAY X, STEP Y]** ← (I'll tell you where I am)

**My Current Files:**
- `server-new.js` - Main backend server (uses JSON files)
- `businesses.json` - Contains business data
- `sessions.json` - Contains conversation history
- `platform-settings.json` - Contains settings
- `ai-keys.json` - Contains AI API keys

**How I Want You to Help:**

1. **Give me EXACT code** to copy-paste (not pseudocode)
2. **Show me exactly WHERE to put it** (file path + line number if possible)
3. **Explain what each part does** (brief explanation)
4. **Tell me what to run** (exact terminal commands)
5. **Help me test** that it works

**Important Context:**

- I'm NOT a professional developer (but I can follow instructions!)
- I prefer copy-paste solutions over complex explanations
- I want to understand what I'm doing (brief explanations are good)
- I'll ask questions if I don't understand something
- I have access to the file system and terminal

**My Current Step:**

[TELL CLAUDE WHERE YOU ARE, EXAMPLE:]

"I'm on Day 3: Create Database Schema. I need help creating the `prisma/schema.prisma` file with all the models for my business."

OR

"I just ran `npx prisma migrate dev` and got this error: [PASTE ERROR]. How do I fix it?"

OR

"I completed Day 5 (data migration). Now I need help updating server-new.js to use Prisma instead of JSON files. Where do I start?"

---

**Additional Context About My Data Structure:**

**businesses.json structure:**
```json
{
  "id": "uuid",
  "email": "business@example.com",
  "name": "Business Name",
  "industry": "barber",
  "ownerName": "Owner Name",
  "password": "hashed_password",
  "whatsapp": {
    "connected": true,
    "phone": "+996..."
  },
  "instagram": {
    "connected": true,
    "username": "@username",
    "accessToken": "token..."
  },
  "telegram": {
    "connected": false
  },
  "plan": "trial",
  "messageCount": 42,
  "status": "active"
}
```

**sessions.json structure:**
```json
{
  "businessId-userId": {
    "history": [
      { "role": "user", "content": "Hello" },
      { "role": "assistant", "content": "Hi!" }
    ],
    "updatedAt": "2024-10-13T..."
  }
}
```

---

**Questions I Might Ask:**

- "Where exactly do I put this code in server-new.js?"
- "What does this line do?"
- "How do I test this works?"
- "I got this error: [error] - how to fix?"
- "What's the next step after this?"

**How to Respond:**

✅ GOOD:
```javascript
// Step 1: Open server-new.js
// Find line ~50 where you see: const businesses = JSON.parse(...)
// Replace it with:

import prisma from './lib/db.js';

// Get all businesses
const businesses = await prisma.business.findMany();
```

❌ NOT GOOD:
"You need to update your server code to use Prisma queries instead of JSON file operations."
(Too vague - I need EXACT code!)

---

**Ready to Start!**

I'm currently working on: [I'LL TELL YOU]

Let's do this step by step! 💪

---

## Additional Resources You Can Reference

If I mention these files, I'm referring to my guides:

- `AI-POWERED-MIGRATION-GUIDE.md` - My main migration guide
- `PRODUCT-READINESS-CHECKLIST.md` - Technical checklist
- `server-new.js` - My main backend file
- `.env` - Environment variables file

---

**Let me know you're ready, and I'll tell you what step I'm on!**

