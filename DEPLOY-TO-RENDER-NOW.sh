#!/bin/bash

# Deploy unslopped admin panel to Render
# Run this script to push to GitHub and trigger Render auto-deploy

echo "🚀 Deploying REPLAI Admin Panel to Render..."
echo ""

cd /Users/ak/replai

echo "📊 Current status:"
git status --short
echo ""

echo "📝 Commits to push:"
git log origin/main..HEAD --oneline
echo ""

echo "🔄 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Push successful!"
    echo ""
    echo "⏳ Render will auto-deploy in 2-3 minutes"
    echo ""
    echo "🌐 Your site: https://replai-xc95.onrender.com/admin"
    echo ""
    echo "📊 Watch deployment: https://dashboard.render.com"
    echo ""
    echo "🎨 Changes deployed:"
    echo "  - Removed purple gradients"
    echo "  - Added professional blue accent"
    echo "  - Platform colors (Instagram, WhatsApp, Telegram)"
    echo "  - Clean, professional design"
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "📝 To fix:"
    echo "1. Check your GitHub authentication"
    echo "2. Generate a token: https://github.com/settings/tokens"
    echo "3. Or use: gh auth login"
fi
