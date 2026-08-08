"""File-based storage utilities for Context CRM.

Responsible for reading and writing contact JSON files and basic integrity handling.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

from .models import validate_contact_structure, make_empty_contact

logger = logging.getLogger(__name__)


class Storage:
    def __init__(self, contacts_path: str):
        self.base = Path(contacts_path).resolve()
        self.base.mkdir(parents=True, exist_ok=True)

    def contact_path(self, name: str) -> Path:
        safe = "_".join(name.strip().split())
        return self.base / f"{safe}.json"

    def list_contacts(self) -> List[Path]:
        return sorted([p for p in self.base.glob("*.json")])

    def load_contact(self, name: str) -> Dict[str, Any]:
        p = self.contact_path(name)
        if not p.exists():
            return make_empty_contact(name)
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
        except Exception as e:
            logger.exception("Failed to read contact %s: %s", name, e)
            # return empty contact to avoid crashes
            return make_empty_contact(name)

        if not validate_contact_structure(data):
            logger.error("Contact %s failed schema validation; preserving original and returning empty shell", p)
            return make_empty_contact(name)

        return data

    def save_contact(self, name: str, data: Dict[str, Any]) -> None:
        p = self.contact_path(name)
        # ensure schema
        if not validate_contact_structure(data):
            logger.error("Attempt to save invalid contact structure for %s", name)
            raise ValueError("Invalid contact structure")
        p.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    def delete_contact(self, name: str) -> bool:
        """Delete a contact file. Returns True if deleted, False if not found."""
        p = self.contact_path(name)
        try:
            if p.exists():
                p.unlink()
                return True
            return False
        except Exception:
            logger.exception("Failed to delete contact %s", name)
            return False
