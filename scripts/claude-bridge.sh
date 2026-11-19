#!/bin/bash
# Claude Code Bridge - Send prompts to Claude Code in screen session

set -e

SESSION_NAME="claude-code-main"
OUTPUT_DIR="/tmp"
HARDCOPY_FILE="$OUTPUT_DIR/claude-output.txt"
DEFAULT_TIMEOUT=5

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Parse arguments
PROMPT="$1"
TIMEOUT="${2:-$DEFAULT_TIMEOUT}"

if [ -z "$PROMPT" ]; then
    echo -e "${RED}ERROR: No prompt provided${NC}"
    echo "Usage: $0 \"your prompt\" [timeout_seconds]"
    echo "Example: $0 \"What is 2+2?\" 5"
    exit 1
fi

# Check if session exists
if ! screen -list | grep -q "$SESSION_NAME"; then
    echo -e "${RED}ERROR: Screen session '$SESSION_NAME' not found${NC}"
    echo "Run ./scripts/claude-screen-setup.sh first"
    exit 1
fi

# Send prompt to Claude (using $'\015' for Enter key)
echo -e "${YELLOW}Sending prompt to Claude...${NC}"
screen -S "$SESSION_NAME" -X stuff "$PROMPT"$'\015'

# Wait for response
echo -e "${YELLOW}Waiting ${TIMEOUT}s for response...${NC}"
sleep "$TIMEOUT"

# Capture output
screen -S "$SESSION_NAME" -X hardcopy "$HARDCOPY_FILE"

if [ ! -f "$HARDCOPY_FILE" ]; then
    echo -e "${RED}ERROR: Failed to capture output${NC}"
    exit 1
fi

# Display output (last 30 lines to show context)
echo ""
echo -e "${GREEN}=== Claude Code Output ===${NC}"
tail -30 "$HARDCOPY_FILE"
echo -e "${GREEN}=== End Output ===${NC}"
echo ""

# Return success
exit 0
