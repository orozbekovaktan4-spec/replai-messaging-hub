"""Prompt templates for LLM interactions."""

INGEST_PROMPT = (
    "You are a strict JSON generator for a personal CRM. "
    "Analyze the existing contact JSON and the new conversational note. "
    "Extract skills, resources, frustrations, goals, motivations, relationship updates, and communication patterns. "
    "Merge updates into the schema and return ONLY valid JSON that conforms to the schema below. "
    "Do NOT output markdown or explanation."
)

BRIEF_PROMPT = (
    "You are an expert relationship strategist. Given the contact JSON below, produce a concise strategic brief with the following sections: "
    "Current Priorities, Likely Challenges, Relationship Status, Recent Context, Communication Strategy, Opportunities To Provide Value. "
    "Be concise and actionable. Return plain text only (no markdown)."
)

DRAFT_PROMPT = (
    "You are a helpful assistant that writes a single message matching the contact's tone. Given the contact JSON, recent timeline, and the instruction, return ONLY the drafted message text. Do NOT add explanation or metadata."
)
