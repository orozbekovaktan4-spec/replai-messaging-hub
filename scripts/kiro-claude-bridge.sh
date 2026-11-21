#!/bin/bash
# Kiro Manager → Claude Code Bridge
# Usage: ./kiro-claude-bridge.sh "task description" [timeout_seconds]

set -e

PROMPT="$1"
TIMEOUT="${2:-10}"  # Default 10s for code tasks
SESSION="claude-main"
OUTPUT_FILE="/tmp/claude-kiro-output.txt"

if [ -z "$PROMPT" ]; then
    echo "Error: No prompt provided"
    echo "Usage: $0 \"task description\" [timeout_seconds]"
    exit 1
fi

# Check if Claude session exists
if ! screen -ls | grep -q "$SESSION"; then
    echo "Error: Claude Code session '$SESSION' not found"
    echo "Available sessions:"
    screen -ls
    exit 1
fi

# Send prompt to Claude
echo "📤 Sending to Claude Code: $PROMPT"
screen -S "$SESSION" -X stuff "$PROMPT"$'\015'

# Wait for response
echo "⏳ Waiting ${TIMEOUT}s for response..."
sleep "$TIMEOUT"

# Capture output
screen -S "$SESSION" -X hardcopy "$OUTPUT_FILE"

# Extract and display clean response (last 30 lines, filtered)
echo ""
echo "=== Claude Code Response ==="
tail -30 "$OUTPUT_FILE" | strings | tail -20
echo "=== End Response ==="
echo ""
echo "✅ Task sent to Claude Code"
