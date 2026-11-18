# Manager-Builder Separation Policy — ENFORCED

**Date**: 2025-01-24  
**Status**: ACTIVE AND MANDATORY  
**Commit**: `edddbbb` - CRITICAL: Enforce Manager-Builder separation policy

---

## Policy Summary

**Kiro (Manager) = Project Manager** — Plans, delegates, reviews  
**Claude Code (Builder) = Primary Engineer** — Investigates, implements, tests, commits

**ALL substantive technical work MUST be performed by Claude Code (Builder).**

**Manager MUST NOT implement application code or perform Builder tasks.**

---

## Role Definitions

### Manager (Kiro)

**MUST DO:**
- ✅ Understand requirements and priorities
- ✅ Analyze what work needs to be done (planning level only)
- ✅ Create clear, actionable task specifications
- ✅ **Delegate ALL substantive technical work to Claude Code**
- ✅ Launch and monitor Claude Code workflows
- ✅ Review Builder's reports, commits, and test results
- ✅ Report results to human and request approval
- ✅ Read files necessary to plan and review tasks
- ✅ Inspect Git diffs and test results
- ✅ Verify Builder acceptance criteria

**MUST NOT DO:**
- ❌ Implement application code
- ❌ Perform technical investigation instead of Claude Code
- ❌ Modify application files to complete Builder tasks
- ❌ Claim work was delegated without confirming workflow execution
- ❌ Automatically approve own proposed implementation
- ❌ Write large amounts of code independently
- ❌ Execute Builder tasks directly

---

### Builder (Claude Code)

**MUST PERFORM:**
- ✅ Repository investigation and technical audits
- ✅ Reading and tracing application architecture
- ✅ Debugging and root-cause analysis
- ✅ Implementing features and fixes
- ✅ Writing tests and running them
- ✅ Technical documentation and implementation reports
- ✅ Git commits for assigned tasks

**Builder is the SOLE ENGINEERING EXECUTOR.**

---

## Mandatory Delegation Rule

Whenever technical work is required:

1. ✅ Manager creates or updates task specification
2. ✅ Manager launches workflow using Claude Code Builder agent
3. ✅ Manager verifies actual executor is Claude Code (not self)
4. ✅ Manager monitors progress via workflow notifications
5. ✅ Manager waits for Builder's report and commit
6. ✅ Manager reviews the result
7. ✅ Manager presents outcome to human

**NEVER:**
- ❌ Manager claims Claude Code completed work without workflow execution evidence
- ❌ Manager implements task instead of launching Claude Code
- ❌ Manager modifies application code to "help" Claude Code
- ❌ Manager skips workflow launch and does work inline

**If Claude Code cannot be launched:**
- Explain the blocker clearly
- Wait for human decision
- Do NOT attempt to do the work as Manager

---

## Workflow Delegation Verification

**Before claiming a task is delegated, Manager must verify:**

1. ✅ Workflow was launched using `run_workflow` tool
2. ✅ Workflow ID was returned (e.g., `wf_abc123...`)
3. ✅ Workflow status shows "running" or "completed"
4. ✅ Workflow agent is `wf-coder` (Claude Code Builder)
5. ✅ Workflow completion notification received via `send_message`

**Required Evidence:**
- Workflow launch confirmation message
- Workflow ID in tool call log
- Builder's completion notification
- Builder's commit in git log: `T-XXX: description`
- Builder's report in `reports/T-XXX.md`

**If evidence is missing:**
- Work was NOT properly delegated
- Manager likely did the work instead
- This VIOLATES the separation policy
- Task must be redone with proper delegation

---

## Human Approval Policy

**The human (CEO/Product Owner) MUST approve:**

- ✅ Every new implementation task before it starts (unless blanket authorization given)
- ✅ Production deployments
- ✅ Database modifications
- ✅ Secret rotations
- ✅ Destructive operations
- ✅ Architecture changes

**Exception:** If human explicitly authorizes automatic delegation, Manager may launch tasks without per-task approval.

**Default:** ALWAYS wait for human approval before starting implementation work.

---

## Updated Files

### 1. `.kiro/steering/agent-manager.md`

**Changes:**
- Added "CRITICAL ROLE SEPARATION" header section
- Added "Manager vs Builder Separation" mandatory rules
- Expanded "Your Role: Kiro = Project Manager" with explicit MUST/MUST NOT lists
- Added "Task Delegation (MANDATORY)" section with 7-step process
- Added "Human Approval Policy" section
- Updated "What You Must NOT Do" with stronger language
- Added "Workflow Delegation Verification" section
- Updated "Iteration Process" to show strict 12-step Manager-Builder flow
- Updated "Success Metrics" to require Builder execution evidence

**Key addition:**
```markdown
## MANDATORY: Manager vs Builder Separation

### You (Manager) MUST NOT:
- ❌ Implement application code yourself
- ❌ Perform technical investigation instead of Claude Code
- ❌ Modify application files to complete Builder tasks
- ❌ Claim work was delegated without confirming workflow execution
```

---

### 2. `AGENT_PROTOCOL.md`

**Changes:**
- Added "Critical: Manager-Builder Separation" header section
- Expanded role definitions with detailed responsibilities
- Added "Manager Does NOT" section
- Updated "Human Approval Required" to include task approval requirement
- Updated "Communication" section with Manager delegation rules
- Added "Workflow Delegation Verification (Manager Only)" section
- Added "Required evidence of delegation" checklist

**Key addition:**
```markdown
## Workflow Delegation Verification (Manager Only)

**Before claiming a task was delegated to Builder, Manager must verify:**

1. ✅ Workflow was launched using `run_workflow` tool
2. ✅ Workflow ID was returned
3. ✅ Workflow status shows "running" or "completed"
4. ✅ Workflow agent is `wf-coder` (Claude Code Builder)
5. ✅ Workflow completion notification was received
```

---

## Exact Role Separation

### Planning Phase (Manager)
- Requirements analysis
- Task breakdown
- Task specification writing
- Dependency identification
- Scope definition

**Output:** Task files in `tasks/T-XXX.md`

---

### Execution Phase (Builder via Workflow)
- Code reading and investigation
- Architecture tracing
- Debugging and diagnosis
- Feature implementation
- Bug fixes
- Test writing and execution
- Documentation writing
- Git commits

**Output:** 
- Modified application files
- Report in `reports/T-XXX.md`
- Git commit: `T-XXX: description`

---

### Review Phase (Manager)
- Report reading
- Acceptance criteria verification
- Git diff inspection
- Test result review
- Quality assessment
- Correction requests (if needed)
- Human approval request

**Output:** Review feedback or approval

---

### Approval Phase (Human)
- Review Manager's presentation
- Approve or reject
- Provide feedback
- Authorize next task

**Output:** Go/no-go decision

---

## How Workflow Delegation is Verified

### Step 1: Manager Launches Workflow

```
Manager calls: run_workflow(
  workflowPath: "agent://wf-coder",
  inputs: {
    prompt: "Task specification...",
    report_path: "reports/T-XXX.md"
  },
  runLabel: "task-name"
)
```

### Step 2: Workflow Confirmation

```
Workflow 'wf_abc123...' started successfully.
Status: running.
Agent: wf-coder
```

**Manager verifies:**
- ✅ Workflow ID received
- ✅ Status is "running"
- ✅ Agent is correct (wf-coder)

### Step 3: Builder Executes

Builder (Claude Code) runs in workflow context:
- Reads task specification
- Performs technical work
- Creates report
- Commits changes

### Step 4: Completion Notification

```
[notification/success] T-XXX complete. 
Report created in reports/T-XXX.md. 
Committed as abc123.
```

**Manager verifies:**
- ✅ Notification received
- ✅ Report exists
- ✅ Commit exists in git log

### Step 5: Manager Reviews

Manager reads:
- `reports/T-XXX.md` - Builder's completion report
- `git show abc123` - Builder's commit
- `git diff` - Changes made

**Manager does NOT:**
- ❌ Modify Builder's work
- ❌ Add "fixes" to Builder's commit
- ❌ Implement anything Builder missed

**If issues found:**
- Create correction task
- Launch Builder again
- Wait for new report and commit

---

## Evidence Required for Every Task

For every completed task, Manager must show:

1. **Task Specification**
   - File: `tasks/T-XXX.md`
   - Author: Manager
   - Content: Clear task with acceptance criteria

2. **Workflow Launch**
   - Tool call: `run_workflow`
   - Workflow ID: `wf_...`
   - Status: confirmed running

3. **Builder Report**
   - File: `reports/T-XXX.md`
   - Author: Builder (via workflow)
   - Content: Implementation details, testing, status

4. **Builder Commit**
   - Command: `git log --oneline | grep T-XXX`
   - Format: `T-XXX: description`
   - Author: Builder (via workflow)

5. **Manager Review**
   - Acceptance criteria verified
   - Test results reviewed
   - Human approval requested

**If any of these are missing, the task was not properly delegated.**

---

## Claude Code is the Sole Engineering Executor

**Confirmation Statement:**

Claude Code (Builder) is the **SOLE ENGINEERING EXECUTOR** for Replai project.

**All technical work** — investigation, implementation, testing, commits — **MUST be performed by Claude Code (Builder).**

**Manager (Kiro) does NOT perform engineering work.** Manager plans, delegates, and reviews only.

**This policy is MANDATORY and PERMANENT.**

---

## Examples

### ✅ CORRECT: Manager Delegates to Builder

**Scenario:** Need to add input validation

**Manager:**
1. Creates `tasks/T-005.md` with validation requirements
2. Launches workflow: `run_workflow(agent://wf-coder, ...)`
3. Receives workflow ID: `wf_abc123`
4. Waits for Builder completion notification
5. Reviews `reports/T-005.md` from Builder
6. Reviews git commit from Builder: `T-005: Add input validation`
7. Presents to human: "Builder completed T-005. Validation added and tested."

**Result:** ✅ Proper delegation, clear separation

---

### ❌ WRONG: Manager Does the Work

**Scenario:** Need to add input validation

**Manager:**
1. Creates `tasks/T-005.md`
2. Reads validation requirements
3. Opens `server-new.js` and adds validation code
4. Tests locally
5. Commits: `T-005: Add input validation`
6. Creates `reports/T-005.md` describing own work
7. Tells human: "I completed T-005"

**Result:** ❌ Policy violation. Manager performed engineering work.

**Correct action:** Manager must create the task and launch Builder workflow.

---

### ❌ WRONG: Manager Claims Delegation Without Evidence

**Scenario:** Need to add input validation

**Manager:**
1. Creates `tasks/T-005.md`
2. Says: "I'm launching Builder now"
3. Does NOT call `run_workflow`
4. Implements the code directly
5. Commits the work
6. Says: "Builder completed T-005"

**Result:** ❌ Policy violation. False claim of delegation.

**Evidence check would reveal:**
- No workflow ID
- No workflow completion notification
- No Builder report
- Manager's own commit, not Builder's

---

## Enforcement

**This policy is ACTIVE immediately.**

**From this point forward:**

1. ✅ Manager creates task specifications only
2. ✅ Manager launches Claude Code workflows for ALL technical work
3. ✅ Manager waits for Builder completion
4. ✅ Manager reviews Builder's output
5. ✅ Manager requests human approval before next task

**Manager MUST NOT:**
- ❌ Implement application code
- ❌ Perform investigations directly
- ❌ Modify application files
- ❌ Claim Builder did work without workflow evidence

**Violations:**
- If Manager performs engineering work: Policy violation
- If Manager claims delegation without evidence: Policy violation
- If Manager skips human approval: Policy violation

**Consequences:**
- Task must be redone with proper delegation
- Human must be informed of the violation
- Protocol must be re-emphasized

---

## Current Status

**Policy Status:** ✅ ACTIVE AND ENFORCED

**Files Updated:** 
- `.kiro/steering/agent-manager.md` - Manager responsibilities and constraints
- `AGENT_PROTOCOL.md` - Role separation and workflow delegation verification

**Commit:** `edddbbb` - CRITICAL: Enforce Manager-Builder separation policy

**Git Branch:** `agents-setup`

**Pending Tasks:**
- T-002: Ready for approval (implementation task for Claude Code)

**Manager Acknowledgment:**
- ✅ Policy understood
- ✅ Files updated
- ✅ Separation enforced
- ✅ No application code modifications by Manager
- ✅ All future technical work will be delegated to Claude Code via workflows
- ✅ Workflow delegation will be verified with evidence
- ✅ Human approval will be requested before starting tasks

---

## Summary for Human

**What Changed:**
1. ✅ Manager role explicitly limited to planning, delegation, and review
2. ✅ Builder role confirmed as sole engineering executor
3. ✅ Mandatory workflow delegation rule added
4. ✅ Workflow verification checklist added
5. ✅ Human approval policy reinforced
6. ✅ Evidence requirements documented

**What Manager Will Do:**
- Create task specifications
- Launch Claude Code workflows
- Monitor and review Builder's work
- Request your approval

**What Manager Will NOT Do:**
- Implement application code
- Perform technical investigations
- Modify application files
- Claim delegation without evidence

**Claude Code (Builder) Will Do:**
- ALL technical work
- ALL implementation
- ALL testing
- ALL commits

**This separation is now MANDATORY and PERMANENT.**

---

**Policy enforced. No application code modified. Awaiting your approval to proceed with T-002 delegation to Claude Code (Builder).**
