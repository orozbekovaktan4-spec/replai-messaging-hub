# 🚀 Fix Render Deployment - Database Migration

## ✅ **What Was Fixed:**
1. ✅ `api-keys.json` error - Now handles missing file gracefully
2. 🔄 Need to update Build Command to run Prisma migrations

---

## 📋 **Steps to Fix Deployment:**

### **Step 1: Update Build Command**

1. Go to: https://dashboard.render.com/web/replai-xc95
2. Click **"Settings"** tab (left sidebar)
3. Scroll to **"Build Command"**
4. **Change from:**
   ```
   npm install
   ```
5. **Change to:**
   ```
   npm install && npx prisma generate && npx prisma migrate deploy
   ```
6. Click **"Save Changes"** button

### **Step 2: Deploy Latest Code**

1. Go back to **"Deploys"** tab
2. Click **"Manual Deploy"** button (top right)
3. Select **"Deploy latest commit"**
4. Wait 3-5 minutes

### **Step 3: Watch Deployment Logs**

You should see:
```
==> Running build command 'npm install && npx prisma generate && npx prisma migrate deploy'...
✓ Generated Prisma Client
✓ Applying migration `20241016_initial_migration`
✓ Migration applied successfully
==> Build successful 🎉
==> Your service is live 🎉
```

### **Step 4: Verify Database is Working**

After deployment completes, the Instagram polling errors should stop:
- ❌ Before: `The table 'main.Business' does not exist`
- ✅ After: Silent (no errors = database working!)

---

## 🎯 **What This Does:**

### **`npx prisma generate`**
- Creates the Prisma Client code
- Enables database queries in your Node.js code

### **`npx prisma migrate deploy`**
- Runs all migrations from `prisma/migrations/` folder
- Creates the SQLite database tables:
  - `Business` (stores business info)
  - `PlatformSettings` (stores platform configs)
  - `Session` (stores user sessions)
  - `Conversation` (stores chat history)
  - `Message` (stores all messages)

---

## ✅ **After Deployment:**

Your server will:
- ✅ Use SQLite database (not JSON files)
- ✅ Handle 100+ businesses easily
- ✅ Store all chat history in database
- ✅ Run 24/7 on Render.com
- ✅ Auto-restart if it crashes
- ✅ Stay awake with UptimeRobot pings

---

## 🔍 **Troubleshooting:**

If you still see database errors after deployment:

1. **Check Build Logs** - Should show "Migration applied successfully"
2. **Check Environment Variables** - Make sure all API keys are set
3. **Restart Service** - Go to Settings → Click "Restart Service"

---

## 📞 **Need Help?**

If deployment fails, check:
- Build logs for error messages
- Environment variables are all set
- GitHub repo is accessible by Render

**Your server URL:** https://replai-xc95.onrender.com
**Admin Panel:** https://replai-xc95.onrender.com/admin
**Health Check:** https://replai-xc95.onrender.com/api/health

---

**Ready to deploy? Follow Step 1 above!** 🚀
