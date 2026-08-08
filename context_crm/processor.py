"""Processing logic: prepare LLM prompts, validate responses, and merge into profiles."""
from __future__ import annotations

import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime

from .models import validate_contact_structure, merge_contacts, make_empty_contact
from .llm import LLMProvider
from .prompts import INGEST_PROMPT, BRIEF_PROMPT, DRAFT_PROMPT

logger = logging.getLogger(__name__)


class Processor:
    def __init__(self, llm: LLMProvider):
        self.llm = llm

    def _call_llm_json(self, system_text: str, existing: Dict[str, Any], note: Optional[str] = None, attempts: int = 2, model: Optional[str] = None) -> Dict[str, Any]:
        """Call LLM asking for a JSON response that matches the schema.

        Retries on invalid JSON and attempts basic repair.
        """
        prompt_base = f"{system_text}\n\nExisting profile:\n{json.dumps(existing, ensure_ascii=False)}\n\nNote:\n{note or ''}\n\nReturn only valid JSON."

        last_exc = None
        for attempt in range(attempts):
            try:
                raw = self.llm.generate(prompt_base, model=model)
            except Exception as e:
                logger.exception("LLM call failed: %s", e)
                raise

            # Try to parse JSON strictly
            try:
                parsed = json.loads(raw)
            except Exception:
                # attempt simple repair: find first and last brace
                try:
                    start = raw.find("{")
                    end = raw.rfind("}")
                    if start != -1 and end != -1 and end > start:
                        candidate = raw[start:end+1]
                        parsed = json.loads(candidate)
                    else:
                        raise
                except Exception as ex2:
                    logger.warning("Attempt %s: LLM returned invalid JSON; raw output logged", attempt + 1)
                    logger.debug("Raw LLM output: %s", raw)
                    last_exc = ex2
                    continue

            if not validate_contact_structure(parsed):
                logger.warning("LLM returned JSON that doesn't match schema on attempt %s", attempt + 1)
                last_exc = ValueError("Invalid schema")
                continue

            return parsed

        # if we get here, all attempts failed
        logger.error("Failed to obtain valid JSON from LLM after %s attempts", attempts)
        raise RuntimeError("LLM did not return valid JSON")

    def ingest(self, existing: Dict[str, Any], note: str, model: Optional[str] = None) -> Dict[str, Any]:
        """Ingest a single conversational note and return updated profile dict."""
        # call LLM to get structured update
        updates = self._call_llm_json(INGEST_PROMPT, existing, note=note, model=model)

        # ensure timeline event appended: add our note with timestamp if not present
        timestamp = datetime.utcnow().isoformat() + "Z"
        event = {"timestamp": timestamp, "note": note}
        if "historical_timeline" not in updates:
            updates["historical_timeline"] = [event]
        else:
            # Append our own event to ensure provenance
            updates.setdefault("historical_timeline", []).append(event)

        merged = merge_contacts(existing, updates)
        return merged

    def brief(self, profile: Dict[str, Any], model: Optional[str] = None) -> str:
        prompt = f"{BRIEF_PROMPT}\n\nProfile:\n{json.dumps(profile, ensure_ascii=False)}\n\nReturn concise brief."
        return self.llm.generate(prompt, model=model)

    def draft(self, profile: Dict[str, Any], instruction: str, recent_timeline: Optional[list] = None, model: Optional[str] = None) -> str:
        prompt = f"{DRAFT_PROMPT}\n\nProfile:\n{json.dumps(profile, ensure_ascii=False)}\n\nRecent timeline:\n{json.dumps(recent_timeline or [], ensure_ascii=False)}\n\nInstruction:\n{instruction}\n\nReturn only the message text."
        return self.llm.generate(prompt, model=model)
