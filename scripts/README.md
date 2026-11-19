# Claude Code Bridge Scripts

Quick reference for the Claude Code terminal bridge system.

## Quick Start

```bash
# 1. Start Claude Code in screen session
./scripts/claude-screen-setup.sh

# 2. Send a prompt
./scripts/claude-bridge.sh "What is 2+2?" 5

# 3. Watch Claude work (optional)
screen -r claude-code-main
# Press Ctrl+A then D to detach

# 4. Run tests
./scripts/test-claude-bridge.sh
```

## Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `claude-screen-setup.sh` | Start Claude in screen | `./scripts/claude-screen-setup.sh` |
| `claude-bridge.sh` | Send prompts to Claude | `./scripts/claude-bridge.sh "prompt" [timeout]` |
| `test-claude-bridge.sh` | Run test suite | `./scripts/test-claude-bridge.sh` |

## Common Commands

```bash
# Check if session is running
screen -list | grep claude-code-main

# Send a prompt with 10 second timeout
./scripts/claude-bridge.sh "Explain async/await" 10

# Watch Claude work in real-time
screen -r claude-code-main

# Kill the session
screen -S claude-code-main -X quit

# Restart everything
./scripts/claude-screen-setup.sh
```

## Documentation

See `docs/CLAUDE-BRIDGE-USAGE.md` for complete documentation.

## Environment

The session runs with these variables:
- `CLAUDE_CONFIG_DIR="$HOME/.claude-omniroute"`
- `ANTHROPIC_BASE_URL="http://localhost:20128"`
- `ANTHROPIC_AUTH_TOKEN="sk-94fb88271530e36c-9c929f-7ee0bd79"`
- `ANTHROPIC_API_KEY=""`
- `ANTHROPIC_MODEL="aktan"`

## Troubleshooting

```bash
# Session not found?
./scripts/claude-screen-setup.sh

# Not responding?
screen -r claude-code-main  # Check what's happening
# Ctrl+A, D to detach

# Multiple sessions?
screen -list | grep claude
screen -S <session-id> -X quit  # Kill specific one
```
