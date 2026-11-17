# Agent Workflow Quick Start Guide

## 🎯 Overview

Replai now has a structured agent workflow infrastructure:
- **Kiro** = Manager (plans, assigns, reviews)
- **Claude Code** = Builder (executes, reports)

## 📁 Directory Structure

```
replai/
├── tasks/              # Manager creates task files here
├── reports/            # Builder writes completion reports here
├── docs/               # Templates and shared docs
├── .kiro/steering/     # Agent steering documentation
├── AGENT_PROTOCOL.md   # Core workflow rules
└── CLAUDE.md          # Builder instructions
```

## 🚀 Quick Start

### For Kiro (Manager)

**1. Read the steering docs:**
```bash
cat .kiro/steering/product.md
cat .kiro/steering/tech.md
cat .kiro/steering/structure.md
cat .kiro/steering/agent-manager.md
```

**2. Create a task:**
```bash
# Copy template
cp docs/TASK_TEMPLATE.md tasks/T-001.md

# Edit with:
# - Clear goal
# - File references
# - Implementation steps
# - Boundaries
# - Acceptance criteria
```

**3. Assign to Builder:**
Share `tasks/T-001.md` with Claude Code

**4. Review the report:**
```bash
cat reports/T-001.md
git log -1  # Check commit
```

### For Claude Code (Builder)

**1. Read your instructions:**
```bash
cat AGENT_PROTOCOL.md
cat CLAUDE.md
cat tasks/T-XXX.md
```

**2. Execute the task:**
```bash
# Make changes
# Test thoroughly
npm run dev
```

**3. Write report:**
```bash
# Use template
cp docs/REPORT_TEMPLATE.md reports/T-XXX.md
# Fill in details
```

**4. Commit:**
```bash
git add [changed files] reports/T-XXX.md
git commit -m "T-XXX: description"
```

## 📋 First Task: T-000

A test task is ready to verify the workflow:

**Location**: `tasks/T-000.md`

**Goal**: Create `docs/hello.md` with verification text

**For Claude Code to execute:**
```bash
cd /Users/ak/replai
git checkout agents-setup
cat tasks/T-000.md
# Follow the instructions in the task
```

## 🔑 Key Rules

1. **One task = one deliverable** (max 1 hour)
2. **Never touch `.env` files**
3. **Ask human before**:
   - Deleting files
   - Modifying database
   - Changing auth
4. **Always test** before committing
5. **Write clear reports** with evidence

## 📖 Important Files

- `AGENT_PROTOCOL.md` - Rules everyone follows
- `CLAUDE.md` - Builder instructions
- `.kiro/steering/agent-manager.md` - Manager instructions
- `docs/TASK_TEMPLATE.md` - How to write tasks
- `docs/REPORT_TEMPLATE.md` - How to write reports

## 🎓 Example Task Flow

```
1. Manager: Create tasks/T-042.md
   "Add email validation to business form"

2. Builder: Read task, implement changes

3. Builder: Test in browser
   npm run dev
   # Test validation

4. Builder: Write reports/T-042.md
   Document what was done, how tested

5. Builder: Commit
   git commit -m "T-042: Add email validation to business form"

6. Manager: Review report
   cat reports/T-042.md
   # Check acceptance criteria met

7. Manager: Mark complete or request changes
```

## 🔄 Workflow States

**Task States:**
- 📝 **Created** - In `tasks/`, not yet assigned
- 🏗️ **In Progress** - Builder working on it
- ✅ **Complete** - Report written, criteria met
- ⚠️ **Blocked** - Needs human intervention

**Report Status:**
- ✅ **Done** - All criteria met, ready for review
- ⚠️ **Human intervention required** - Blocked, needs help

## 🛡️ Safety Features

- Separate branch: `agents-setup`
- Git commit per task: `T-XXX: description`
- No secrets in commits
- Human approval for destructive operations
- Task boundaries enforce focus

## 📞 Getting Help

**Manager blocked?** Review `.kiro/steering/agent-manager.md`

**Builder blocked?** Add to report, ask human

**Protocol unclear?** Check `AGENT_PROTOCOL.md`

---

**Status**: Infrastructure ready ✅

**Next**: Execute T-000 to verify workflow

**Branch**: `agents-setup`
