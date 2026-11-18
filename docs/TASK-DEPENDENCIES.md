# Task Dependencies and Workflow

## Current Task Status

| Task ID | Title | Type | Status | Depends On | Assigned To |
|---------|-------|------|--------|------------|-------------|
| T-000 | Agent Workflow Setup Verification | Verification | ✅ COMPLETE | None | Claude Code |
| T-001 | Telegram Integration Investigation | Investigation | ⏸️ READY | None | Awaiting approval |
| T-002 | Fix Telegram Connection State | Implementation | 🚫 BLOCKED | T-001 | TBD |

---

## Task Dependency Chain

```
T-001 (Investigation)
  ↓
  [Manager Reviews Findings]
  ↓
  [Manager Updates T-002 Scope]
  ↓
T-002 (Implementation)
  ↓
  [Human Verification]
  ↓
  [Production Deployment]
```

---

## T-001: Investigation Task

**Type**: READ-ONLY investigation  
**Duration**: 60 minutes  
**Output**: Investigation report in `reports/T-001.md`

### Scope
- ✅ Trace both connection state systems
- ✅ Document message flow architecture
- ✅ Analyze admin connection flow
- ✅ Identify root cause of state discrepancy
- ✅ Provide recommendations for T-002

### Constraints
- ❌ NO code modifications
- ❌ NO `.env` changes
- ❌ NO `connections.json` manual edits
- ❌ NO external API calls
- ❌ NO testing with compromised token

### Deliverables
1. Architecture documentation (both state systems)
2. Complete message flow diagram
3. Root cause analysis
4. Specific recommendations for T-002
5. Human verification requirements

### Success Criteria
- Both state systems fully documented
- Message flow traced end-to-end
- Root cause identified with evidence
- Clear recommendations provided
- Honest about what's unknown

---

## T-002: Implementation Task

**Type**: CODE MODIFICATION  
**Duration**: 60 minutes  
**Output**: Fixed code + implementation report

### Current Status
🚫 **BLOCKED** - Cannot start until:
1. ✅ T-001 investigation complete
2. ✅ Manager reviews T-001 report
3. ✅ Manager confirms/updates T-002 scope
4. ✅ Manager explicitly assigns T-002

### Provisional Scope
Based on Manager's initial investigation (subject to change after T-001):

1. **Connection State Synchronization**
   - Fix: Connect/disconnect endpoints update both states
   - Files: `server-new.js`
   - Risk: Low (targeted fix)

2. **Webhook Verification Endpoint**
   - Fix: Add `GET /api/telegram/webhook-info`
   - Files: `server-new.js`
   - Risk: Low (new endpoint, no existing logic changed)

3. **Additional Fixes**
   - TBD based on T-001 findings

### Constraints
- ❌ NO `.env` modifications
- ❌ NO database schema changes
- ❌ NO webhook handler rewrite
- ❌ NO secret exposure
- ✅ MUST maintain backward compatibility

### Deliverables
1. Fixed connection/disconnect endpoints
2. New webhook info endpoint
3. Human verification guide
4. Implementation report

### Success Criteria
- Connection state synchronized
- Webhook verification works
- Local testing passes
- No secrets exposed
- Backward compatible

---

## Why This Split?

### Original Problem
Manager initially created T-001 as "debug and verify" which mixed:
- Investigation (read-only analysis)
- Implementation (code modifications)
- Testing (requires human + production)

This violated single-responsibility principle for tasks.

### Corrected Approach

**T-001 = INVESTIGATE**
- Builder reads and analyzes code
- No modifications
- Output: Knowledge and recommendations

**T-002 = IMPLEMENT**
- Builder applies fixes from T-001 findings
- Modifies code
- Output: Working solution

**Human = VERIFY**
- Rotates bot token
- Tests in production
- Confirms message flow

### Benefits

1. **Clear boundaries**: Each task has one job
2. **Proper review**: Manager reviews investigation before approving implementation
3. **Scope control**: Implementation scope derived from investigation findings
4. **Risk management**: Can assess risks before committing to fixes
5. **Task tracking**: Can measure investigation vs implementation separately

---

## Workflow Example

### Step 1: T-001 Investigation (Builder)

**Input**: Current codebase  
**Process**: Read, trace, analyze, document  
**Output**: `reports/T-001.md`

**Example findings:**
```markdown
## Root Cause
Connection state is not synchronized because:
1. Connect endpoint updates connections.json (line 2271)
2. Connect endpoint does NOT update platformConnections
3. Server reads platformConnections from .env on startup
4. Result: Persistent says false, memory says true

## Recommendations for T-002
Fix 1: Update connect endpoint to sync both states
Fix 2: Add webhook status endpoint
Fix 3: Ensure disconnect clears both states
```

### Step 2: Manager Review

**Input**: `reports/T-001.md`  
**Process**: Verify findings, assess recommendations  
**Decision**: Approve/modify/reject T-002 scope

**Example review:**
```markdown
T-001 findings verified ✅
- Root cause correct
- Recommendations sound
- Implementation approach reasonable

T-002 scope approved:
- Fix 1: Approved (low risk)
- Fix 2: Approved (low risk)
- Fix 3: Approved (low risk)

Estimated time: 60 minutes ✅
Risk level: LOW ✅

Proceed with T-002 as specified.
```

### Step 3: T-002 Implementation (Builder)

**Input**: T-001 recommendations + Manager approval  
**Process**: Implement fixes, test locally, document  
**Output**: Fixed code + `reports/T-002.md`

**Example changes:**
```javascript
// server-new.js line 2271
// OLD: Only updates connections.json
const connectionState = await connector.connect(token);

// NEW: Updates both states
const connectionState = await connector.connect(token);
platformConnections.telegram = {
  connected: true,
  token: token,
  botUsername: connectionState.metadata.botUsername
};
```

### Step 4: Human Verification

**Input**: T-002 completion report  
**Process**: Follow verification guide  
**Output**: Production confirmation

**Example verification:**
1. Rotate token via @BotFather ✅
2. Connect in admin UI ✅
3. Check webhook status: registered ✅
4. Send test message ✅
5. Receive AI response ✅
6. Verify both states show connected ✅

---

## Dependencies Between Tasks

### T-001 → T-002

**T-002 depends on T-001 for:**
- Root cause identification
- Specific fix recommendations
- Implementation approach
- Risk assessment
- File:line references for changes

**T-002 cannot start without T-001 because:**
- Don't know exact problem yet (hypothesis vs confirmed)
- Don't know if additional issues exist
- Don't know optimal fix approach
- Might discover T-001 finds a different problem

### T-002 → Human Verification

**Human verification depends on T-002 for:**
- Fixed connection logic
- Webhook verification endpoint
- Verification guide
- Known remaining issues

**Human cannot verify without T-002 because:**
- Connection state sync is broken
- No way to check webhook status
- No clear verification steps
- Unclear what "working" means

---

## Task Management Principles

### Single Responsibility
- One task = one type of work
- Investigation ≠ Implementation
- Implementation ≠ Verification

### Clear Dependencies
- Tasks explicitly state blockers
- Cannot start blocked task
- Manager controls unblocking

### Proper Review Gates
- Investigation reviewed before implementation approved
- Implementation reviewed before deployment approved
- Human verification before "done" declared

### Honest Status
- "BLOCKED" means cannot start
- "READY" means approved and can be assigned
- "COMPLETE" means acceptance criteria met + reviewed

---

## Current State Summary

### What's Complete
- ✅ T-000: Agent workflow verified (PASS)
- ✅ Manager investigation: Dual-state problem identified
- ✅ T-001 task: Created, ready for assignment
- ✅ T-002 task: Created, blocked on T-001

### What's Pending
- ⏸️ T-001 assignment: Awaiting human approval
- ⏸️ T-002 scope confirmation: After T-001 complete
- ⏸️ T-002 assignment: After Manager review

### What's Required (Human)
- Approve T-001 investigation task
- Wait for T-001 completion
- Review T-001 findings
- Approve T-002 scope
- Assign T-002 to Builder
- After T-002: Perform production verification

---

## Next Actions

### Immediate (Awaiting Human)
1. **Review T-001 task specification**
   - Is scope clear?
   - Are constraints acceptable?
   - Is 60-minute estimate reasonable?

2. **Approve or modify T-001**
   - If approved: "Assign T-001 to Claude Code"
   - If changes needed: Specify modifications

### After T-001 Complete
1. **Manager reviews** `reports/T-001.md`
2. **Manager updates** T-002 scope based on findings
3. **Manager approves** T-002 implementation
4. **Manager assigns** T-002 to Claude Code

### After T-002 Complete
1. **Human reviews** `reports/T-002.md`
2. **Human follows** verification guide
3. **Human confirms** Telegram works in production
4. **Human approves** deployment (if not already deployed)

---

## Questions for Human

### About T-001
- Is read-only investigation approach acceptable?
- Is 60-minute time budget reasonable for investigation?
- Any specific aspects you want investigated beyond current scope?

### About T-002
- Should T-002 scope be strictly limited to T-001 recommendations?
- Or can Builder implement related improvements if found during T-001?
- What's the risk tolerance for T-002 changes?

### About Workflow
- Is this investigation → review → implementation → verify workflow acceptable?
- Should Manager create more granular tasks (e.g., separate webhook endpoint into T-003)?
- How should urgent production issues be handled in this workflow?

---

## Success Metrics

### For T-001
- ✅ Complete architecture understanding
- ✅ Root cause identified with evidence
- ✅ Actionable recommendations provided
- ✅ Completed within 60 minutes

### For T-002
- ✅ All T-001 recommendations implemented
- ✅ Local testing passes
- ✅ No regressions introduced
- ✅ Completed within 60 minutes

### For Overall Process
- ✅ Telegram connection state synchronized
- ✅ Webhook verification possible
- ✅ Human can verify production works
- ✅ No secrets exposed
- ✅ Backward compatible

---

**Status**: Tasks separated, dependencies clear, awaiting human approval for T-001
