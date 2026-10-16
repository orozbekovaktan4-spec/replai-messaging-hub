# 👥 ЗАДАЧА ДЛЯ РАЗРАБОТЧИКА 2

## Что Вы Будете Делать?

Создать новую страницу "Клиенты" где Азиз видит всех клиентов и может их найти.

```
👥 Клиенты                    [🔍 Поиск...]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────────────────────────────┐
│ 👤 Иван Петров                     │
│ 📱 +996 555 123 456                │
│ 💬 "Хочу записаться на стрижку..." │
│ 🕒 Сегодня в 14:30 • WhatsApp      │
│                    [Открыть Чат]   │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 👤 Азамат Сыдыков                  │
│ 📱 +996 777 888 999                │
│ 💬 "Спасибо за стрижку!"           │
│ 🕒 Вчера в 18:45 • Instagram      │
│                    [Открыть Чат]   │
└────────────────────────────────────┘
```

**Зачем**: Азиз может быстро найти любого клиента и посмотреть с ним чат.

---

## Что Вам Нужно Создать

### 1. Backend API (server-new.js)

**Добавьте код около строки 4100:**

```javascript
// Получить список клиентов
app.get('/api/business/customers', requireBusinessAuth, (req, res) => {
  try {
    const business = getBusinessData();
    const { search } = req.query;
    
    const customersMap = new Map();
    const conversations = business.conversations || [];
    
    // Пройти по всем диалогам и собрать клиентов
    conversations.forEach(conv => {
      const customerId = conv.customerId || conv.sender_id;
      if (!customerId) return;
      
      const customerName = conv.customerName || conv.sender_name || 'Без имени';
      const customerPhone = conv.customerPhone || conv.sender_phone || 'Не указан';
      const platform = conv.platform || 'unknown';
      
      // Получить последнее сообщение от клиента
      const messages = conv.messages || [];
      const lastMsg = messages[messages.length - 1];
      
      // Добавить/обновить клиента в Map
      if (!customersMap.has(customerId)) {
        customersMap.set(customerId, {
          id: customerId,
          name: customerName,
          phone: customerPhone,
          platform: platform,
          lastMessage: lastMsg?.text || '',
          lastMessageTime: lastMsg?.timestamp || '',
          totalMessages: messages.length
        });
      }
    });
    
    // Преобразовать в массив
    let customers = Array.from(customersMap.values());
    
    // Применить поиск
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.phone.includes(search)
      );
    }
    
    // Отсортировать по времени (новые сверху)
    customers.sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
    
    res.json({
      success: true,
      customers: customers
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Что делает**: Собирает всех клиентов, удаляет дубликаты, поддерживает поиск.

---

### 2. Новая Страница (business-dashboard/customers.html)

**Создайте новый файл `business-dashboard/customers.html`:**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Клиенты | REPLAI</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            gap: 20px;
        }
        
        .search-box {
            flex: 1;
            max-width: 400px;
        }
        
        .search-box input {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 15px;
        }
        
        .customer-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            transition: all 0.3s;
        }
        
        .customer-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }
        
        .customer-info {
            flex: 1;
        }
        
        .customer-name {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .customer-phone {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 10px;
        }
        
        .customer-message {
            background: #f8fafc;
            padding: 10px;
            border-radius: 6px;
            margin: 10px 0;
            font-size: 14px;
            color: #475569;
        }
        
        .customer-meta {
            display: flex;
            gap: 15px;
            font-size: 13px;
            color: #64748b;
            margin-top: 10px;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .badge-whatsapp { background: #dcfce7; color: #166534; }
        .badge-instagram { background: #fce7f3; color: #9f1239; }
        .badge-telegram { background: #dbeafe; color: #1e40af; }
        
        .btn-chat {
            background: #0061ff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .btn-chat:hover {
            background: #0052cc;
        }
        
        .empty {
            text-align: center;
            padding: 60px 20px;
            color: #64748b;
        }
        
        @media (max-width: 768px) {
            .page-header {
                flex-direction: column;
            }
            
            .search-box {
                max-width: 100%;
            }
            
            .customer-card {
                flex-direction: column;
                gap: 15px;
            }
            
            .btn-chat {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="page-header">
            <div>
                <h1>👥 Клиенты</h1>
                <p>Все клиенты которые вам писали</p>
            </div>
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="Поиск по имени или телефону...">
            </div>
        </div>
        
        <div id="customersList" class="empty">
            Загрузка клиентов...
        </div>
    </div>

    <script src="app.js"></script>
    <script>
        // Проверка авторизации
        if (!BusinessAuth.isLoggedIn()) {
            window.location.href = '/business';
        }

        const API = new APIClient();
        let allCustomers = [];

        // Загрузить клиентов
        async function loadCustomers(searchQuery = '') {
            try {
                const url = searchQuery 
                    ? `/api/business/customers?search=${encodeURIComponent(searchQuery)}`
                    : '/api/business/customers';
                
                const data = await API.get(url);
                allCustomers = data.customers || [];
                displayCustomers(allCustomers);
                
            } catch (error) {
                console.error('Ошибка:', error);
                document.getElementById('customersList').innerHTML = 
                    '<div class="empty">❌ Ошибка загрузки клиентов</div>';
            }
        }

        // Отобразить клиентов
        function displayCustomers(customers) {
            const container = document.getElementById('customersList');
            
            if (!customers || customers.length === 0) {
                container.innerHTML = '<div class="empty">👥 Клиентов пока нет</div>';
                return;
            }

            container.innerHTML = customers.map(c => {
                const platformClass = `badge-${c.platform}`;
                const platformName = {
                    'whatsapp': 'WhatsApp',
                    'instagram': 'Instagram',
                    'telegram': 'Telegram'
                }[c.platform] || c.platform;
                
                const timeAgo = getTimeAgo(c.lastMessageTime);
                const msgPreview = c.lastMessage.substring(0, 60) + '...';
                
                return `
                    <div class="customer-card">
                        <div class="customer-info">
                            <div class="customer-name">${c.name}</div>
                            <div class="customer-phone">📱 ${c.phone}</div>
                            <div class="customer-message">💬 "${msgPreview}"</div>
                            <div class="customer-meta">
                                <span>🕒 ${timeAgo}</span>
                                <span class="badge ${platformClass}">${platformName}</span>
                                <span>${c.totalMessages} сообщений</span>
                            </div>
                        </div>
                        <button class="btn-chat">Открыть</button>
                    </div>
                `;
            }).join('');
        }

        // Получить "время назад"
        function getTimeAgo(timestamp) {
            if (!timestamp) return 'Давно';
            const now = new Date();
            const date = new Date(timestamp);
            const seconds = Math.floor((now - date) / 1000);
            
            if (seconds < 60) return 'Только что';
            if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
            if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`;
            if (seconds < 172800) return 'Вчера';
            return Math.floor(seconds / 86400) + ' дн назад';
        }

        // Поиск
        let searchTimeout;
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            searchTimeout = setTimeout(() => {
                if (query.length === 0) {
                    displayCustomers(allCustomers);
                } else if (query.length >= 2) {
                    loadCustomers(query);
                }
            }, 300);
        });

        // Загрузить при загрузке страницы
        loadCustomers();
    </script>
</body>
</html>
```

---

### 3. Добавить Ссылку в Навигацию

**Откройте `business-dashboard/dashboard.html` и найдите блок с навигацией.**

Добавьте новую ссылку:

```html
<a href="customers.html">👥 Клиенты</a>
```

Так будет выглядеть навигация:
```html
<nav>
    <a href="dashboard.html">📊 Дашборд</a>
    <a href="messages.html">💬 Сообщения</a>
    <a href="customers.html">👥 Клиенты</a>  ← НОВОЕ!
    <a href="bookings.html">📅 Бронирования</a>
    <a href="settings.html">⚙️ Настройки</a>
</nav>
```

---

## Пошаговый План

### День 1: Понимание
- [ ] Прочитать этот файл полностью
- [ ] Открыть `server-new.js` и найти строку 4100
- [ ] Посмотреть структуру `businesses.json`
- [ ] Посмотреть как выглядит `messages.html`

### День 2: Backend
- [ ] Добавить API endpoint в `server-new.js`
- [ ] Протестировать API с Postman или curl
- [ ] Убедиться что возвращаются клиенты

### День 3: Frontend
- [ ] Создать новый файл `customers.html`
- [ ] Добавить все HTML и CSS
- [ ] Открыть страницу в браузере

### День 4: Поиск и Навигация
- [ ] Проверить что поиск работает
- [ ] Добавить ссылку в навигацию dashboard.html
- [ ] Протестировать переход между страницами

### День 5: Тестирование
- [ ] Протестировать на мобильном
- [ ] Проверить что карточки красивые
- [ ] Показать Актану

---

## Как Тестировать

### Способ 1: Postman
1. GET запрос: `http://localhost:3000/api/business/customers`
2. Headers → Authorization: `Bearer [ТОКЕН]`
3. Send → должны вернуться клиенты ✅

### Способ 2: С Поиском
1. GET: `http://localhost:3000/api/business/customers?search=иван`
2. Должны вернуться только клиенты с именем Иван ✅

### Способ 3: Браузер Console
1. Откройте http://localhost:3000/business
2. F12 → Console
3. Напечатайте:
```javascript
API.get('/api/business/customers').then(console.log)
```

### Способ 4: Визуально
1. Откройте http://localhost:3000/business/customers.html
2. Должны увидеть список клиентов
3. Попробуйте печатать в поиске
4. Результаты должны обновляться в реальном времени

---

## Частые Ошибки

**Ошибка**: "Cannot read property 'conversations'"
**Решение**: Проверьте имя поля в `businesses.json`

**Ошибка**: Дубликаты клиентов
**Решение**: Используйте Map чтобы хранить уникальные клиентов по ID

**Ошибка**: Страница не загружается
**Решение**: Проверьте что `app.js` загружается в `<script>` теге

**Ошибка**: Поиск не работает
**Решение**: Проверьте что query параметр передаётся в URL: `?search=...`

---

## ✅ Когда Готово

Вы сделали всё когда:
- ✅ Страница загружается
- ✅ Видны все клиенты
- ✅ Поиск работает (печатаете "иван" → остаются только Иваны)
- ✅ Карточки красивые на десктопе и мобильном
- ✅ Ссылка в навигацию работает
- ✅ Нет ошибок в консоли

---

**Готовы начать? Приступайте! 💪**
