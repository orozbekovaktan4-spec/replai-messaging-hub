---
name: save-conversation
description: |
  Use when the user mentions "conversation", "save conversation", "remember conversation", "conversation file", "CONVERSATION-LOG", or "replai conversation".
  Use ONLY when working in the /Users/ak/replai project or when the user asks to save chat history.
  This skill ensures every session's key exchanges are logged to CONVERSATION-LOG.md.
---

# Save Conversation to REPLAI Log

**ALWAYS append a summary of each session to `/Users/ak/replai/CONVERSATION-LOG.md`** when:
- The session ends or the user says goodbye
- The user explicitly asks to save the conversation
- A significant task is completed (config change, bug fix, feature added, etc.)

## Log Format

Append to the end of the file using this format:

```markdown
---

## Session Summary (YYYY-MM-DD)

### Topics Covered
- What was discussed / done

### Key Outcomes
- What was achieved

### Files Modified
| File | Changes |
|------|---------|
| path/to/file | description of change |

### Next Steps
- Any follow-up items

---

```

## Rules
- Always read the existing file first, then append (don't overwrite).
- Keep summaries concise but informative.
- Include file paths for any files read or modified.
- Preserve all existing content in the file.
