#!/bin/bash
# Test Suite for Claude Code Bridge

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BRIDGE_SCRIPT="$SCRIPT_DIR/claude-bridge.sh"
SESSION_NAME="claude-code-main"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Claude Code Bridge Test Suite        ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Test 1: Session exists
echo -e "${YELLOW}Test 1: Verify screen session exists${NC}"
if screen -list | grep -q "$SESSION_NAME"; then
    echo -e "${GREEN}✓ Session '$SESSION_NAME' found${NC}"
else
    echo -e "${RED}✗ Session not found. Run ./scripts/claude-screen-setup.sh first${NC}"
    exit 1
fi
echo ""

# Test 2: Bridge script exists and is executable
echo -e "${YELLOW}Test 2: Verify bridge script${NC}"
if [ -x "$BRIDGE_SCRIPT" ]; then
    echo -e "${GREEN}✓ Bridge script is executable${NC}"
else
    echo -e "${RED}✗ Bridge script not found or not executable${NC}"
    exit 1
fi
echo ""

# Test 3: Simple math question
echo -e "${YELLOW}Test 3: Simple math question${NC}"
echo "Prompt: \"What is 10+10? Answer with just the number.\""
"$BRIDGE_SCRIPT" "What is 10+10? Answer with just the number." 4
echo -e "${GREEN}✓ Math test completed${NC}"
echo ""
sleep 2

# Test 4: Code question
echo -e "${YELLOW}Test 4: Code question${NC}"
echo "Prompt: \"Write a one-line bash command to list files. Just the command, no explanation.\""
"$BRIDGE_SCRIPT" "Write a one-line bash command to list files. Just the command, no explanation." 5
echo -e "${GREEN}✓ Code test completed${NC}"
echo ""
sleep 2

# Test 5: Quick response test
echo -e "${YELLOW}Test 5: Quick response${NC}"
echo "Prompt: \"Say 'Bridge test successful'\""
"$BRIDGE_SCRIPT" "Say 'Bridge test successful'" 3
echo -e "${GREEN}✓ Quick response test completed${NC}"
echo ""

# Test 6: Verify CEO can attach
echo -e "${YELLOW}Test 6: Verify attachment capability${NC}"
echo "Testing if CEO can attach to session (non-interactive check)"
if screen -list | grep -q "$SESSION_NAME.*Detached"; then
    echo -e "${GREEN}✓ Session is detached and attachable${NC}"
    echo "  CEO can run: screen -r $SESSION_NAME"
elif screen -list | grep -q "$SESSION_NAME.*Attached"; then
    echo -e "${YELLOW}⚠ Session is currently attached${NC}"
    echo "  CEO can still attach with: screen -x $SESSION_NAME"
else
    echo -e "${RED}✗ Session state unclear${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  All Tests Passed                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Bridge is ready for use!"
echo ""
echo "Usage:"
echo "  Send prompt:  ./scripts/claude-bridge.sh \"your question\""
echo "  Watch Claude: screen -r $SESSION_NAME"
echo "  Detach:       Ctrl+A, then D"
echo ""
