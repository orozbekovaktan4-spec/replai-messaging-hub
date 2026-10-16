# 🎓 JavaScript Основы для REPLAI

## 1. Async/Await (Асинхронный Код)

### Что это?
Способ работать с операциями которые занимают время (запросы к серверу).

### Пример из REPLAI:

```javascript
// ✅ С async/await (правильный способ)
async function loadStats() {
  try {
    const response = await fetch('/api/business/dashboard/stats');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

**Как это работает?**
- `async` - функция асинхронная
- `await` - ждёт завершения операции
- `try/catch` - обработка ошибок

## 2. Fetch API (Отправка Запросов)

### Синтаксис:
```javascript
fetch(URL, {
  method: 'GET' или 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  }
})
```

### GET запрос:
```javascript
const data = await fetch('/api/business/customers');
const result = await data.json();
```

### POST запрос:
```javascript
const response = await fetch('/api/business/templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    name: 'Приветствие',
    text: 'Привет!'
  })
});
```

## 3. DOM Manipulation

### Найти элемент:
```javascript
const element = document.getElementById('statMessages');
```

### Изменить текст:
```javascript
element.textContent = '45';
```

### Добавить класс:
```javascript
element.classList.add('active');
```

## 4. Event Listeners

### Клик:
```javascript
document.getElementById('saveButton').addEventListener('click', () => {
  saveSettings();
});
```

### Печать в поле ввода:
```javascript
document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value;
  loadCustomers(query);
});
```

## 5. Array Methods

### forEach (пройти по каждому):
```javascript
customers.forEach(customer => {
  console.log(customer.name);
});
```

### filter (выбрать нужные):
```javascript
const whatsappCustomers = customers.filter(c => c.platform === 'whatsapp');
```

### map (преобразовать):
```javascript
const names = customers.map(c => c.name);
```

### sort (отсортировать):
```javascript
customers.sort((a, b) =>
  new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
);
```

## 6. Set и Map

### Set (уникальные):
```javascript
const uniqueIds = new Set();
customers.forEach(c => uniqueIds.add(c.id));
console.log(uniqueIds.size);
```

### Map (пары ключ-значение):
```javascript
const map = new Map();
map.set(customerId, customer);
const arr = Array.from(map.values());
```

## 7. Template Literals

```javascript
const name = 'Иван';
const message = `Привет, ${name}!`;

// HTML:
const html = `
  <div class="card">
    <h3>${name}</h3>
  </div>
`;
```

## 8. Error Handling

```javascript
try {
  const data = await API.get('/api/business/customers');
  displayCustomers(data.customers);
} catch (error) {
  console.error('Ошибка:', error);
}
```
