# 📝 TASK 2: WhatsApp Message Templates

**Assigned to**: Developer 2  
**Difficulty**: ⭐⭐ Easy-Medium  
**Time**: 5-7 hours  
**Deadline**: 5 days from start  

---

## 🎯 What You're Building

A template manager for saving common WhatsApp replies:

```
📝 Шаблоны сообщений WhatsApp
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[+ Создать новый шаблон]

┌─────────────────────────────────────┐
│ 👋 Приветствие                       │
│ "Спасибо за сообщение! Отвечу       │
│  через 10 минут ⏰"                  │
│ [Использовать] [Удалить]            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✅ Подтверждение                     │
│ "Ваш заказ подтвержден на завтра    │
│  в 15:00"                           │
│ [Использовать] [Удалить]            │
└─────────────────────────────────────┘
```

---

## 📋 Checklist

### Day 1: Learning
- [ ] Read WhatsApp Business API Overview (30 min)
- [ ] Understand message sending flow (30 min)
- [ ] Find `handleIncomingMessage` function in server-new.js
- [ ] See how messages are stored in businesses.json
- [ ] Login to business dashboard (aziz@barber.com / barber123)

### Day 2: Backend APIs
- [ ] Create GET `/api/business/whatsapp/templates` endpoint
- [ ] Create POST `/api/business/whatsapp/templates` endpoint
- [ ] Create DELETE `/api/business/whatsapp/templates/:id` endpoint
- [ ] Update `businesses.json` structure to store templates
- [ ] Test all endpoints with Postman

### Day 3: Frontend Page
- [ ] Create `business-dashboard/templates.html`
- [ ] Add form to create new template
- [ ] Display list of saved templates
- [ ] Add delete button for each template
- [ ] Style with existing CSS

### Day 4: Integration
- [ ] Add "Templates" link to business dashboard navigation
- [ ] Connect form to backend API
- [ ] Handle form submission
- [ ] Update list after create/delete
- [ ] Add success/error messages

### Day 5: Testing & Polish
- [ ] Test create/delete flow
- [ ] Verify templates persist after server restart
- [ ] Add loading states
- [ ] Handle errors gracefully
- [ ] Code review with Aktan

---

## 🔌 API Endpoints You'll Create

### 1. Get All Templates
```javascript
GET /api/business/whatsapp/templates
Authorization: Bearer {businessToken}

Response:
{
  "success": true,
  "templates": [
    {
      "id": "tpl-1727001234",
      "name": "Быстрый ответ",
      "text": "Спасибо! Отвечу через 10 минут ⏰",
      "category": "greeting",
      "created_at": "2026-09-22T10:00:00Z"
    }
  ]
}
```

### 2. Create Template
```javascript
POST /api/business/whatsapp/templates
Authorization: Bearer {businessToken}

Body:
{
  "name": "Приветствие",
  "text": "Здравствуйте! Чем могу помочь?",
  "category": "greeting"
}

Response:
{
  "success": true,
  "message": "Template created",
  "template": { /* new template object */ }
}
```

### 3. Delete Template
```javascript
DELETE /api/business/whatsapp/templates/:id
Authorization: Bearer {businessToken}

Response:
{
  "success": true,
  "message": "Template deleted"
}
```

---

## 📦 Files You'll Edit/Create

### 1. **server-new.js** (Backend)
Add around line 4100 (near `/api/business/bookings`)

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

// Create template
app.post('/api/business/whatsapp/templates', requireBusinessAuth, (req, res) => {
  try {
    const { name, text, category } = req.body;
    
    // Validation
    if (!name || !text) {
      return res.status(400).json({ error: 'Name and text required' });
    }
    
    const business = getBusinessData();
    
    // Initialize templates array if doesn't exist
    if (!business.whatsapp) business.whatsapp = {};
    if (!business.whatsapp.messageTemplates) {
      business.whatsapp.messageTemplates = [];
    }
    
    // Create new template
    const newTemplate = {
      id: 'tpl-' + Date.now(),
      name,
      text,
      category: category || 'general',
      created_at: new Date().toISOString()
    };
    
    business.whatsapp.messageTemplates.push(newTemplate);
    saveBusinessData(business);
    
    res.json({ 
      success: true, 
      message: 'Template created',
      template: newTemplate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete template
app.delete('/api/business/whatsapp/templates/:id', requireBusinessAuth, (req, res) => {
  try {
    const { id } = req.params;
    const business = getBusinessData();
    
    if (!business.whatsapp?.messageTemplates) {
      return res.status(404).json({ error: 'No templates found' });
    }
    
    const initialLength = business.whatsapp.messageTemplates.length;
    business.whatsapp.messageTemplates = business.whatsapp.messageTemplates
      .filter(t => t.id !== id);
    
    if (business.whatsapp.messageTemplates.length === initialLength) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    saveBusinessData(business);
    
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. **business-dashboard/templates.html** (New File)

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Шаблоны сообщений | REPLAI</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        .template-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
        }
        
        .template-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .template-category {
            font-size: 14px;
            color: #64748b;
        }
        
        .template-text {
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            margin: 10px 0;
            font-style: italic;
        }
        
        .template-actions {
            display: flex;
            gap: 10px;
        }
        
        .btn-delete {
            background: #ef4444;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
        }
        
        .btn-use {
            background: #10b981;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📝 Шаблоны сообщений</h1>
            <p>Сохраняйте часто используемые ответы для WhatsApp</p>
        </header>

        <!-- Create Template Form -->
        <div class="card">
            <h2>Создать новый шаблон</h2>
            <form id="createTemplateForm">
                <div class="form-group">
                    <label>Название шаблона</label>
                    <input type="text" id="templateName" placeholder="Например: Приветствие" required>
                </div>
                
                <div class="form-group">
                    <label>Текст сообщения</label>
                    <textarea id="templateText" rows="4" placeholder="Здравствуйте! Чем могу помочь?" required></textarea>
                </div>
                
                <div class="form-group">
                    <label>Категория</label>
                    <select id="templateCategory">
                        <option value="greeting">👋 Приветствие</option>
                        <option value="booking">📅 Бронирование</option>
                        <option value="confirmation">✅ Подтверждение</option>
                        <option value="info">ℹ️ Информация</option>
                        <option value="general">📝 Общее</option>
                    </select>
                </div>
                
                <button type="submit" class="btn-primary">Создать шаблон</button>
            </form>
        </div>

        <!-- Templates List -->
        <div class="card">
            <h2>Ваши шаблоны</h2>
            <div id="templatesList">
                <p style="text-align: center; color: #64748b;">Загрузка...</p>
            </div>
        </div>
    </div>

    <script src="app.js"></script>
    <script>
        // Check auth
        if (!BusinessAuth.isLoggedIn()) {
            window.location.href = '/business';
        }

        const API = new APIClient();

        // Load templates on page load
        async function loadTemplates() {
            try {
                const data = await API.get('/api/business/whatsapp/templates');
                displayTemplates(data.templates);
            } catch (error) {
                console.error('Failed to load templates:', error);
                document.getElementById('templatesList').innerHTML = 
                    '<p style="color: #ef4444;">Ошибка загрузки шаблонов</p>';
            }
        }

        // Display templates
        function displayTemplates(templates) {
            const container = document.getElementById('templatesList');
            
            if (!templates || templates.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #64748b;">Нет сохраненных шаблонов</p>';
                return;
            }

            container.innerHTML = templates.map(template => `
                <div class="template-card">
                    <div class="template-header">
                        <h3>${template.name}</h3>
                        <span class="template-category">${getCategoryIcon(template.category)} ${getCategoryName(template.category)}</span>
                    </div>
                    <div class="template-text">"${template.text}"</div>
                    <div class="template-actions">
                        <button class="btn-use" onclick="useTemplate('${template.id}')">Использовать</button>
                        <button class="btn-delete" onclick="deleteTemplate('${template.id}')">Удалить</button>
                    </div>
                </div>
            `).join('');
        }

        // Create template
        document.getElementById('createTemplateForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('templateName').value;
            const text = document.getElementById('templateText').value;
            const category = document.getElementById('templateCategory').value;
            
            try {
                await API.post('/api/business/whatsapp/templates', { name, text, category });
                
                // Clear form
                e.target.reset();
                
                // Reload templates
                loadTemplates();
                
                alert('✅ Шаблон создан!');
            } catch (error) {
                alert('❌ Ошибка: ' + error.message);
            }
        });

        // Delete template
        async function deleteTemplate(id) {
            if (!confirm('Удалить этот шаблон?')) return;
            
            try {
                await API.delete(`/api/business/whatsapp/templates/${id}`);
                loadTemplates();
                alert('✅ Шаблон удален');
            } catch (error) {
                alert('❌ Ошибка: ' + error.message);
            }
        }

        // Use template (for future - copy to clipboard)
        function useTemplate(id) {
            alert('Функция "Использовать" будет добавлена позже!');
        }

        // Helper functions
        function getCategoryIcon(category) {
            const icons = {
                greeting: '👋',
                booking: '📅',
                confirmation: '✅',
                info: 'ℹ️',
                general: '📝'
            };
            return icons[category] || '📝';
        }

        function getCategoryName(category) {
            const names = {
                greeting: 'Приветствие',
                booking: 'Бронирование',
                confirmation: 'Подтверждение',
                info: 'Информация',
                general: 'Общее'
            };
            return names[category] || 'Общее';
        }

        // Load on page load
        loadTemplates();
    </script>
</body>
</html>
```

### 3. **business-dashboard/dashboard.html** (Add Link)

Find the navigation section and add:
```html
<nav>
  <a href="dashboard.html">Dashboard</a>
  <a href="messages.html">Messages</a>
  <a href="bookings.html">Bookings</a>
  <a href="templates.html">Templates</a> <!-- NEW! -->
  <a href="settings.html">Settings</a>
</nav>
```

---

## ✅ Testing Checklist

- [ ] Can create template via form
- [ ] Template appears in list immediately
- [ ] Template saves to businesses.json
- [ ] Can delete template
- [ ] Template removed from list immediately
- [ ] Templates persist after server restart
- [ ] Form validation works (empty fields)
- [ ] Auth required (redirects if not logged in)
- [ ] No console errors

---

## 💡 Hints

### How to test APIs with curl:
```bash
# Create template
curl -X POST http://localhost:3000/api/business/whatsapp/templates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","text":"Hello","category":"general"}'

# Get templates
curl http://localhost:3000/api/business/whatsapp/templates \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete template
curl -X DELETE http://localhost:3000/api/business/whatsapp/templates/tpl-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get business token:
1. Login at http://localhost:3000/business
2. Open browser console (F12)
3. Type: `localStorage.getItem('businessToken')`
4. Copy the token

---

## 🆘 Common Issues

**Issue**: "Authorization required"  
**Fix**: Make sure `requireBusinessAuth` middleware is applied to routes

**Issue**: Templates not saving  
**Fix**: Check if `saveBusinessData()` function is called after modifying data

**Issue**: Page doesn't load  
**Fix**: Check if `app.js` is loaded and auth check works

---

## 🎨 Design Guidelines

- Use existing `styles.css` from business-dashboard
- Match color scheme: Blue (#0061ff), Green (#10b981), Red (#ef4444)
- Mobile-friendly (test on phone via ngrok)
- Clear labels in Russian (for Aziz)

---

**Questions?** Message Aktan on Telegram!
