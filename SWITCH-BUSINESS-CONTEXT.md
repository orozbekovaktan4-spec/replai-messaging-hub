# 🔄 Business Context Switch Guide

## Current Configuration

✅ **PRIMARY BUSINESS:** White Gold (Jewelry Store)
📦 **BACKUP:** Aziz Barber Shop (backed up)

---

## 📋 What Changed

### **1. Primary RAG Knowledge Base**
- **File:** `/business-info.json`
- **Status:** ✅ Switched to White Gold
- **Backup:** `/business-info-aziz-backup.json`

### **2. AI System Prompt**
The AI now operates with White Gold's context:
- **Business Name:** White Gold
- **Industry:** Premium Jewelry Store
- **Services:** Custom design, repair, resizing, cleaning, engraving, appraisal
- **Products:** Gold/silver jewelry, rings, necklaces, bracelets, earrings, gemstones
- **Hours:** Mon-Fri 10:00-19:00, Sat 10:00-18:00, Sun 11:00-17:00
- **Contact:** +996555002002, orozbekovaktan4@gmail.com
- **Location:** Bishkek, Manas Ave 45

### **3. Preserved Functionality**
✅ All existing features work normally:
- Multi-business support (database)
- Instagram/WhatsApp/Telegram integrations
- Booking system
- AI key rotation
- Analytics
- Admin panel

---

## 🔄 How to Switch Back to Aziz

If you need to switch back to Aziz Barber Shop:

```bash
# Restore Aziz as primary
cp /Users/ak/replai/business-info-aziz-backup.json /Users/ak/replai/business-info.json

# Restart the server (Render auto-restarts on deploy)
git add business-info.json
git commit -m "Switch back to Aziz Barber Shop context"
git push
```

---

## 🔄 How to Switch to a Different Business

### **Option 1: Use Existing Templates**

Switch to White Gold:
```bash
cp business-info-white-gold.json business-info.json
```

Switch to Aziz:
```bash
cp business-info-aziz-backup.json business-info.json
```

### **Option 2: Create New Business Template**

1. **Create new business info file:**
```bash
cp business-info-white-gold.json business-info-YOURNAME.json
```

2. **Edit the file** with your business details:
```json
{
  "business": {
    "name": "Your Business Name",
    "description": "Your business description",
    "hours": { ... },
    "services": [ ... ],
    "contact": { ... },
    "faqs": [ ... ]
  }
}
```

3. **Switch to it:**
```bash
cp business-info-YOURNAME.json business-info.json
```

4. **Deploy:**
```bash
git add business-info.json business-info-YOURNAME.json
git commit -m "Switch to YOURNAME business context"
git push
```

---

## 🏗️ Architecture Notes

### **Current Setup (Single RAG)**
- One `business-info.json` file
- Loaded once at server startup
- Used for ALL AI responses
- Fast and simple

### **Multi-Business Database vs RAG**
- **Database:** Stores business records, tokens, configs
- **RAG:** Provides AI knowledge for responses
- **Current Limitation:** RAG is global, not per-business

---

## 🚀 Future Enhancement: Per-Business RAG

If you need **different AI knowledge for each business**, you'll need to:

1. **Store business info in database** (as JSON column)
2. **Load business-specific info** when generating AI response
3. **Modify `createSystemPrompt()`** to accept business parameter

### **Implementation Plan:**

```javascript
// Option A: Store in database
const business = await db.findBusinessByInstagramUserId(recipientId);
const businessContext = JSON.parse(business.businessInfo); // Store JSON in DB

// Option B: Load from separate files
const businessContext = JSON.parse(
  fs.readFileSync(`./business-info-${business.id}.json`, 'utf8')
);

// Use in system prompt
function createSystemPrompt(language, userId, businessContext) {
  return `You are an AI assistant for ${businessContext.business.name}...`;
}
```

**Estimated Effort:** 2-3 hours
- Update database schema
- Modify AI engine
- Create management UI

---

## 📁 File Structure

```
/Users/ak/replai/
├── business-info.json                    # ✅ PRIMARY (White Gold)
├── business-info-white-gold.json         # White Gold template
├── business-info-aziz-backup.json        # Aziz template  
├── SWITCH-BUSINESS-CONTEXT.md            # This guide
└── ai-engine-free.js                     # Loads business-info.json
```

---

## ✅ Verification

To verify the switch worked:

1. **Check the file:**
```bash
cat /Users/ak/replai/business-info.json | head -5
# Should show: "name": "White Gold"
```

2. **Test AI response:**
Send a message to your Instagram bot and ask:
- "What are your hours?"
- "What services do you offer?"
- "Tell me about your store"

The AI should respond with **White Gold** information.

3. **Check Render logs:**
After deployment, the AI should greet customers as:
> "Hello! Welcome to White Gold. How can I help you today?"

---

## ⚠️ Important Notes

1. **Server restart required** for changes to take effect
   - Local: Restart node server
   - Render: Push to git (auto-deploys)

2. **Backup before switching**
   - Always keep backup copies
   - Current backups exist in repo

3. **Database businesses are separate**
   - Database has: Aziz AND White Gold
   - RAG has: Only ONE active context
   - Both can receive messages
   - Both use SAME AI context (current limitation)

4. **To truly separate AI knowledge per business:**
   - Implement per-business RAG (see "Future Enhancement" above)
   - Or use the same general knowledge for all

---

## 🆘 Troubleshooting

### **Problem: AI still uses old business name**
**Solution:** Server didn't restart. Force restart:
```bash
git commit --allow-empty -m "Force restart"
git push
```

### **Problem: AI responses are wrong**
**Solution:** Check which file is primary:
```bash
cat business-info.json | grep '"name"'
```

### **Problem: Lost backup**
**Solution:** Recover from git:
```bash
git checkout HEAD^ -- business-info-aziz-backup.json
```

---

## 📞 Support

If you need help switching contexts or implementing per-business RAG, refer to:
- `/Users/ak/replai/ai-engine-free.js` (AI engine)
- `/Users/ak/replai/ADD-SECOND-BUSINESS-GUIDE.md` (Multi-business setup)

---

**Last Updated:** 2026-11-10
**Current Primary:** White Gold
**Status:** ✅ Active
