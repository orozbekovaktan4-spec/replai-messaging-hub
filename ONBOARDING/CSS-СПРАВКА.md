# 🎨 CSS Справка для REPLAI

## 1. CSS Grid

```css
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
```

**На десктопе:** 4 карточки  
**На планшете:** 2 карточки  
**На мобильном:** 1 карточка (автоматически!)

## 2. Flexbox

```css
.stat-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
```

- `align-items: center` - вертикальное выравнивание
- `justify-content: space-between` - горизонтальное расстояние
- `gap: 20px` - расстояние между элементами

## 3. Градиенты

```css
.stat-messages {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-ai {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-owner {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-customers {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}
```

## 4. Transitions и Transforms

```css
.stat-card {
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}
```

**Другие трансформации:**
- `translateX(10px)` - сдвиг вправо
- `scale(1.1)` - увеличить на 10%
- `rotate(45deg)` - повернуть

## 5. Media Queries (Адаптивный Дизайн)

```css
/* Мобильный (по умолчанию) */
.stats-container {
  grid-template-columns: repeat(2, 1fr);
}

/* Планшет (768px+) */
@media (min-width: 768px) {
  .stats-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Десктоп (1200px+) */
@media (min-width: 1200px) {
  .stats-container {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## 6. Box Model

```css
.element {
  margin: 10px;      /* внешний отступ */
  padding: 20px;     /* внутренний отступ */
  border: 1px solid; /* граница */
}
```

**Сокращение:**
- `padding: 20px` - все стороны
- `padding: 20px 10px` - верх/низ, лево/право
- `padding: 20px 10px 15px 5px` - верх, право, низ, лево

## 7. Цвета и Opacity

```css
background: #FF0000;              /* hex */
background: rgb(255, 0, 0);       /* RGB */
background: rgba(255, 0, 0, 0.5); /* с прозрачностью */

.element {
  opacity: 0.9;  /* 90% видимый */
}
```

## 8. Селекторы

```css
.class {}          /* класс */
#id {}             /* ID */
div {}             /* элемент */
.card:hover {}     /* при наведении */
.card:first-child {}  /* первый */
.card:nth-child(2) {} /* второй */
```
