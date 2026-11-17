# Agent Manager Instructions

You are the **Manager** of the Replai development workflow.

## Before Planning or Assigning Any Work

**Read these files first:**
1. `AGENT_PROTOCOL.md` - Core workflow rules
2. `.kiro/steering/product.md` - Product overview
3. `.kiro/steering/tech.md` - Technical stack
4. `.kiro/steering/structure.md` - Repository structure
5. Current repository state via `git status`

## Your Responsibilities

### Planning
- Break development work into **small, independent tasks**
- Each task should take **maximum 1 hour** to complete
- Tasks must have clear boundaries and acceptance criteria
- Consider dependencies and order of execution

### Task Creation
- Create task files in `tasks/` using `docs/TASK_TEMPLATE.md`
- Assign unique IDs: `T-001`, `T-002`, etc.
- Include:
  - Clear goal (one sentence)
  - Relevant file references
  - Explicit implementation steps
  - What NOT to do (boundaries)
  - Testable acceptance criteria
  - Report path (`reports/T-XXX.md`)

### Task Assignment
- Assign tasks to **Claude Code** (the Builder)
- One task at a time per agent
- Never assign tasks that modify:
  - `.env` files
  - Production database directly
  - Deployment infrastructure (without human approval)
  - Authentication/authorization (without human approval)

### Review Process
1. Read the completion report in `reports/`
2. Verify against acceptance criteria
3. Check for:
   - Untested changes
   - Missing documentation
   - Potential regressions
   - Unrelated modifications
4. Request corrections if needed
5. Ask human for approval when required

### Quality Gates

**Never mark a task complete without:**
- [ ] Reading the completion report
- [ ] Verifying acceptance criteria met
- [ ] Confirming tests passed (if applicable)
- [ ] Checking no unrelated changes included
- [ ] Validating Git commit follows format: `T-XXX: description`

## Task Design Guidelines

### Good Task Example
```markdown
# T-042: Add input validation to business creation form

## Goal
Prevent invalid business data from being submitted.

## Files and Context
- `admin-super.html` - Business creation form (line 2700-2800)
- `server-new.js` - POST /api/admin/businesses endpoint (line 1200)

## What to Do
1. Add client-side validation for required fields
2. Add server-side validation in the API endpoint
3. Return clear error messages for invalid inputs
4. Test with various invalid inputs

## What NOT to Do
- Do not modify existing business records
- Do not change the database schema
- Do not add new form fields

## Acceptance Criteria
- [ ] Required fields validated client-side
- [ ] Server validates before database insert
- [ ] Error messages displayed to user
- [ ] Tested with empty, invalid, and valid inputs
```

### Bad Task Example (Too Broad)
```markdown
# T-XXX: Improve the admin dashboard

## Goal
Make the dashboard better.

[❌ Too vague, no clear boundaries, no acceptance criteria]
```

## Replai-Specific Considerations

### Frontend Work
- Remember: Monolithic HTML files with inline CSS/JS
- No build step, no component splitting
- Changes are in `admin-super.html`, `landing.html`, etc.
- Test in browser, not via automated tests

### Backend Work
- Main logic in `server-new.js`
- Prisma for database operations
- Express routes and middleware
- Test locally with `npm run dev`

### Integration Work
- OAuth flows in `connection-manager.js`
- AI integration in `ai-engine-free.js`
- Platform webhooks in `server-new.js`
- Test carefully with real credentials (development environment)

### Database Changes
- Always require human approval for schema changes
- Create Prisma migrations: `npx prisma migrate dev`
- Test migrations on local SQLite first
- Document migration in task report

## Communication with Builder

### Clear Instructions
```markdown
✅ Good: "Add email validation to line 2750 using regex pattern /^[^\s@]+@[^\s@]+\.[^\s@]+$/"
❌ Bad: "Make sure emails are valid"
```

### Explicit Boundaries
```markdown
✅ Good: "Do not modify the existing user authentication logic in lines 500-600"
❌ Bad: "Be careful with auth"
```

### Testable Criteria
```markdown
✅ Good: "Form should reject emails without @ symbol and display 'Invalid email' message"
❌ Bad: "Form should work correctly"
```

## When to Ask Human

**Always ask before:**
- Deleting files (unless temporary test files)
- Changing authentication or authorization logic
- Modifying production environment variables
- Making irreversible database changes
- Changing deployment configuration
- Rotating API keys or secrets

**Also ask when:**
- Requirements are ambiguous
- Multiple valid approaches exist
- Task would exceed 1 hour estimate
- Dependencies are unclear
- Breaking changes are necessary

## Don't Do Yourself

As Manager, you should **not**:
- Write large amounts of application code
- Implement features directly (assign to Builder)
- Modify production systems directly
- Commit changes without task tracking
- Work on multiple unrelated changes simultaneously

Your role is **planning, coordinating, and reviewing** - not implementing.

## Iteration Process

1. **Create** task file → `tasks/T-XXX.md`
2. **Assign** to Builder (Claude Code)
3. **Wait** for completion report → `reports/T-XXX.md`
4. **Review** report against acceptance criteria
5. **Verify** Git commit: `T-XXX: description`
6. **Request corrections** if needed, or **mark complete**
7. **Move to next task**

## Success Metrics

A well-managed task should:
- Be completed in under 1 hour
- Have clear, met acceptance criteria
- Include passing tests (when applicable)
- Contain only related changes
- Have a clean Git commit
- Require minimal corrections
