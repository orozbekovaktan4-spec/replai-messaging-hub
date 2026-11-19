#!/bin/bash
# Claude Code Screen Session Setup
# Creates a detached screen session running Claude Code with proper environment

set -e

SESSION_NAME="claude-code-main"
OUTPUT_DIR="/tmp"
HARDCOPY_FILE="$OUTPUT_DIR/claude-output.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Claude Code Screen Setup${NC}"
echo "Session name: $SESSION_NAME"
echo ""

# Kill existing session if it exists
if screen -list | grep -q "$SESSION_NAME"; then
    echo -e "${YELLOW}Killing existing session...${NC}"
    screen -S "$SESSION_NAME" -X quit 2>/dev/null || true
    sleep 1
fi

# Verify screen is available
if ! command -v screen &> /dev/null; then
    echo -e "${RED}ERROR: screen command not found${NC}"
    exit 1
fi

# Verify claude command is available
if ! command -v claude &> /dev/null; then
    echo -e "${RED}ERROR: claude command not found${NC}"
    exit 1
fi

# Create new screen session with Claude Code
echo -e "${GREEN}Starting Claude Code in screen session...${NC}"

# Start screen session in detached mode with proper environment
screen -dmS "$SESSION_NAME" bash -c "
    export CLAUDE_CONFIG_DIR=\"\$HOME/.claude-omniroute\"
    export ANTHROPIC_BASE_URL=\"http://localhost:20128\"
    export ANTHROPIC_AUTH_TOKEN=\"sk-94fb88271530e36c-9c929f-7ee0bd79\"
    export ANTHROPIC_API_KEY=\"\"
    export ANTHROPIC_MODEL=\"aktan\"
    claude
"

# Wait for session to start
sleep 2

# Verify session is running
if screen -list | grep -q "$SESSION_NAME"; then
    echo -e "${GREEN}✓ Session started successfully${NC}"
    echo ""
    echo "Session: $SESSION_NAME"
    echo ""
    echo "Commands:"
    echo "  Watch Claude:  screen -r $SESSION_NAME"
    echo "  Detach:        Ctrl+A, then D"
    echo "  Send prompt:   ./scripts/claude-bridge.sh \"your prompt\""
    echo ""
    screen -list | grep "$SESSION_NAME"
    exit 0
else
    echo -e "${RED}✗ Failed to start session${NC}"
    exit 1
fi
