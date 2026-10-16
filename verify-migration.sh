#!/bin/bash
# Final migration verification

echo "🔍 Verifying Database Migration..."
echo ""

cd /Users/ak/replai

# Check database file exists
if [ -f "prisma/dev.db" ]; then
  echo "✅ Database file exists: prisma/dev.db"
else
  echo "❌ Database file missing!"
  exit 1
fi

# Check helper functions exist
if [ -f "db.js" ]; then
  echo "✅ Database helpers exist: db.js"
else
  echo "❌ db.js missing!"
  exit 1
fi

# Count database operations
DB_CALLS=$(grep -c "db\." server-new.js)
echo "✅ Found $DB_CALLS database calls in server-new.js"

# Check for remaining JSON operations
STORE_REFS=$(grep -c "const store = " server-new.js 2>/dev/null || echo "0")
echo "📊 Remaining 'store' variables: $STORE_REFS (should be 0-2)"

# Check imports
if grep -q "import \* as db from './db.js'" server-new.js; then
  echo "✅ Database imports present"
else
  echo "⚠️  Database imports may be missing"
fi

echo ""
echo "🧪 Running test migration script..."
node test-migration.js

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ ALL TESTS PASSED!"
  echo ""
  echo "📋 Migration Summary:"
  echo "   - JSON file storage → SQLite database"
  echo "   - All business data migrated"
  echo "   - Session management using Prisma"
  echo "   - API keys in database"
  echo "   - Platform settings in database"
  echo ""
  echo "🚀 Next Steps:"
  echo "   1. Start server: npm start"
  echo "   2. Test login at http://localhost:3000/login"
  echo "   3. Test admin dashboard"
  echo "   4. Send test messages to webhooks"
  echo ""
  echo "💾 Backup recommendation:"
  echo "   cp prisma/dev.db prisma/dev.db.backup"
  echo ""
  echo "🌐 To switch to PostgreSQL/Supabase later:"
  echo "   1. Update prisma/schema.prisma datasource to postgresql"
  echo "   2. Add DATABASE_URL to .env"
  echo "   3. Run: npx prisma db push"
  echo "   4. Run: node migrate-json-to-db.js"
  echo ""
else
  echo ""
  echo "❌ Tests failed. Check errors above."
  exit 1
fi
