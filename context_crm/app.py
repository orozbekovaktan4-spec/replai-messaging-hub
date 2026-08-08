"""CLI entrypoint for Context CRM."""
from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path
from typing import Optional

from .storage import Storage
from .models import make_empty_contact
from .processor import Processor
from .llm import OpenAIProvider, OllamaProvider
import os


# Lightweight .env loader (no external deps). Loads project root .env
def load_dotenv_if_exists():
    root = Path(__file__).resolve().parent.parent
    env_path = root / '.env'
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if '=' not in line:
            continue
        k, v = line.split('=', 1)
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        if k and k not in os.environ:
            os.environ[k] = v


load_dotenv_if_exists()

from .prompts import INGEST_PROMPT

CONFIG_PATH = Path(__file__).parent / "config" / "settings.json"


def setup_logging(enabled: bool, path: Path):
    if not enabled:
        logging.basicConfig(level=logging.WARNING)
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", filename=str(path), filemode="a")


def load_settings() -> dict:
    if not CONFIG_PATH.exists():
        return {}
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))


def select_provider(settings: dict):
    provider = settings.get("provider", "ollama")
    model = settings.get("model")
    if provider == "openai":
        return OpenAIProvider(), model
    if provider == "groq":
        # Groq provider will read GROQ_API_KEY from env if not provided here
        from .llm import GroqProvider
        return GroqProvider(), model
    if provider == "huggingface":
        from .llm import HuggingFaceProvider
        return HuggingFaceProvider(), model
    return OllamaProvider(model=model or "llama3"), model


def cmd_ingest(args, storage: Storage, proc: Processor, settings: dict):
    name = args.name
    note = args.note
    existing = storage.load_contact(name)
    updated = proc.ingest(existing, note, model=settings.get("model"))
    storage.save_contact(name, updated)
    print(f"Ingested and updated {name}")


def cmd_find(args, storage: Storage):
    q = args.query.lower()
    matches = []
    for p in storage.list_contacts():
        data = json.loads(p.read_text(encoding="utf-8"))
        name = data.get("meta", {}).get("name", p.stem)
        tier = data.get("meta", {}).get("relationship_tier", "")
        fields = []
        def check(value, label):
            if isinstance(value, list):
                for item in value:
                    if q in str(item).lower():
                        fields.append((label, item))
            else:
                if q in str(value).lower():
                    fields.append((label, value))

        lm = data.get("leverage_metrics", {})
        check(lm.get("skills_and_resources", []), "Skill Match")
        check(lm.get("friction_points", []), "Friction")
        bio = data.get("biography", {})
        check(bio.get("role", ""), "Role")
        check(bio.get("background", ""), "Background")

        if fields:
            print(name)
            print(tier or "")
            for label, val in fields:
                print(f"{label}: {val}")
            print()


def cmd_brief(args, storage: Storage, proc: Processor, settings: dict):
    name = args.name
    profile = storage.load_contact(name)
    brief = proc.brief(profile, model=settings.get("model"))
    print(brief)


def cmd_draft(args, storage: Storage, proc: Processor, settings: dict):
    name = args.name
    instruction = args.instruction
    profile = storage.load_contact(name)
    recent = profile.get("historical_timeline", [])[-5:]
    message = proc.draft(profile, instruction, recent_timeline=recent, model=settings.get("model"))
    print(message)


def cmd_list(args, storage: Storage):
    for p in storage.list_contacts():
        data = json.loads(p.read_text(encoding="utf-8"))
        name = data.get("meta", {}).get("name", p.stem)
        tier = data.get("meta", {}).get("relationship_tier", "")
        updated = data.get("meta", {}).get("last_updated", "")
        print(name)
        print(tier or "")
        print(updated)
        print()


def cmd_view(args, storage: Storage):
    name = args.name
    data = storage.load_contact(name)
    # formatted print
    print(json.dumps(data, indent=2, ensure_ascii=False))


def main():
    settings = load_settings()
    logs_path = Path(__file__).parent / "logs" / "app.log"
    setup_logging(settings.get("logging_enabled", True), logs_path)

    storage = Storage(settings.get("contacts_path", str(Path(__file__).parent / "contacts")))
    provider, model = select_provider(settings)
    proc = Processor(provider)

    parser = argparse.ArgumentParser(prog="context-crm")
    sub = parser.add_subparsers(dest="cmd")

    p_ingest = sub.add_parser("ingest")
    p_ingest.add_argument("name")
    p_ingest.add_argument("note")
    p_ingest.set_defaults(func=lambda a: cmd_ingest(a, storage, proc, settings))

    p_find = sub.add_parser("find")
    p_find.add_argument("query")
    p_find.set_defaults(func=lambda a: cmd_find(a, storage))

    p_brief = sub.add_parser("brief")
    p_brief.add_argument("name")
    p_brief.set_defaults(func=lambda a: cmd_brief(a, storage, proc, settings))

    p_draft = sub.add_parser("draft")
    p_draft.add_argument("name")
    p_draft.add_argument("instruction")
    p_draft.set_defaults(func=lambda a: cmd_draft(a, storage, proc, settings))

    p_list = sub.add_parser("list")
    p_list.set_defaults(func=lambda a: cmd_list(a, storage))

    p_view = sub.add_parser("view")
    p_view.add_argument("name")
    p_view.set_defaults(func=lambda a: cmd_view(a, storage))

    args = parser.parse_args()
    if not hasattr(args, "func"):
        parser.print_help()
        return

    try:
        args.func(args)
        logging.getLogger(__name__).info("command=%s success contact=%s", args.cmd, getattr(args, "name", ""))
    except Exception as e:
        logging.getLogger(__name__).exception("command failed: %s", e)
        print("Error:", e)


if __name__ == "__main__":
    main()
