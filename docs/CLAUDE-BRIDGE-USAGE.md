# Claude Code Terminal Bridge Usage Guide

## Overview

The Claude Code Bridge enables Kiro Manager to communicate with Claude Code running in a detached screen terminal session. This allows automated interaction while maintaining the ability for the CEO to watch Claude work in real-time.

## Architecture

```
Kiro Manager → claude-bridge.sh → screen session → Claude Code
                                         ↑
                                         └─ CEO can attach and watch
```

## Setup

### 1. Start the Screen Session

```bash
./scripts/claude-screen-setup.sh
```

This script:
- Kills any existing `claude-code-main` session
- Starts Claude Code in a new detached screen session
- Configures the correct environment variables:
  - `CLAUDE_CONFIG_DIR="$HOME/.claude-omniroute"`
  - `ANTHROPIC_BASE_URL="http://localhost:20128"`
  - `ANTHROPIC_AUTH_TOKEN="sk-94fb88271530e36c-9c929f-7ee0bd79"`
  - `ANTHROPIC_API_KEY=""`
  - `ANTHROPIC_MODEL="aktan"`
- Verifies the session started successfully

Expected output:
```
Claude Code Screen Setup
Session name: claude-code-main

Starting Claude Code in screen session...
✓ Session started successfully

Session: claude-code-main

Commands:
  Watch Claude:  screen -r claude-code-main
  Detach:        Ctrl+A, then D
  Send prompt:   ./scripts/claude-bridge.sh "your prompt"
```

## Sending Prompts

### Basic Usage

```bash
./scripts/claude-bridge.sh "What is 2+2?"
```

### With Custom Timeout

```bash
./scripts/claude-bridge.sh "Explain async/await" 10
```

Default timeout: 5 seconds

### How It Works

1. Validates the screen session exists
2. Sends the prompt to Claude using `screen -X stuff`
3. Appends Enter key using `$'\015'`
4. Waits for the specified timeout
5. Captures output using `screen -X hardcopy`
6. Displays the last 30 lines of output

## Watching Claude Work

The CEO can attach to the screen session at any time to watch Claude Code in action.

### Attach to Session

```bash
screen -r claude-code-main
```

### Detach Without Stopping

Press: **Ctrl+A**, then **D**

This leaves Claude running in the background.

### Attach to Already-Attached Session

If someone is already watching:

```bash
screen -x claude-code-main
```

This creates a shared session (multi-display mode).

## Testing

Run the complete test suite:

```bash
./scripts/test-claude-bridge.sh
```

Tests performed:
1. ✓ Session existence check
2. ✓ Bridge script executable
3. ✓ Simple math question
4. ✓ Code question
5. ✓ Quick response test
6. ✓ CEO attachment capability

## Troubleshooting

### Session Not Found

**Error**: `Screen session 'claude-code-main' not found`

**Solution**:
```bash
./scripts/claude-screen-setup.sh
```

### No Response from Claude

**Possible causes**:
1. Timeout too short - increase timeout parameter
2. Claude is thinking - wait longer before checking
3. Session crashed - restart with setup script

**Debug**:
```bash
# Check if session is running
screen -list

# Manually check output
screen -S claude-code-main -X hardcopy /tmp/debug-output.txt
cat /tmp/debug-output.txt
```

### Multiple Sessions with Same Name

**Solution**:
```bash
# Kill all sessions with this name
screen -ls | grep claude-code-main | cut -d. -f1 | awk '{print $1}' | xargs -I {} screen -S {} -X quit

# Start fresh
./scripts/claude-screen-setup.sh
```

### Claude Not Responding to Prompts

**Check**:
1. Attach to session: `screen -r claude-code-main`
2. See if Claude is waiting for input
3. Check if there are any error messages
4. Detach: **Ctrl+A**, then **D**

### Output File Not Created

**Error**: `Failed to capture output`

**Causes**:
- `/tmp` directory not writable
- Screen session died

**Solution**:
```bash
# Check /tmp permissions
ls -ld /tmp

# Restart session
./scripts/claude-screen-setup.sh
```

## Technical Details

### Session Name
`claude-code-main`

### Output Location
`/tmp/claude-output.txt` (overwritten on each capture)

### Enter Key Encoding
The script uses `$'\015'` (carriage return) to send the Enter key to the screen session. This is the correct method for screen on macOS/Linux.

### Environment Variables
The session is started with these specific variables to route Claude Code through the omniroute proxy:

```bash
CLAUDE_CONFIG_DIR="$HOME/.claude-omniroute"
ANTHROPIC_BASE_URL="http://localhost:20128"
ANTHROPIC_AUTH_TOKEN="sk-94fb88271530e36c-9c929f-7ee0bd79"
ANTHROPIC_API_KEY=""
ANTHROPIC_MODEL="aktan"
```

### Hardcopy Mechanism
Screen's `hardcopy` command dumps the current terminal buffer to a file. This captures whatever is visible in the terminal, including Claude's responses.

## Best Practices

1. **Always check session status** before sending prompts:
   ```bash
   screen -list | grep claude-code-main
   ```

2. **Use appropriate timeouts**:
   - Simple questions: 3-5 seconds
   - Complex code tasks: 10-15 seconds
   - Long-running operations: 30+ seconds

3. **Monitor the session** during critical operations:
   ```bash
   screen -r claude-code-main
   ```

4. **Restart periodically** to clear accumulated state:
   ```bash
   ./scripts/claude-screen-setup.sh
   ```

5. **Capture output immediately** if you need to preserve it:
   ```bash
   cp /tmp/claude-output.txt /path/to/preserve/output-$(date +%s).txt
   ```

## Integration with Kiro Manager

Kiro Manager can use the bridge like this:

```javascript
const { execSync } = require('child_process');

function askClaude(prompt, timeout = 5) {
    try {
        const output = execSync(
            `./scripts/claude-bridge.sh "${prompt}" ${timeout}`,
            { encoding: 'utf8' }
        );
        return output;
    } catch (error) {
        console.error('Claude bridge error:', error.message);
        throw error;
    }
}

// Usage
const response = askClaude("What is 2+2?", 5);
console.log(response);
```

## FAQ

**Q: Can multiple people watch the session simultaneously?**  
A: Yes, use `screen -x claude-code-main` for shared viewing.

**Q: What happens if I send a prompt while Claude is still thinking?**  
A: The new prompt will be queued. Claude will see it after finishing the current response.

**Q: Can I send multi-line prompts?**  
A: Yes, but use proper quoting:
```bash
./scripts/claude-bridge.sh "Line 1
Line 2
Line 3"
```

**Q: How do I know if Claude is done responding?**  
A: Check if the prompt indicator is visible in the captured output. If you see the waiting cursor, Claude is ready.

**Q: Can I stop Claude mid-response?**  
A: Yes, attach to the session (`screen -r claude-code-main`) and press Ctrl+C.

## File Locations

- Setup script: `scripts/claude-screen-setup.sh`
- Bridge script: `scripts/claude-bridge.sh`
- Test script: `scripts/test-claude-bridge.sh`
- Output file: `/tmp/claude-output.txt`
- Session name: `claude-code-main`

## Version History

- **v1.0** (2024-11-19): Initial implementation with working Enter key handling (`$'\015'`)
