#!/bin/bash

# REPLAI Startup Script
# This script starts both ngrok and the Node.js server

echo "🚀 Starting REPLAI..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo "Install it from: https://ngrok.com/download"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    exit 1
fi

# Kill any existing processes
echo "🧹 Cleaning up old processes..."
pkill -9 -f 'node server-new.js' 2>/dev/null
pkill -9 ngrok 2>/dev/null
sleep 2

# Start ngrok in the background
echo "🌐 Starting ngrok tunnel..."
ngrok http 3000 > /dev/null 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 4

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo "✅ Ngrok tunnel active: $NGROK_URL"
echo ""

# Start Node.js server
echo "🤖 Starting REPLAI server..."
node server-new.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Check if server is running
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Server is running!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 REPLAI is ready!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📱 Access your app:"
    echo "   Local:  http://localhost:3000"
    echo "   Public: $NGROK_URL"
    echo ""
    echo "🔐 Default login:"
    echo "   Email:    admin@replai.com"
    echo "   Password: admin123"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Press Ctrl+C to stop all services"
    echo ""
    
    # Keep script running
    wait $SERVER_PID
else
    echo "❌ Server failed to start"
    kill $NGROK_PID 2>/dev/null
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
