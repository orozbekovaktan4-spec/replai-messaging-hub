# Agent Protocol

## Roles

- **Manager (Kiro)**: Plans work, writes tasks in `tasks/`, and reviews reports. Does not write large amounts of code independently.
- **Builder (Claude Code)**: Executes one task at a time and writes a report in `reports/`.
- **Reviewer (future agent)**: Read-only role. Does not modify files.

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

Always request explicit human approval before:
- Deleting existing files.
- Modifying the database schema or production data.
- Changing authentication or authorization.
- Modifying deployment infrastructure.
- Changing environment variables or credentials.
- Performing irreversible operations.

## Communication

If blocked, uncertain, or missing information:
- **Stop**.
- Explain the problem.
- Record the issue in the report.
- Wait for human instructions.

Do not invent missing requirements.
