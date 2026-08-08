"""Data models and validation for Context CRM.

Provides schema constants and validation helpers without external deps.
"""
from __future__ import annotations

from typing import Any, Dict, List
from datetime import datetime

CONTACT_SCHEMA_KEYS = {
    "meta": {"name", "last_updated", "relationship_tier"},
    "biography": {"role", "background"},
    "leverage_metrics": {"skills_and_resources", "friction_points", "drivers"},
    "tone_profile": {"communication_style", "preferred_vocabulary", "formality_level"},
    "historical_timeline": set(),
}


def make_empty_contact(name: str) -> Dict[str, Any]:
    """Return a new empty contact dict conforming to the schema."""
    now = datetime.utcnow().isoformat() + "Z"
    return {
        "meta": {"name": name, "last_updated": now, "relationship_tier": ""},
        "biography": {"role": "", "background": ""},
        "leverage_metrics": {"skills_and_resources": [], "friction_points": [], "drivers": []},
        "tone_profile": {"communication_style": "", "preferred_vocabulary": [], "formality_level": ""},
        "historical_timeline": [],
    }


def validate_contact_structure(obj: Any) -> bool:
    """Perform a conservative validation that the contact has required top-level keys and basic types.

    This function is intentionally permissive on nested content but ensures schema is intact.
    """
    if not isinstance(obj, dict):
        return False

    for top_key, expected_subkeys in CONTACT_SCHEMA_KEYS.items():
        if top_key not in obj:
            return False
        if expected_subkeys:
            if not isinstance(obj[top_key], dict):
                return False
            actual_keys = set(obj[top_key].keys())
            # Allow extra keys but require the expected subset
            if not expected_subkeys.issubset(actual_keys):
                return False
        else:
            # historical_timeline must be a list
            if not isinstance(obj.get("historical_timeline"), list):
                return False

    return True


def merge_contacts(existing: Dict[str, Any], updates: Dict[str, Any]) -> Dict[str, Any]:
    """Merge `updates` into `existing` following data integrity rules.

    - Never delete valid information without replacement.
    - Avoid duplicating list entries.
    - Preserve schema.
    """
    out = {**existing}

    # meta
    meta = dict(existing.get("meta", {}))
    for k in ("relationship_tier",):
        v = updates.get("meta", {}).get(k)
        if v:
            meta[k] = v
    meta["last_updated"] = datetime.utcnow().isoformat() + "Z"
    out["meta"] = meta

    # biography: overwrite non-empty fields
    bio = dict(existing.get("biography", {}))
    for k in ("role", "background"):
        v = updates.get("biography", {}).get(k)
        if v:
            bio[k] = v
    out["biography"] = bio

    # leverage_metrics: merge lists uniquely
    lm = dict(existing.get("leverage_metrics", {}))
    for k in ("skills_and_resources", "friction_points", "drivers"):
        existing_list = list(existing.get("leverage_metrics", {}).get(k, []) or [])
        new_list = list(updates.get("leverage_metrics", {}).get(k, []) or [])
        combined = existing_list[:]  # preserve order
        for item in new_list:
            if item and item not in combined:
                combined.append(item)
        lm[k] = combined
    out["leverage_metrics"] = lm

    # tone_profile: overwrite non-empty fields and merge vocabulary
    tp = dict(existing.get("tone_profile", {}))
    v = updates.get("tone_profile", {}).get("communication_style")
    if v:
        tp["communication_style"] = v
    vocab_existing = list(existing.get("tone_profile", {}).get("preferred_vocabulary", []) or [])
    vocab_new = list(updates.get("tone_profile", {}).get("preferred_vocabulary", []) or [])
    for w in vocab_new:
        if w and w not in vocab_existing:
            vocab_existing.append(w)
    tp["preferred_vocabulary"] = vocab_existing
    formality = updates.get("tone_profile", {}).get("formality_level")
    if formality:
        tp["formality_level"] = formality
    out["tone_profile"] = tp

    # historical_timeline: append events
    timeline = list(existing.get("historical_timeline", []) or [])
    new_timeline = updates.get("historical_timeline", []) or []
    for ev in new_timeline:
        if ev and ev not in timeline:
            timeline.append(ev)
    out["historical_timeline"] = timeline

    return out
