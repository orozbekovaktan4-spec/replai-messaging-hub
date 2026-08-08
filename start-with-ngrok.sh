#!/bin/bash

echo "════════════════════════════════════════════════════════════"
echo "  🚀 Starting REPLAI with ngrok (HTTPS tunnel)"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check if ngrok is running
if pgrep -x "ngrok" > /dev/null; then
    echo "⚠️  ngrok is already running. Stopping it..."
    pkill ngrok
    sleep 2
fi

# Start ngrok in the background
echo "📡 Starting ngrok tunnel on port 3000..."
ngrok http 3000 --log=stdout > ngrok.log &
NGROK_PID=$!

echo "⏳ Waiting for ngrok to start..."
sleep 3

# Get the ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok-free\.app')

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL. Check if ngrok is running."
    echo "   Try running manually: ngrok http 3000"
    exit 1
fi

echo ""
echo "✅ ngrok tunnel created!"
echo "   Public URL: $NGROK_URL"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  📋 UPDATE YOUR INSTAGRAM APP SETTINGS"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "1. Go to your app's Instagram product settings in Meta Dashboard"
echo ""
echo "2. Add this redirect URI:"
echo "   ${NGROK_URL}/api/admin/instagram/oauth/callback"
echo ""
echo "3. Save the change"
echo ""
echo "4. Update your .env file:"
echo "   INSTAGRAM_REDIRECT_URI=${NGROK_URL}/api/admin/instagram/oauth/callback"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Press Ctrl+C to stop ngrok when done"
echo ""

# Keep the script running
tail -f ngrok.log
