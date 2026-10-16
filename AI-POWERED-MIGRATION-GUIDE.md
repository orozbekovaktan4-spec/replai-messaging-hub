# 🤖 AI-Powered Product Readiness: Do It Yourself Guide

## 🎯 Goal: Make REPLAI Production-Ready in 2 Weeks

**You + AI = Unstoppable!** 💪

This guide shows you EXACTLY what to do, step by step. No developer needed!

---

## 📅 Week 1: Database Migration (Most Important!)

### Day 1-2: Setup PostgreSQL

#### Option A: Use Supabase (Easiest - Recommended!) ⭐

**Why Supabase?**
- Free tier (up to 500MB)
- PostgreSQL included
- Web dashboard
- No setup needed

**Steps:**

1. **Go to:** https://supabase.com
2. **Sign up** (use your email)
3. **Create new project:**
   - Name: `replai`
   - Database Password: [save this!]
   - Region: Singapore (closest to KG)
4. **Get connection string:**
   - Go to Settings → Database
   - Copy "Connection string" (URI)
   - Save it somewhere safe!

Example:
```
postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

5. **Add to .env:**

```bash
# Add this line to /Users/ak/replai/.env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
```

---

#### Option B: Local PostgreSQL (If you want to learn)

```bash
# Install PostgreSQL
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb replai

# Add to .env
DATABASE_URL="postgresql://localhost:5432/replai"
```

---

### Day 3-4: Install Prisma & Create Schema

**Step 1: Install packages**

```bash
cd /Users/ak/replai
npm install @prisma/client
npm install -D prisma
```

**Step 2: Initialize Prisma**

```bash
npx prisma init
```

This creates:
- `prisma/` folder
- `prisma/schema.prisma` file

**Step 3: Create Database Schema**

Replace content of `prisma/schema.prisma`:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Business model
model Business {
  id                String   @id @default(uuid())
  email             String   @unique
  name              String
  industry          String?
  ownerName         String?
  password          String
  
  // Platform connections (stored as JSON)
  whatsapp          Json?
  instagram         Json?
  telegram          Json?
  
  // Subscription
  plan              String   @default("trial")
  subscriptionEnd   DateTime?
  referralCode      String?  @unique
  referredBy        String?
  referralCount     Int      @default(0)
  freeMonths        Int      @default(0)
  
  // Stats
  messageCount      Int      @default(0)
  status            String   @default("active")
  
  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  messages          Message[]
  sessions          Session[]
  
  @@index([email])
  @@index([status])
}

// Message model
model Message {
  id           String   @id @default(uuid())
  businessId   String
  platform     String   // 'instagram', 'whatsapp', 'telegram'
  userId       String
  userMessage  String   @db.Text
  aiResponse   String?  @db.Text
  
  createdAt    DateTime @default(now())
  
  business     Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  
  @@index([businessId, createdAt])
  @@index([platform])
}

// Session model (for conversation history)
model Session {
  id           String   @id @default(uuid())
  businessId   String
  userId       String
  platform     String
  history      Json     // Array of messages
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  business     Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  
  @@unique([businessId, userId, platform])
  @@index([businessId])
}

// Admin model
model Admin {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      String   @default("super_admin")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Platform Settings (global settings)
model PlatformSettings {
  id        String   @id @default(uuid())
  key       String   @unique
  value     Json
  
  updatedAt DateTime @updatedAt
}
```

**Step 4: Run Migration**

```bash
npx prisma migrate dev --name init
```

This creates the database tables!

**Step 5: Generate Prisma Client**

```bash
npx prisma generate
```

---

### Day 5-7: Migrate Data from JSON to PostgreSQL

**Create migration script:**

```javascript
// scripts/migrate-data.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function migrateData() {
  console.log('🚀 Starting data migration...\n');
  
  try {
    // 1. Migrate Admin
    console.log('1️⃣ Migrating admin...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.admin.create({
      data: {
        email: 'admin@replai.com',
        password: adminPassword,
        role: 'super_admin'
      }
    });
    console.log('✅ Admin migrated\n');
    
    // 2. Migrate Businesses
    console.log('2️⃣ Migrating businesses...');
    
    if (fs.existsSync('businesses.json')) {
      const businessesData = JSON.parse(fs.readFileSync('businesses.json', 'utf8'));
      
      for (const business of businessesData) {
        try {
          await prisma.business.create({
            data: {
              email: business.email,
              name: business.name,
              industry: business.industry || null,
              ownerName: business.ownerName || null,
              password: business.password, // Already hashed
              whatsapp: business.whatsapp || {},
              instagram: business.instagram || {},
              telegram: business.telegram || {},
              plan: business.plan || 'trial',
              messageCount: business.messageCount || 0,
              status: business.status || 'active'
            }
          });
          console.log(`✅ Migrated: ${business.email}`);
        } catch (error) {
          console.log(`❌ Failed: ${business.email} - ${error.message}`);
        }
      }
    }
    console.log('\n✅ Businesses migrated\n');
    
    // 3. Migrate Platform Settings
    console.log('3️⃣ Migrating platform settings...');
    
    if (fs.existsSync('platform-settings.json')) {
      const settings = JSON.parse(fs.readFileSync('platform-settings.json', 'utf8'));
      
      for (const [key, value] of Object.entries(settings)) {
        await prisma.platformSettings.create({
          data: {
            key,
            value
          }
        });
      }
    }
    console.log('✅ Settings migrated\n');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
```

**Run migration:**

```bash
node scripts/migrate-data.js
```

---

## 📅 Week 2: Update Server Code

### Day 1-3: Replace JSON with Prisma

**Create new file: `lib/db.js`**

```javascript
// lib/db.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test connection
prisma.$connect()
  .then(() => console.log('✅ Database connected'))
  .catch((err) => console.error('❌ Database connection failed:', err));

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
```

**Update server-new.js:**

```javascript
// At top of server-new.js
import prisma from './lib/db.js';

// OLD CODE (remove this):
// const businesses = JSON.parse(fs.readFileSync('businesses.json'));
// function saveBusinesses() { fs.writeFileSync(...) }

// NEW CODE (use instead):

// Get all businesses
const businesses = await prisma.business.findMany();

// Get one business
const business = await prisma.business.findUnique({
  where: { email: 'aziz@barber.com' }
});

// Create business
await prisma.business.create({
  data: {
    email,
    name,
    password: hashedPassword,
    whatsapp: {},
    instagram: {},
    telegram: {}
  }
});

// Update business
await prisma.business.update({
  where: { id: businessId },
  data: {
    messageCount: { increment: 1 }
  }
});

// Save message
await prisma.message.create({
  data: {
    businessId,
    platform: 'instagram',
    userId,
    userMessage: message,
    aiResponse: response
  }
});
```

**Find & Replace in server-new.js:**

1. Find all `fs.readFileSync('businesses.json')`
   → Replace with `await prisma.business.findMany()`

2. Find all `saveBusinesses()`
   → Replace with Prisma update queries

3. Find all `businesses.find(...)`
   → Replace with `await prisma.business.findFirst({ where: {...} })`

---

### Day 4-5: Add Self-Service Registration

**Create `public/register.html`:**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Регистрация - REPLAI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, system-ui, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 450px;
      width: 100%;
    }
    h1 {
      font-size: 28px;
      margin-bottom: 8px;
      color: #1a202c;
    }
    .subtitle {
      color: #718096;
      margin-bottom: 32px;
      font-size: 14px;
    }
    input, select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 16px;
      transition: all 0.2s;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
    }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .footer {
      text-align: center;
      margin-top: 24px;
      color: #718096;
      font-size: 14px;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .error {
      background: #fed7d7;
      color: #c53030;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🤖 Начните с REPLAI</h1>
    <p class="subtitle">7 дней бесплатно. Кредитная карта не нужна.</p>
    
    <div id="error" class="error" style="display: none;"></div>
    
    <form id="register-form">
      <input type="text" name="name" placeholder="Название бизнеса *" required>
      <input type="email" name="email" placeholder="Email *" required>
      <input type="text" name="ownerName" placeholder="Ваше имя *" required>
      <select name="industry" required>
        <option value="">Выберите индустрию *</option>
        <option value="barber">Барбершоп</option>
        <option value="cafe">Кафе/Ресторан</option>
        <option value="gym">Спортзал</option>
        <option value="salon">Салон красоты</option>
        <option value="shop">Магазин</option>
        <option value="service">Услуги</option>
        <option value="other">Другое</option>
      </select>
      <input type="password" name="password" placeholder="Пароль (мин. 6 символов) *" minlength="6" required>
      <button type="submit" id="submit-btn">Начать бесплатно →</button>
    </form>
    
    <div class="footer">
      Уже есть аккаунт? <a href="/business-dashboard">Войти</a>
    </div>
  </div>
  
  <script>
    const form = document.getElementById('register-form');
    const errorDiv = document.getElementById('error');
    const submitBtn = document.getElementById('submit-btn');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      errorDiv.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Регистрация...';
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      try {
        const response = await fetch('/api/business/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Сохранить токен
          localStorage.setItem('businessToken', result.token);
          // Перейти в дашборд
          window.location.href = '/business-dashboard';
        } else {
          errorDiv.textContent = result.error || 'Ошибка регистрации';
          errorDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Начать бесплатно →';
        }
      } catch (error) {
        errorDiv.textContent = 'Ошибка сети. Попробуйте снова.';
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Начать бесплатно →';
      }
    });
  </script>
</body>
</html>
```

**Add registration endpoint to server-new.js:**

```javascript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT secret (add to .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// POST /api/business/register
app.post('/api/business/register', async (req, res) => {
  try {
    const { email, name, ownerName, industry, password } = req.body;
    
    // Validate
    if (!email || !name || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Заполните все обязательные поля' 
      });
    }
    
    // Check if exists
    const existing = await prisma.business.findUnique({
      where: { email }
    });
    
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email уже зарегистрирован' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate referral code
    const referralCode = `RPLAI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Create business
    const business = await prisma.business.create({
      data: {
        email,
        name,
        ownerName,
        industry,
        password: hashedPassword,
        referralCode,
        plan: 'trial',
        subscriptionEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        whatsapp: {},
        instagram: {},
        telegram: {}
      }
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: business.id, email: business.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({ 
      success: true, 
      token,
      business: {
        id: business.id,
        email: business.email,
        name: business.name
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка регистрации. Попробуйте снова.' 
    });
  }
});

// Add JWT_SECRET to .env:
// JWT_SECRET=replai_super_secret_key_change_this_in_production
```

**Install JWT package:**

```bash
npm install jsonwebtoken bcryptjs
```

---

### Day 6-7: Testing

**Test checklist:**

```bash
# 1. Test database connection
npx prisma studio
# Opens web UI to view database

# 2. Test registration
# Go to: http://localhost:3000/register.html
# Try registering new business

# 3. Test login
# Go to business dashboard
# Login with new account

# 4. Check data in Supabase
# Go to supabase.com → your project → Table Editor
# Should see new business!
```

---

## ✅ Progress Tracker

Track your progress:

### Week 1: Database
- [ ] Day 1: Create Supabase account & database
- [ ] Day 2: Add DATABASE_URL to .env
- [ ] Day 3: Install Prisma & create schema
- [ ] Day 4: Run migrations
- [ ] Day 5: Create migration script
- [ ] Day 6: Migrate existing data
- [ ] Day 7: Test database

### Week 2: Server Update
- [ ] Day 1: Create lib/db.js
- [ ] Day 2: Replace JSON with Prisma (part 1)
- [ ] Day 3: Replace JSON with Prisma (part 2)
- [ ] Day 4: Create registration page
- [ ] Day 5: Add registration endpoint
- [ ] Day 6: Test everything
- [ ] Day 7: Fix bugs & celebrate! 🎉

---

## 💡 Pro Tips

1. **Backup before changes:**
```bash
cp -r /Users/ak/replai /Users/ak/replai-backup
```

2. **Test locally first:**
Don't test on production with real users!

3. **Use Prisma Studio:**
```bash
npx prisma studio
```
Visual database editor - super helpful!

4. **Ask AI for help:**
If stuck, ask me: "How do I [specific thing]?"
I'll give exact code!

5. **Commit often:**
```bash
git add .
git commit -m "Migrated to PostgreSQL"
```

---

## 🚨 Common Problems & Solutions

### Problem: "Can't connect to database"
**Solution:**
- Check DATABASE_URL in .env
- Make sure it has your actual password
- Try connecting in Supabase dashboard first

### Problem: "Prisma command not found"
**Solution:**
```bash
npm install -D prisma
npx prisma --version
```

### Problem: "Migration failed"
**Solution:**
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Problem: "Data not showing up"
**Solution:**
```bash
npx prisma studio
# Check if data is actually in database
```

---

## 🎯 After Migration Complete

### Next Steps:

1. **Delete old JSON files** (keep backup!)
```bash
mkdir old-json-backup
mv businesses.json old-json-backup/
mv sessions.json old-json-backup/
```

2. **Update .gitignore:**
```
# Add these lines
old-json-backup/
*.log
prisma/migrations/
```

3. **Test with real traffic:**
- Register 2-3 test businesses
- Send messages
- Check everything works

4. **Ready for VIRAL GROWTH!** 🚀

---

## 📞 Need Help?

**Ask me anytime:**
- "I'm stuck on Day 3, step 2"
- "This error appeared: [error]"
- "How do I [specific thing]?"

**I'll give you:**
- Exact code to fix it
- Step-by-step instructions
- Alternative solutions

---

**Let's do this together! 💪**

**Start today with Day 1!** ⬆️
