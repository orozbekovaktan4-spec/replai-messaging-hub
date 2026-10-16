# 👨‍💻 REPLAI Developer Onboarding Plan

## Welcome to REPLAI Team! 🎉

You're joining REPLAI - an AI-powered messaging hub that helps businesses in Bishkek manage WhatsApp, Instagram, and Telegram from one place.

---

## 📚 Phase 1: Understanding the Project (Day 1)

### What is REPLAI?
- **Problem**: Businesses get messages from WhatsApp, Instagram, Telegram - hard to manage
- **Solution**: One dashboard to see all messages + AI responds automatically
- **Customer Example**: Aziz (barber shop owner) gets bookings via Instagram DMs - AI replies instantly

### Read These Files (30 minutes):
1. `PROJECT-FILES.md` - Complete file structure
2. `HOW-AI-RESPONSES-WORK.md` - How AI generates replies
3. `CONNECTION-ARCHITECTURE.md` - How platforms connect

### Watch Your Teammate Work (15 minutes):
- Open: https://cheer-pledge-lend.ngrok-free.dev/admin
- See the admin panel in action
- Open: https://cheer-pledge-lend.ngrok-free.dev/business
- Login: `aziz@barber.com` / `barber123`
- This is what Aziz sees!

### Key Technologies We Use:
- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML/CSS/JS (no frameworks - keep it simple!)
- **AI**: Groq API (free, fast)
- **APIs**: Meta Graph API (WhatsApp + Instagram), Telegram Bot API
- **Storage**: JSON files (businesses.json, sessions.json)

---

## 🎯 Phase 2: Choose Your Learning Path

### Developer 1: **Instagram Comment Analysis Feature**
**Goal**: Build a feature that shows which posts get the most comments

**What you'll learn**:
- Instagram Graph API
- Webhooks (how Instagram sends us data)
- How to display data in the dashboard

**Task Details**: See "TASK 1" below ⬇️

---

### Developer 2: **WhatsApp Message Templates Feature**
**Goal**: Build a system to save and reuse common messages (like "Appointment confirmed!")

**What you'll learn**:
- WhatsApp Business API basics
- How messages are stored
- Building simple UI forms

**Task Details**: See "TASK 2" below ⬇️

---

## 📋 TASK 1: Instagram Comment Analysis (Developer 1)

### Objective
Add a new section in admin panel that shows:
- Which Instagram posts got the most comments this week
- Top 5 posts with comment count
- Click to view all comments for a post

### Step-by-Step Guide:

#### Step 1: Learn Instagram Graph API (1 hour)
Read this documentation:
- Meta Graph API Basics: https://developers.facebook.com/docs/graph-api/overview
- Instagram API Comments: https://developers.facebook.com/docs/instagram-api/reference/ig-media/comments

**Key Concepts**:
```javascript
// How to get comments from Instagram API
GET https://graph.facebook.com/v23.0/{media-id}/comments
  ?access_token={token}
  
Response:
{
  "data": [
    {
      "id": "comment-123",
      "text": "Love this!",
      "username": "john_doe",
      "timestamp": "2026-09-20T10:30:00+0000"
    }
  ]
}
```

#### Step 2: Understand Current Code (30 minutes)
Look at these files:
- `server-new.js` - Search for `POST /webhook/instagram` (line ~1900)
- This is where Instagram sends us comment data
- See how we currently handle comments

#### Step 3: Create Your Feature (3-4 hours)

**A. Backend API Endpoint** (server-new.js)
```javascript
// Add this around line 4100 (near other /api/admin routes)

// Get Instagram post analytics
app.get('/api/admin/instagram/post-analytics', (req, res) => {
  try {
    const business = getBusinessData();
    
    // TODO: 
    // 1. Load comment data from businesses.json
    // 2. Group comments by post_id
    // 3. Count comments per post
    // 4. Sort by comment count (highest first)
    // 5. Return top 5 posts
    
    res.json({
      success: true,
      posts: [
        {
          post_id: '123',
          comment_count: 45,
          last_comment_time: '2026-09-22T10:00:00Z',
          preview_text: 'Привет! Сколько стоит...'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**B. Frontend UI** (admin-new.html)
Add a new card in the dashboard section:

```html
<!-- Add after the existing platform cards -->
<div class="card">
  <h3>📊 Instagram Post Analytics</h3>
  <p>Posts with most comments this week</p>
  
  <div id="post-analytics-list">
    <!-- Your code will fill this with data -->
  </div>
</div>
```

```javascript
// Add this JavaScript function
async function loadPostAnalytics() {
  try {
    const response = await fetch('/api/admin/instagram/post-analytics');
    const data = await response.json();
    
    const container = document.getElementById('post-analytics-list');
    
    // TODO:
    // 1. Loop through data.posts
    // 2. Create HTML for each post
    // 3. Show: post preview, comment count, time
    // 4. Add click handler to view full comments
    
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
}

// Call it when page loads
loadPostAnalytics();
```

#### Step 4: Test Your Feature (30 minutes)
1. Restart server: `node server-new.js`
2. Open admin panel: http://localhost:3000/admin
3. Check if your new section appears
4. Verify data loads correctly

#### Step 5: Make it Pretty (1 hour)
Use existing CSS styles from admin-new.html:
- `.card` - for containers
- `.stat-card` - for individual post boxes
- Match the blue gradient theme

### 🎓 What You'll Learn:
✅ Instagram Graph API structure  
✅ How webhooks deliver real-time data  
✅ Reading/filtering data from JSON files  
✅ Building dashboard UI  
✅ JavaScript async/await patterns  

---

## 📋 TASK 2: WhatsApp Message Templates (Developer 2)

### Objective
Build a feature where Aziz can save common replies like:
- "Спасибо за сообщение! Я отвечу через 10 минут"
- "Ваш заказ подтвержден на завтра в 15:00"

Then use these templates in responses instead of AI.

### Step-by-Step Guide:

#### Step 1: Learn WhatsApp Business API (1 hour)
Read these docs:
- WhatsApp Business API Overview: https://developers.facebook.com/docs/whatsapp/business-management-api
- Message Templates: https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates

**Key Concept**:
```javascript
// Sending a WhatsApp message
POST https://graph.facebook.com/v21.0/{phone-number-id}/messages
{
  "messaging_product": "whatsapp",
  "to": "996555123456",
  "type": "text",
  "text": {
    "body": "Your custom message here"
  }
}
```

#### Step 2: Understand Current Code (30 minutes)
Look at these files:
- `server-new.js` - Search for `async function handleIncomingMessage` (line ~1100)
- See how we currently respond to WhatsApp messages
- Find where AI generates responses

#### Step 3: Create Your Feature (3-4 hours)

**A. Data Structure** (businesses.json)
Add templates to business data:
```json
{
  "whatsapp": {
    "connected": true,
    "messageTemplates": [
      {
        "id": "template-1",
        "name": "Быстрый ответ",
        "text": "Спасибо! Отвечу через 10 минут ⏰",
        "category": "greeting"
      },
      {
        "id": "template-2", 
        "name": "Подтверждение заказа",
        "text": "Ваш заказ подтвержден! ✅",
        "category": "booking"
      }
    ]
  }
}
```

**B. Backend API** (server-new.js)
```javascript
// Get all templates
app.get('/api/business/whatsapp/templates', requireBusinessAuth, (req, res) => {
  try {
    const business = getBusinessData();
    const templates = business.whatsapp?.messageTemplates || [];
    
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new template
app.post('/api/business/whatsapp/templates', requireBusinessAuth, (req, res) => {
  try {
    const { name, text, category } = req.body;
    
    // TODO:
    // 1. Validate input
    // 2. Create template object with unique ID
    // 3. Add to businesses.json
    // 4. Save file
    
    res.json({ success: true, message: 'Template created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete template
app.delete('/api/business/whatsapp/templates/:id', requireBusinessAuth, (req, res) => {
  // TODO: Remove template from businesses.json
});
```

**C. Frontend UI** (business-dashboard)

Create new page: `business-dashboard/templates.html`

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Шаблоны сообщений | REPLAI</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>📝 Шаблоны сообщений</h1>
    <p>Сохраните часто используемые ответы</p>
    
    <!-- Form to create new template -->
    <div class="card">
      <h3>Создать новый шаблон</h3>
      <form id="templateForm">
        <input type="text" id="templateName" placeholder="Название шаблона" required>
        <textarea id="templateText" placeholder="Текст сообщения" required></textarea>
        <select id="templateCategory">
          <option value="greeting">Приветствие</option>
          <option value="booking">Бронирование</option>
          <option value="general">Общее</option>
        </select>
        <button type="submit">Создать шаблон</button>
      </form>
    </div>
    
    <!-- List of existing templates -->
    <div id="templatesList">
      <!-- Your JavaScript will fill this -->
    </div>
  </div>
  
  <script src="app.js"></script>
  <script>
    // TODO: 
    // 1. Load templates on page load
    // 2. Handle form submission
    // 3. Display templates with delete button
    // 4. Add "Use Template" button for each
  </script>
</body>
</html>
```

#### Step 4: Add Templates to Settings (1 hour)
Modify `business-dashboard/settings.html`:
- Add link to templates page
- Add section to enable/disable template mode

#### Step 5: Test Your Feature (30 minutes)
1. Login to business dashboard
2. Create 2-3 test templates
3. Verify they save to businesses.json
4. Check delete works

### 🎓 What You'll Learn:
✅ WhatsApp Business API basics  
✅ CRUD operations (Create, Read, Update, Delete)  
✅ Form handling and validation  
✅ JSON file storage  
✅ Business authentication flow  

---

## 📖 Helpful Resources

### Documentation Links:
- **Meta Graph API**: https://developers.facebook.com/docs/graph-api
- **Instagram API**: https://developers.facebook.com/docs/instagram-api
- **WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **Groq AI API**: https://console.groq.com/docs/quickstart

### Our Internal Docs:
- `API-QUICK-REFERENCE.md` - All API endpoints explained
- `FRONTEND-BACKEND-CONNECTION-GUIDE.md` - How frontend talks to backend
- `CONNECTION-ARCHITECTURE.md` - Platform connection flow

### Tools You'll Use:
- **Postman** - Test API endpoints (download: https://www.postman.com/downloads/)
- **VS Code** - Code editor (you probably have this)
- **Chrome DevTools** - Debug frontend (F12 in browser)
- **ngrok** - Test on phone (already running!)

---

## 🤝 Getting Help

### When You're Stuck:
1. **Read error messages carefully** - they usually tell you what's wrong
2. **Check Console** - Browser console (F12) shows JavaScript errors
3. **Check Server Logs** - Terminal shows backend errors
4. **Ask Aktan** - Message me on Telegram with:
   - What you're trying to do
   - What error you're getting
   - What you've already tried

### Daily Standup (10 minutes):
Every day we'll check:
- What did you finish yesterday?
- What are you working on today?
- Any blockers?

---

## 🎯 Success Criteria

### Developer 1 (Instagram Analytics):
✅ API endpoint returns post data  
✅ UI shows top 5 posts by comment count  
✅ Clicking post shows all comments  
✅ Matches existing design style  
✅ No console errors  

### Developer 2 (WhatsApp Templates):
✅ Can create templates via form  
✅ Templates save to businesses.json  
✅ Can view all saved templates  
✅ Can delete templates  
✅ Templates list updates in real-time  

---

## ⏱️ Timeline

**Week 1**:
- Day 1: Read docs, understand project (Phase 1)
- Day 2-3: Build main feature (Phase 2)
- Day 4: Testing and bug fixes
- Day 5: Code review with Aktan, polish UI

**Week 2**:
- Start mobile app design implementation (when ready)

---

## 💡 Pro Tips

1. **Don't copy-paste blindly** - Read and understand each line
2. **Test frequently** - After every small change, check if it works
3. **Use console.log()** - Print variables to see what's happening
4. **Git commit often** - Save your progress every hour
5. **Ask questions early** - Don't waste 2 hours on something I can explain in 5 minutes

---

## 🚀 Next Steps After Onboarding

Once you master these tasks, you'll work on:
- **Mobile App** (React Native) - Business owner app for Aziz
- **Telegram Integration** - Add Telegram channel support
- **Analytics Dashboard** - Charts showing message volume, response time
- **Multi-language AI** - Support Kyrgyz, Russian, English automatically

---

## 📞 Contact

**Project Lead**: Aktan (you!)  
**Telegram**: @[your_telegram]  
**Repository**: Ask Aktan for GitHub access  

**Working Hours**: Flexible, but be available 10:00-18:00 Bishkek time for questions

---

## 🎉 Welcome Aboard!

You're building something that will help hundreds of businesses in Bishkek. Every feature you create makes life easier for owners like Aziz.

Let's build something amazing! 💪

---

**Last Updated**: September 22, 2026  
**Version**: 1.0  
**Status**: Active Onboarding
