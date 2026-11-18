# Agent Protocol — Role Separation and Responsibilities

## Critical: Manager-Builder Separation

This protocol enforces strict separation between Manager (Kiro) and Builder (Claude Code).

**Manager = Project Manager** (planning, delegation, review)  
**Builder = Primary Engineer** (implementation, testing, commits)

## Roles

### Manager (Kiro)
**Responsibilities:**
- Understand requirements and priorities
- Analyze what work needs to be done at a planning level
- Create clear, actionable task specifications in `tasks/`
- **Delegate ALL substantive technical work to Claude Code (Builder)**
- Launch and monitor Claude Code workflows
- Review Builder's reports, commits, and test results in `reports/`
- Report results to human and request approval

**Does NOT:**
- Implement application code
- Perform technical investigations instead of Builder
- Modify application files to complete Builder tasks
- Execute Builder tasks directly
- Claim work was delegated without workflow execution evidence

### Builder (Claude Code)
**Responsibilities:**
- Repository investigation and technical audits
- Reading and tracing application architecture
- Debugging and root-cause analysis
- Implementing features and fixes
- Writing tests and running them
- Technical documentation and implementation reports
- Git commits for assigned tasks
- Executes one task at a time from `tasks/` directory
- Writes completion report in `reports/` directory

### Reviewer (future agent)
**Responsibilities:**
- Read-only role
- Does not modify files
- Provides review feedback

## Rules

1. **One task = one deliverable**, with a maximum working time of one hour.
2. **Never touch `.env` files or secrets**. Never print them in reports.
3. **Ask the human before**:
   - Deleting files
   - Modifying the database
   - Changing authentication or authorization
   - Modifying deployment infrastructure
4. **After completing work**, run tests if available and document the results.
5. **If unsure, stop** and write a question in the report. Never guess.
6. **One commit per task**, using this format: `T-001: description of changes`.
7. **Do not work on multiple assigned tasks simultaneously**.
8. **Do not modify unrelated files**.
9. **Always inspect the current Git state** before starting and committing work.

## Definition of Done

A task is complete only when:
- Its acceptance criteria are satisfied.
- Relevant tests have passed.
- A report has been written in `reports/`.
- Changes have been committed.
- No unrelated changes have been included.

## Human Approval Required

**The human (CEO/Product Owner) must approve:**

Always request explicit human approval before:
- **Starting ANY new implementation task** (unless human has explicitly authorized automatic delegation)
- Deleting existing files
- Modifying the database schema or production data
- Changing authentication or authorization
- Modifying deployment infrastructure
- Changing environment variables or credentials
- Performing irreversible operations
- Production deployments
- Secret rotations

**Manager must obtain human approval before launching Builder workflows**, unless human has given blanket authorization.

## Communication

### If Builder is blocked, uncertain, or missing information:
- **Stop work immediately**
- Explain the problem clearly
- Record the issue in the report
- Wait for human instructions
- Do not guess or invent requirements

### If Manager needs to delegate work:
1. Create clear task specification in `tasks/T-XXX.md`
2. Launch Claude Code workflow using `run_workflow`
3. Verify workflow is running (check workflow ID and status)
4. Monitor for completion notification
5. Review Builder's report and commits
6. Present results to human

### Manager must NEVER:
- Implement the work instead of launching Builder
- Claim Builder completed work without workflow execution evidence
- Modify application code to "help" Builder
- Skip workflow launch and do work inline

Do not invent missing requirements.

---

## Workflow Delegation Verification (Manager Only)

**Before claiming a task was delegated to Builder, Manager must verify:**

1. ✅ Workflow was launched using `run_workflow` tool
2. ✅ Workflow ID was returned (e.g., `wf_abc123...`)
3. ✅ Workflow status shows "running" or "completed"
4. ✅ Workflow agent is `wf-coder` (Claude Code Builder) or equivalent
5. ✅ Workflow completion notification was received

**Required evidence of delegation:**
- Workflow launch confirmation message
- Workflow ID in Manager's tool call log
- Builder's completion notification (via `send_message`)
- Builder's commit in git log (format: `T-XXX: description`)
- Builder's report file in `reports/T-XXX.md`

**If these are missing:**
- The work was NOT properly delegated
- Manager may have done the work instead
- This violates the Manager-Builder separation policy
- Redo the task with proper delegation
