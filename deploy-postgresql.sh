#!/bin/bash

# REPLAI PostgreSQL Deployment Guide
# ==================================
# Complete guide to set up PostgreSQL on Render and deploy

echo "🗄️ REPLAI PostgreSQL Migration Guide"
echo "====================================="
echo ""
echo "Current Status: Code committed, ready to deploy"
echo ""
echo "📋 STEP-BY-STEP INSTRUCTIONS"
echo "=============================="
echo ""

echo "STEP 1: Create PostgreSQL Database on Render"
echo "---------------------------------------------"
echo ""
echo "1. Go to: https://dashboard.render.com"
echo "2. Click 'New +' → 'PostgreSQL'"
echo "3. Fill in:"
echo "   - Name: replai-db"
echo "   - Database: replai"
echo "   - User: replai"
echo "   - Region: Same as your web service"
echo "   - Plan: Free ($0/month)"
echo "4. Click 'Create Database'"
echo "5. Wait 2-3 minutes for creation"
echo ""
echo "After creation, you'll see:"
echo "   - Internal Database URL (starts with postgresql://...)"
echo "   - External Database URL (starts with postgresql://...)"
echo ""
echo "👉 COPY THE INTERNAL DATABASE URL!"
echo ""
read -p "Press Enter after you've created the database and copied the URL..."
echo ""

echo "STEP 2: Add DATABASE_URL to Render Environment"
echo "-----------------------------------------------"
echo ""
echo "1. Go to: https://dashboard.render.com"
echo "2. Find your 'replai' web service (NOT the database)"
echo "3. Click 'Environment' tab"
echo "4. Add new variable:"
echo "   Key: DATABASE_URL"
echo "   Value: [Paste the INTERNAL DATABASE URL you copied]"
echo "5. Click 'Save Changes'"
echo ""
echo "⚠️  IMPORTANT: Make sure to use the INTERNAL URL, not external!"
echo ""
read -p "Press Enter after DATABASE_URL is set in Render..."
echo ""

echo "STEP 3: Push Code to Trigger Deployment"
echo "----------------------------------------"
echo ""
echo "Pushing changes to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
  echo "✅ Code pushed successfully!"
  echo ""
  echo "Render will now:"
  echo "   1. Pull new code from GitHub"
  echo "   2. Install dependencies"
  echo "   3. Run 'npm run build' (Prisma migration)"
  echo "   4. Start the server"
  echo ""
  echo "This takes 3-5 minutes..."
else
  echo "❌ Push failed! Check your git configuration."
  exit 1
fi

echo ""
echo "STEP 4: Monitor Deployment"
echo "--------------------------"
echo ""
echo "1. Go to your Render dashboard"
echo "2. Click on your 'replai' service"
echo "3. Go to 'Logs' tab"
echo "4. Watch for:"
echo "   - 'Running build command...'"
echo "   - 'Applying migration...'"
echo "   - 'Server running at...'"
echo ""
read -p "Press Enter after deployment completes (watch logs)..."
echo ""

echo "STEP 5: Verify PostgreSQL Connection"
echo "-------------------------------------"
echo ""
echo "Testing production database connection..."

# Test health endpoint
HEALTH=$(curl -s https://replai-xc95.onrender.com/api/health)
if [ "$HEALTH" = "OK" ]; then
  echo "✅ Server is running!"
else
  echo "❌ Server not responding. Check Render logs for errors."
  exit 1
fi

# Test businesses endpoint
echo ""
echo "Checking database connection..."
BUSINESSES=$(curl -s https://replai-xc95.onrender.com/api/admin/businesses)
SUCCESS=$(echo $BUSINESSES | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
  echo "✅ PostgreSQL connected successfully!"
  echo ""
  TOTAL=$(echo $BUSINESSES | jq -r '.total')
  echo "Current businesses in database: $TOTAL"
else
  echo "❌ Database connection failed!"
  echo "Response: $BUSINESSES"
  exit 1
fi

echo ""
echo "STEP 6: Recreate Businesses in PostgreSQL"
echo "------------------------------------------"
echo ""
echo "The database is empty (fresh PostgreSQL). Let's recreate businesses..."
echo ""

# Create White Gold
echo "Creating White Gold business..."
WHITEGOLD=$(curl -s -X POST https://replai-xc95.onrender.com/api/admin/businesses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "White Gold",
    "ownerName": "Султанова Чынара",
    "email": "orozbekovaktan4@gmail.com",
    "password": "whitegold123",
    "plan": "pro",
    "country": "Kyrgyzstan",
    "industry": "Розничный магазин"
  }')

WHITEGOLD_ID=$(echo $WHITEGOLD | jq -r '.business.id')
if [ "$WHITEGOLD_ID" != "null" ]; then
  echo "✅ White Gold created: $WHITEGOLD_ID"
else
  echo "⚠️  White Gold creation result: $(echo $WHITEGOLD | jq -r '.message')"
fi

# Create Aziz Barber
echo "Creating Aziz Barber Shop..."
AZIZ=$(curl -s -X POST https://replai-xc95.onrender.com/api/admin/businesses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aziz Barber Shop",
    "ownerName": "Aziz Karimov",
    "email": "aziz@barber.com",
    "password": "barber123",
    "plan": "free",
    "country": "Kyrgyzstan",
    "industry": "Barbershop"
  }')

AZIZ_ID=$(echo $AZIZ | jq -r '.business.id')
if [ "$AZIZ_ID" != "null" ]; then
  echo "✅ Aziz Barber Shop created: $AZIZ_ID"
else
  echo "⚠️  Aziz Barber creation result: $(echo $AZIZ | jq -r '.message')"
fi

echo ""
echo "STEP 7: Connect Platforms"
echo "-------------------------"
echo ""
echo "Connecting Instagram, Telegram, and WhatsApp..."
node connect-production-platforms.js

echo ""
echo "STEP 8: Test Data Persistence"
echo "------------------------------"
echo ""
echo "Let's verify data survives redeploys..."
echo ""
echo "Current businesses:"
curl -s https://replai-xc95.onrender.com/api/admin/businesses | jq -r '.data[] | "   - \(.name) (\(.email))"'

echo ""
echo "Now triggering a test redeploy..."
git commit --allow-empty -m "🧪 Test PostgreSQL persistence"
git push origin main

echo ""
echo "⏳ Wait 5 minutes for redeploy to complete..."
echo "   You can monitor: https://dashboard.render.com"
echo ""
read -p "Press Enter after redeploy completes..."

echo ""
echo "Checking if businesses still exist after redeploy..."
AFTER=$(curl -s https://replai-xc95.onrender.com/api/admin/businesses)
AFTER_TOTAL=$(echo $AFTER | jq -r '.total')

if [ "$AFTER_TOTAL" -gt 0 ]; then
  echo "✅ SUCCESS! $AFTER_TOTAL businesses survived the redeploy!"
  echo ""
  echo "$AFTER" | jq -r '.data[] | "   ✅ \(.name) (\(.email))"'
else
  echo "❌ FAILED! Businesses were lost. Check Render logs."
  exit 1
fi

echo ""
echo ""
echo "🎉 POSTGRESQL MIGRATION COMPLETE!"
echo "=================================="
echo ""
echo "✅ What Changed:"
echo "   - Database: SQLite → PostgreSQL"
echo "   - Data persistence: ❌ Lost on redeploy → ✅ Permanent"
echo "   - Backups: ❌ None → ✅ Automatic (7 days)"
echo "   - Scalability: ❌ Limited → ✅ 10,000+ businesses"
echo ""
echo "🌐 Production URLs:"
echo "   Admin Panel: https://replai-xc95.onrender.com/admin"
echo "   API Health:  https://replai-xc95.onrender.com/api/health"
echo ""
echo "🔑 Test Logins:"
echo "   1. orozbekovaktan4@gmail.com / whitegold123"
echo "   2. aziz@barber.com / barber123"
echo ""
echo "📊 Database Info:"
echo "   Provider: PostgreSQL (Render)"
echo "   Storage: 1 GB (Free tier)"
echo "   Backups: 7 days retention"
echo "   Cost: \$0/month"
echo ""
echo "🎯 Next Steps:"
echo "   1. Open admin panel and verify businesses"
echo "   2. Test Instagram DM to @akt4n.o"
echo "   3. Never worry about data loss again!"
echo ""
echo "🛑 STOP USING LOCALHOST!"
echo "   Kill local server: lsof -ti:3000 | xargs kill -9"
echo "   Always use: https://replai-xc95.onrender.com"
echo ""
