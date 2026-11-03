#!/bin/bash

# Push to GitHub using HTTPS with token
# This avoids SSH timeout issues

echo "🔄 Pushing to GitHub via HTTPS..."
echo ""
echo "📝 You'll need your GitHub Personal Access Token"
echo ""
echo "Don't have a token? Get one here:"
echo "https://github.com/settings/tokens"
echo ""
echo "Scopes needed: 'repo'"
echo ""
echo "When prompted:"
echo "  Username: orozbekovaktan4-spec"
echo "  Password: [paste your token]"
echo ""

cd /Users/ak/replai
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Pushed to GitHub"
    echo ""
    echo "⏳ Render is deploying now (2-3 minutes)..."
    echo ""
    echo "🌐 Check your site: https://replai-xc95.onrender.com/admin"
    echo "📊 Watch deployment: https://dashboard.render.com"
else
    echo ""
    echo "❌ Push failed"
    echo ""
    echo "💡 Try this instead:"
    echo "gh auth login"
    echo "git push origin main"
fi
