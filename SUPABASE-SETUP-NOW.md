# Supabase Setup - Do This Right Now (5 Minutes)

## Step 1: Create Supabase Account

1. Open browser: **https://supabase.com**
2. Click green button: **"Start your project"**
3. Sign up with:
   - GitHub (recommended - 1 click)
   - OR Email + Password

---

## Step 2: Create New Project

Once logged in:

1. Click **"New Project"** button (green button, top right)

2. Fill in the form:
   ```
   Name: replai-production
   
   Database Password: [CREATE STRONG PASSWORD]
   ⚠️ IMPORTANT: Save this password in safe place!
   Example: ReplAI2024$Secure!Kyrgyz
   
   Region: Select closest to Kyrgyzstan
   Options:
   - Southeast Asia (Singapore) - Best for Asia
   - Central EU (Frankfurt) - Good for Europe/Central Asia
   - OR select "South Asia (Mumbai)" if available
   
   Pricing Plan: Free (already selected)
   ```

3. Click **"Create new project"**

4. ⏳ Wait ~2 minutes (loading spinner will show "Setting up project...")

---

## Step 3: Get Your Database URL

Once project shows "Active" status:

### Option A: Using Connection Pooler (Recommended for Prisma)

1. Click **Settings** (gear icon) in left sidebar
2. Click **Database** in the settings menu
3. Scroll to **Connection string** section
4. Click tab: **URI** (not Transaction, not Session)
5. You'll see something like:
   ```
   postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```
6. Click **"Copy"** button
7. Replace `[YOUR-PASSWORD]` with the actual password you created in Step 2

### Your Final URL Will Look Like:
```
postgresql://postgres.abcdefghijklmnop:ReplAI2024$Secure!Kyrgyz@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

---

## Step 4: Add to Your .env File

Open `/Users/ak/replai/.env` and add this line:

```env
# Supabase PostgreSQL Database
DATABASE_URL="postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-xx.pooler.supabase.com:5432/postgres"
```

Replace with your actual URL from Step 3.

---

## Step 5: Test Connection with Prisma

Run these commands in terminal:

```bash
cd /Users/ak/replai

# Install Prisma (if not installed)
npm install prisma @prisma/client

# Initialize Prisma with your schema (already created by Claude)
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Test connection
npx prisma studio
```

If `prisma studio` opens in browser (http://localhost:5555), **YOU'RE DONE!** ✅

---

## Step 6: Copy URL and Send to Claude

Copy this exact message and send to Claude:

```
✅ Supabase setup complete!

Here is my DATABASE_URL:
postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-xx.pooler.supabase.com:5432/postgres

I've added it to my .env file.

Please help me:
1. Verify the connection works
2. Run the initial migration
3. Show me the database tables that were created
4. Create the migration script to move data from JSON files to PostgreSQL

My project directory: /Users/ak/replai/
```

---

## Troubleshooting

### "Password contains special characters and connection fails"

If your password has special characters like `$`, `@`, `#`, you need to URL-encode them:

```
@ becomes %40
$ becomes %24
# becomes %23
! becomes %21
```

Example:
```
Password: ReplAI2024$Secure!
Encoded:  ReplAI2024%24Secure%21
```

### "Connection timeout"

- Check your internet connection
- Try changing region in Supabase project settings
- Make sure you're using the **Pooler** connection string (not Direct)

### "Database doesn't exist"

- Make sure you copied the URI connection string (not Transaction or Session mode)
- Verify the database name is `postgres` at the end of the URL

---

## What Happens Next?

After you send the DATABASE_URL to Claude, he will:

1. ✅ Verify Prisma can connect to Supabase
2. ✅ Create all database tables (businesses, sessions, messages, etc.)
3. ✅ Write migration script to move your JSON data → PostgreSQL
4. ✅ Test with Aziz's barbershop data (156 messages)
5. ✅ Update server-new.js to use Prisma instead of JSON files
6. ✅ Test everything works locally
7. ✅ Help you deploy to Render with new DATABASE_URL

**Total time for Claude to do all this: ~30-45 minutes**

---

## Quick Reference

**Supabase Dashboard:** https://app.supabase.com/project/YOUR_PROJECT_ID
**Database Browser:** Project → Table Editor
**SQL Editor:** Project → SQL Editor
**Logs:** Project → Logs

---

**You're at:** ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ 0% → Need to create Supabase account

**Next milestone:** ✅ Database URL in .env file
**Final milestone:** ✅ All JSON data migrated to PostgreSQL

Let's go! 🚀
