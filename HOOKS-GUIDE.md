# Hooks Guide for REPLAI

**Hooks** = Automated gates that fire at lifecycle points in Claude Code

## Current Hooks

### 1. Lint Gate (.kiro/hooks/lint-gate.json)

**When it fires:** Before any commit

**What it does:** Checks JavaScript syntax
```bash
node -c server-new.js  # Check server syntax
node -c ai-engine-free.js  # Check AI engine syntax
```

**Behavior:**
- If syntax valid → Commit proceeds ✅
- If syntax broken → Commit blocked ❌

**Why it matters:** Prevents syntax errors from reaching production

---

### 2. Security Gate (.kiro/hooks/security-gate.json)

**When it fires:** After saving any .js, .html, or .json file

**What it does:** Scans for secrets
```bash
grep -E "(AKIA|sk_live_|password.*=|API_KEY.*=)" file.js
```

**Blocks if finds:**
- AWS credentials (AKIA...)
- Stripe secret keys (sk_live_...)
- API keys in plain text
- Passwords hardcoded

**Behavior:**
- Clean file → Saved ✅
- Secrets found → Blocked ❌

**Why it matters:** Prevents accidentally committing credentials

---

## How Hooks Work

### Hook Lifecycle

```
You: edit file
  ↓
Hook trigger fires (PostFileSave, PreCommit, etc)
  ↓
Hook runs command/agent
  ↓
Hook returns exit code:
  - 0 = success, proceed
  - 2 = blocked, stop
  - other = warning, continue
  ↓
Your action continues or stops
```

### Exit Codes

- **0 = Success** - Operation proceeds
- **2 = Blocked** - Operation stops (user must fix)
- **Non-zero (other)** - Warning, continue anyway

---

## Available Hook Triggers

| Trigger | When | Use For |
|---------|------|---------|
| **PreCommit** | Before git commit | Syntax check, tests |
| **PostFileSave** | After file saved | Linting, security scan |
| **PreToolUse** | Before tool called | Permission checks |
| **SessionStart** | Session begins | Initialization |
| **UserPromptSubmit** | Before message sent | Input validation |

---

## Hook Examples You Could Add

### Example 1: Block Commits if Tests Fail
```json
{
  "name": "Test Gate",
  "trigger": "PreCommit",
  "action": {
    "type": "command",
    "command": "npm test -- --run 2>/dev/null && echo 'Tests passed' || exit 2"
  }
}
```

**Effect:** Tests must pass before committing

---

### Example 2: Auto-Format on Save
```json
{
  "name": "Auto Format",
  "trigger": "PostFileSave",
  "matcher": "\\.js$",
  "action": {
    "type": "command",
    "command": "npx prettier --write \"$1\" 2>/dev/null"
  }
}
```

**Effect:** All .js files auto-formatted when saved

---

### Example 3: Permission Gate
```json
{
  "name": "Production Deploy Guard",
  "trigger": "PreToolUse",
  "matcher": "deploy.*production",
  "action": {
    "type": "agent",
    "prompt": "Before deploying to production, verify: (1) All tests pass, (2) No secrets in code, (3) Backwards compatible. Only approve if all true."
  }
}
```

**Effect:** AI reviews deployment safety before deploying

---

## When to Use Hooks

**Use hooks for:**
- ✅ Enforcement (blocks that must always run)
- ✅ Security gates (block secrets, suspicious changes)
- ✅ Quality gates (tests, linting, type checks)
- ✅ Automated cleanup (formatting, dependency updates)

**Don't use hooks for:**
- ❌ Business logic (use normal code)
- ❌ Complex decisions (use plan mode)
- ❌ Optional checks (use skills/CLAUDE.md)

---

## Hook Best Practices

1. **Keep hooks fast** - < 30 seconds per hook
2. **Provide clear errors** - User should know what to fix
3. **Make hooks reversible** - Don't auto-delete files
4. **Test hooks locally** first before committing hook file
5. **Document why** - Add comment in .kiro/hooks/

---

## Troubleshooting

### Hook not firing?
- Check trigger name (must match exactly)
- Check file path matcher (regex can be tricky)
- Verify hook .json syntax

### Hook breaking my workflow?
- You can disable temporarily by renaming .json → .json.bak
- Then fix the hook and rename back

### Hook running too slow?
- Optimize the command (avoid nested loops)
- Use parallel processing if possible
- Consider removing if it's not critical

---

## Future Hooks for REPLAI

Consider adding these over time:

1. **Flaky Test Detection** - Find and mark inconsistent tests
2. **Feature Flag Cleanup** - Warn when old flags released to everyone
3. **Database Schema Validation** - Ensure JSON stays valid
4. **API Contract Check** - Validate response shapes
5. **Deprecated Function Usage** - Warn when using old patterns

---

*Hooks are enforcement, not suggestions. Use them for hard gates only.*
