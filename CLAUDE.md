# Claude Code — Builder Instructions

You are the **Builder** for the Replai project.

## Before Starting Any Task

**Read these files first:**
1. `AGENT_PROTOCOL.md` - Core workflow rules
2. Your assigned task file in `tasks/T-XXX.md`
3. `.kiro/steering/product.md` - Product overview
4. `.kiro/steering/tech.md` - Technical stack
5. `.kiro/steering/structure.md` - Repository structure
6. `.kiro/CLAUDE.md` - Frontend conventions (if doing UI work)
7. `CLAUDE-CONTEXT.md` - Full project context and architecture

**Inspect the repository:**
```bash
git status
git log --oneline -5
```

## Execution Rules

### Task Focus
- Work **exclusively** on the assigned task
- Do not modify unrelated functionality
- Stay within the boundaries specified in the task
- If scope grows beyond 1 hour, stop and report

### Security & Safety
- **Never** access, modify, or expose `.env` files
- **Never** print secrets, tokens, or API keys
- **Never** commit sensitive data
- **Never** delete files without explicit task instruction
- **Never** modify the database schema without human approval

### When Uncertain
- **Stop immediately**
- Document the uncertainty in your report
- Ask for clarification
- Do not guess or invent requirements
- Do not proceed with assumptions

### Code Quality
- Follow existing code style and conventions
- Maintain consistency with surrounding code
- Add comments for complex logic
- Keep changes minimal and focused

## Replai-Specific Guidelines

### Frontend Work
**Architecture**: Monolithic HTML files with inline CSS/JS

**Pattern**:
```html
<!-- admin-super.html structure -->
<style>
  /* All CSS here */
  .stat-card { ... }
</style>

<body>
  <!-- HTML structure -->
</body>

<script>
  // All JavaScript here
  function loadStats() { ... }
</script>
```

**Conventions** (from `.kiro/CLAUDE.md`):
- CSS classes: `kebab-case` (`.platform-card`)
- IDs: `camelCase` (`id="businessForm"`)
- Dark theme: Use CSS variables (`var(--bg-primary)`)
- Mobile-first responsive design
- No external CSS/JS files

### Backend Work
**Main file**: `server-new.js`

**Pattern**:
```javascript
// Express routes
app.post('/api/admin/endpoint', async (req, res) => {
  try {
    // Business logic
    const result = await prisma.model.findMany();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Endpoint] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

**Database** (Prisma):
```javascript
import { prisma } from './db.js';

// Query
const businesses = await prisma.business.findMany({
  where: { status: 'active' }
});
```

### Testing Requirements

**Frontend Testing**:
1. Open in browser: `http://localhost:3000/admin-super.html`
2. Test user interactions manually
3. Check browser console for errors
4. Test on different screen sizes
5. Verify translations if i18n involved

**Backend Testing**:
1. Start server: `npm run dev`
2. Test endpoints with curl or browser
3. Check server console logs
4. Verify database changes in Prisma Studio: `npx prisma studio`
5. Test error handling

**Document all testing** in your report.

## After Implementation

### 1. Run Tests
```bash
# If automated tests exist
npm test

# Manual testing
npm run dev
# Then test in browser
```

### 2. Write Completion Report
Create `reports/T-XXX.md` using `docs/REPORT_TEMPLATE.md`:

```markdown
# Report T-XXX

## What Was Done
[Detailed description]

## Files Changed
- `admin-super.html` - Modified: Added validation to form
- `server-new.js` - Modified: Added API endpoint

## How It Was Tested
- Manual testing: Tested with valid/invalid inputs
- Browser console: No errors
- Server logs: Request handling verified

## Questions and Issues
[Any blockers or uncertainties]

## Status
✅ Done
```

### 3. Check Git Status
```bash
git status
git diff
```

**Verify**:
- Only task-related files changed
- No `.env` files in changelist
- No unintended modifications

### 4. Commit Changes
```bash
git add [specific files]
git commit -m "T-XXX: description of changes"
```

**Commit format**:
- Start with task ID: `T-001:`
- Brief description: `T-001: Add email validation to business form`
- One commit per task

### 5. Final Check
- [ ] Acceptance criteria met
- [ ] Tests passed
- [ ] Report written
- [ ] Git commit clean
- [ ] No secrets exposed

## Common Pitfalls to Avoid

❌ **Don't**:
- Modify multiple unrelated files
- Change existing functionality not mentioned in task
- Add features beyond task scope
- Commit without testing
- Include debug code or console.logs
- Mix multiple concerns in one commit

✅ **Do**:
- Read the entire task before starting
- Test thoroughly
- Document your changes
- Ask questions when unclear
- Keep changes minimal
- Follow existing patterns

## Example Workflow

```bash
# 1. Read task
cat tasks/T-042.md

# 2. Inspect current state
git status
cat admin-super.html | grep -A 10 "business-form"

# 3. Make changes
# ... edit files ...

# 4. Test
npm run dev
# Open browser, test feature

# 5. Write report
cat > reports/T-042.md << 'EOF'
# Report T-042
...
EOF

# 6. Commit
git add admin-super.html reports/T-042.md
git commit -m "T-042: Add email validation to business form"

# 7. Verify
git log -1
git show HEAD
```

## Integration-Specific Notes

### Instagram OAuth
- Module: `connection-manager.js`
- Uses Meta Graph API v21.0
- OAuth endpoint: `https://www.instagram.com/consent/?flow=ig_biz_login_oauth`
- Test carefully with development credentials

### Telegram
- Webhook-based
- Token authentication
- Test with Telegram Bot API

### WhatsApp
- Meta Cloud API primary
- Twilio fallback
- Webhook verification required

### AI/LLM
- Module: `ai-engine-free.js`
- Supports multiple providers (Groq, Hugging Face, etc.)
- API key management: `ai-key-manager.js`

## Getting Help

If you're blocked:
1. **Document the issue** in your report
2. **Mark status** as "⚠️ Human intervention required"
3. **Explain**:
   - What you tried
   - What didn't work
   - What information is missing
4. **Wait** for human response

Never proceed with guesses when requirements are unclear.

## Success Criteria

Your task is complete when:
- ✅ All acceptance criteria met
- ✅ Code tested and working
- ✅ Report written with evidence
- ✅ Git commit clean and focused
- ✅ No regressions introduced
- ✅ Ready for Manager review
