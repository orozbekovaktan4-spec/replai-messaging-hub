# Database Configuration: Local vs Production

## ⚠️ Important: Different Databases

Your setup uses **different databases** in different environments:

### Local Development (Your Computer):
- **Database**: SQLite
- **DATABASE_URL**: `file:./dev.db`
- **File**: `/Users/ak/replai/dev.db`
- **Why**: Simple, no setup needed, good for development

### Production (Render):
- **Database**: PostgreSQL
- **DATABASE_URL**: Set in Render environment variables
- **Why**: Production-grade, better for live traffic

## 🔧 Current Configuration

**prisma/schema.prisma:**
```prisma
datasource db {
  provider = "postgresql"  // For production
  url      = env("DATABASE_URL")
}
```

**Local .env:**
```env
DATABASE_URL="file:./dev.db"  // SQLite for local
```

## ⚠️ The Problem

Prisma schema says `provider = "postgresql"` but your local DATABASE_URL is SQLite (`file:./dev.db`).

This causes errors locally!

## ✅ Solutions

### Option 1: Use PostgreSQL Locally Too (Recommended)

Install PostgreSQL locally:
```bash
brew install postgresql@14
brew services start postgresql@14
```

Create database:
```bash
createdb replai_dev
```

Update `.env`:
```env
DATABASE_URL="postgresql://localhost:5432/replai_dev"
```

Run migrations:
```bash
npx prisma migrate dev
```

### Option 2: Keep SQLite Locally (Simpler)

For local SQLite to work with current schema:

1. **Don't run the local server** (just use production)
2. **Or** temporarily change schema.prisma locally:
   ```prisma
   provider = "sqlite"
   ```
   But **DON'T commit this change**!

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

## 🚫 What NOT to Do

❌ **Don't commit schema changes for local development**
- Prisma schema should always be `provider = "postgresql"` in git
- Production breaks if you push `provider = "sqlite"`

❌ **Don't mix databases**
- Data in dev.db won't sync to production
- Changes in production won't appear locally

## 🎯 Recommended Workflow

For development:

1. **Test on production (Render)**
   - Make changes
   - Push to GitHub
   - Render deploys automatically
   - Test at https://replai-xc95.onrender.com

2. **Or use PostgreSQL locally**
   - Install PostgreSQL
   - Use same database as production
   - Run migrations locally
   - Test before pushing

## 📊 Current Status

✅ **Production (Render):**
- Using PostgreSQL
- Schema is correct
- Should work after deployment

❌ **Local:**
- Schema says PostgreSQL
- But DATABASE_URL is SQLite
- Will cause errors if you run server locally

## 🔧 Quick Fix for Local Testing

If you want to test locally right now:

```bash
# Option A: Use production for testing (easiest)
# Just test on https://replai-xc95.onrender.com

# Option B: Switch to PostgreSQL locally
brew install postgresql@14
createdb replai_dev
# Update .env DATABASE_URL
npx prisma migrate dev

# Option C: Temporarily use SQLite (don't commit!)
# Edit schema.prisma, change to sqlite
npx prisma generate
# Remember to change back before committing!
```

## 🎉 Good News

Render deployment is fixing this right now! Production will work in ~2 minutes.

For local development, either:
1. Test on production (easiest)
2. Install PostgreSQL locally (better long-term)
