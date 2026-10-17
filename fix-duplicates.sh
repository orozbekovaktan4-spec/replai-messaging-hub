#!/bin/bash
# Script to remove duplicate API endpoints from server-new.js
# CRITICAL FIX #1: Remove duplicate endpoints

echo "🔧 Removing duplicate API endpoints..."
cd /Users/ak/replai

# Create backup
cp server-new.js server-new.js.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"

# Remove duplicate endpoints by line ranges
# Keep: First implementation (lines 4195-4393)
# Delete: Lines 4394-4576 (duplicate GET /api/admin/businesses)
# Keep: First POST at 4277
# Delete: Lines 4598-4652 (duplicate POST /api/admin/businesses at line 4598)
# Delete: Lines 4876-4930 (duplicate POST /api/admin/businesses at line 4876)

# Keep: First GET /:id at 4577
# Delete: Lines 4855-4875 (duplicate GET /api/admin/businesses/:id)

# Keep: First PUT at 4653
# Delete: Lines 4931-4989 (duplicate PUT /api/admin/businesses/:id)

# Keep: First DELETE at 4712
# Delete: Lines 4990-5020 (duplicate DELETE /api/admin/businesses/:id)

echo "Identifying duplicate line ranges..."

# Use sed to delete specific line ranges
sed -i.tmp \
  -e '4394,4576d' \
  -e '4598,4652d' \
  -e '4855,4875d' \
  -e '4876,4930d' \
  -e '4931,4989d' \
  -e '4990,5020d' \
  server-new.js

if [ $? -eq 0 ]; then
  echo "✅ Duplicates removed successfully"
  rm server-new.js.tmp

  # Count remaining endpoints
  ENDPOINTS=$(grep -c "^app\.\(get\|post\|put\|delete\)('/api/admin/businesses" server-new.js)
  echo "📊 Remaining business endpoints: $ENDPOINTS (should be 5)"

  # Verify syntax
  node --check server-new.js
  if [ $? -eq 0 ]; then
    echo "✅ JavaScript syntax valid"
  else
    echo "❌ Syntax error! Restoring backup..."
    mv server-new.js.backup-* server-new.js
    exit 1
  fi
else
  echo "❌ Error removing duplicates"
  exit 1
fi

echo ""
echo "✅ CRITICAL FIX #1 COMPLETE"
echo "Removed duplicate API endpoint definitions"
