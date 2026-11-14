#!/bin/bash

# =====================================================
# FIX AKTAN MODEL - Switch from Kiro to Anthropic
# =====================================================

echo "🔧 Fixing Aktan Model Configuration"
echo "===================================="
echo ""

# Check if OmniRoute database exists
DB_PATH="$HOME/.omniroute/storage.sqlite"

if [ ! -f "$DB_PATH" ]; then
    echo "❌ Error: OmniRoute database not found at $DB_PATH"
    exit 1
fi

echo "✅ Found OmniRoute database"
echo ""

# Show current configuration
echo "📋 Current Aktan Configuration:"
echo "-------------------------------"
sqlite3 "$DB_PATH" "SELECT json(data) FROM combos WHERE name='Aktan';" 2>/dev/null | jq '.'
echo ""

# Backup database
BACKUP_PATH="$HOME/.omniroute/storage.sqlite.backup-$(date +%Y%m%d-%H%M%S)"
echo "💾 Creating backup: $BACKUP_PATH"
cp "$DB_PATH" "$BACKUP_PATH"
echo "✅ Backup created"
echo ""

# Ask user which provider to use
echo "🎯 Which provider would you like to use?"
echo ""
echo "1) Anthropic (Direct - Recommended)"
echo "2) Kumo (You have key but need funds)"
echo "3) OpenRouter (Free tier available)"
echo "4) Cancel"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        PROVIDER="anthropic"
        MODEL="claude-sonnet-4.5"
        echo ""
        echo "✅ Selected: Anthropic Direct"
        ;;
    2)
        PROVIDER="kumo"
        MODEL="claude-sonnet-4.5"
        echo ""
        echo "✅ Selected: Kumo"
        echo "⚠️  Remember: You need to add funds to your Kumo account"
        ;;
    3)
        PROVIDER="openrouter"
        MODEL="anthropic/claude-sonnet-4.5:free"
        echo ""
        echo "✅ Selected: OpenRouter (Free Tier)"
        ;;
    *)
        echo "❌ Cancelled"
        exit 0
        ;;
esac

echo ""
echo "🔄 Updating Aktan configuration..."
echo ""

# Update the combo
sqlite3 "$DB_PATH" <<SQL
UPDATE combos 
SET data = json_set(
  data,
  '$.models[0].model', '$MODEL',
  '$.models[0].providerId', '$PROVIDER'
),
updated_at = datetime('now')
WHERE name = 'Aktan';
SQL

if [ $? -eq 0 ]; then
    echo "✅ Database updated successfully!"
else
    echo "❌ Error updating database"
    exit 1
fi

echo ""
echo "📋 New Aktan Configuration:"
echo "---------------------------"
sqlite3 "$DB_PATH" "SELECT json(data) FROM combos WHERE name='Aktan';" 2>/dev/null | jq '.'
echo ""

echo "============================================"
echo "✨ Configuration Updated Successfully!"
echo "============================================"
echo ""
echo "📝 Next Steps:"
echo ""

case $PROVIDER in
    "anthropic")
        echo "1. Get your Anthropic API key from: https://console.anthropic.com/"
        echo "2. Add it to OmniRoute:"
        echo "   omniroute key add --provider anthropic --key 'sk-ant-...'"
        echo ""
        echo "3. Or via dashboard:"
        echo "   - Open: http://localhost:20128"
        echo "   - Go to Settings → API Keys"
        echo "   - Add Anthropic key"
        ;;
    "kumo")
        echo "1. Add funds to your Kumo account (you have the key already)"
        echo "2. Check your key is active:"
        echo "   omniroute key list"
        ;;
    "openrouter")
        echo "1. Get your OpenRouter API key from: https://openrouter.ai/keys"
        echo "2. Add it to OmniRoute:"
        echo "   omniroute key add --provider openrouter --key 'sk-or-...'"
        ;;
esac

echo ""
echo "4. Restart OmniRoute (if running)"
echo "5. Test with model: 'aktan' or 'Aktan'"
echo ""
echo "📦 Backup saved at:"
echo "   $BACKUP_PATH"
echo ""
echo "🎉 Done! Your Aktan model is ready to use!"
