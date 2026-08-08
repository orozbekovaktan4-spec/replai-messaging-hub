#!/bin/bash

# Instagram Token Refresh Helper Script
# This script helps you exchange a short-lived token for a long-lived token

echo "============================================================"
echo "  📸 INSTAGRAM TOKEN REFRESH HELPER"
echo "============================================================"
echo ""

# Read credentials from .env
APP_ID=$(grep "INSTAGRAM_APP_ID=" .env | cut -d '=' -f2)
APP_SECRET=$(grep "INSTAGRAM_APP_SECRET=" .env | cut -d '=' -f2)

if [ -z "$APP_ID" ] || [ -z "$APP_SECRET" ]; then
    echo "❌ Error: Could not find INSTAGRAM_APP_ID or INSTAGRAM_APP_SECRET in .env"
    exit 1
fi

echo "App ID: $APP_ID"
echo ""
echo "Please paste your SHORT-LIVED token (from Facebook Developer Console):"
read -r SHORT_TOKEN

if [ -z "$SHORT_TOKEN" ]; then
    echo "❌ Error: No token provided"
    exit 1
fi

echo ""
echo "🔄 Exchanging for long-lived token..."
echo ""

# Exchange for long-lived token
RESPONSE=$(curl -s "https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=$APP_SECRET&access_token=$SHORT_TOKEN")

# Check if response contains error
if echo "$RESPONSE" | grep -q "error"; then
    echo "❌ Error exchanging token:"
    echo "$RESPONSE" | python3 -m json.tool
    exit 1
fi

# Extract the new token
LONG_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")
EXPIRES_IN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('expires_in', 0))")

if [ -z "$LONG_TOKEN" ]; then
    echo "❌ Error: Could not extract token from response"
    echo "$RESPONSE"
    exit 1
fi

# Calculate expiry date
EXPIRES_DAYS=$((EXPIRES_IN / 86400))
EXPIRES_DATE=$(date -v+${EXPIRES_DAYS}d "+%Y-%m-%d" 2>/dev/null || date -d "+${EXPIRES_DAYS} days" "+%Y-%m-%d" 2>/dev/null)

echo "✅ Success! Long-lived token obtained!"
echo ""
echo "Token expires in: $EXPIRES_DAYS days (on $EXPIRES_DATE)"
echo ""
echo "============================================================"
echo "  📝 NEW TOKEN (copy this):"
echo "============================================================"
echo ""
echo "$LONG_TOKEN"
echo ""
echo "============================================================"
echo ""
echo "Now updating .env file..."

# Update .env file
if grep -q "INSTAGRAM_ACCESS_TOKEN=" .env; then
    # Replace existing token
    sed -i.bak "s|INSTAGRAM_ACCESS_TOKEN=.*|INSTAGRAM_ACCESS_TOKEN=$LONG_TOKEN|" .env
else
    # Add new token
    echo "INSTAGRAM_ACCESS_TOKEN=$LONG_TOKEN" >> .env
fi

# Add expiry date
if grep -q "INSTAGRAM_TOKEN_EXPIRES_AT=" .env; then
    sed -i.bak "s|INSTAGRAM_TOKEN_EXPIRES_AT=.*|INSTAGRAM_TOKEN_EXPIRES_AT=$EXPIRES_DATE|" .env
else
    echo "INSTAGRAM_TOKEN_EXPIRES_AT=$EXPIRES_DATE" >> .env
fi

echo "✅ .env file updated!"
echo ""
echo "============================================================"
echo "  🎉 INSTAGRAM TOKEN REFRESHED SUCCESSFULLY!"
echo "============================================================"
echo ""
echo "Next steps:"
echo "1. Restart the server: npm start"
echo "2. Test by sending a DM to @akt4n.o"
echo ""
