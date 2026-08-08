"""Simple WSGI server exposing minimal JSON API for Context CRM.

Endpoints:
- POST /ingest      -> {name, note}
- POST /find        -> {query}
- POST /brief       -> {name}
- POST /draft       -> {name, instruction}
- GET  /list        -> []
- GET  /view?name=  -> full contact JSON

Run: `python context_crm/web.py` then open `ui.html` in browser and set API base to http://localhost:8000
"""
from __future__ import annotations

import sys
import json
import os
from wsgiref.simple_server import make_server
from urllib.parse import parse_qs
from typing import Callable

from pathlib import Path

# Ensure the repo root is on sys.path so this file can be executed directly
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


# Lightweight .env loader (no external deps). Loads ROOT/.env
def load_dotenv_if_exists():
    env_path = ROOT / '.env'
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

from context_crm.storage import Storage
from context_crm.processor import Processor
from context_crm.llm import OpenAIProvider, OllamaProvider
from context_crm.models import make_empty_contact

CONFIG_PATH = Path(__file__).parent / "config" / "settings.json"


def load_settings():
    if not CONFIG_PATH.exists():
        return {}
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))


def select_provider(settings: dict):
    provider = settings.get("provider", "demo")
    model = settings.get("model")
    if provider == "openai":
        return OpenAIProvider(), model
    if provider == "groq":
        from context_crm.llm import GroqProvider
        return GroqProvider(), model
    if provider == "huggingface":
        from context_crm.llm import HuggingFaceProvider
        return HuggingFaceProvider(), model
    if provider == "demo":
        from context_crm.llm import DemoProvider
        return DemoProvider(), model
    return OllamaProvider(model=model or "llama3"), model


def json_response(start_response: Callable, status: str, obj: dict):
    body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
    start_response(status, [("Content-Type", "application/json; charset=utf-8")])
    return [body]


def app(environ, start_response):
    settings = load_settings()
    storage = Storage(settings.get("contacts_path", str(Path(__file__).parent / "contacts")))
    provider, model = select_provider(settings)
    proc = Processor(provider)

    path = environ.get("PATH_INFO", "")
    method = environ.get("REQUEST_METHOD", "GET").upper()

    try:
        if path == "/ingest" and method == "POST":
            size = int(environ.get("CONTENT_LENGTH", 0) or 0)
            body = environ["wsgi.input"].read(size) if size else b""
            data = json.loads(body.decode("utf-8") or "{}")
            name = data.get("name")
            note = data.get("note")
            if not name or not note:
                return json_response(start_response, "400 Bad Request", {"error": "name and note required"})
            existing = storage.load_contact(name)
            updated = proc.ingest(existing, note, model=settings.get("model"))
            storage.save_contact(name, updated)
            return json_response(start_response, "200 OK", {"status": "ok", "contact": updated})

        if path == "/ai_chat" and method == "POST":
            # Generic chat proxy: {prompt: string} or {messages: [ {role, content}, ... ] }
            size = int(environ.get("CONTENT_LENGTH", 0) or 0)
            body = environ["wsgi.input"].read(size) if size else b""
            data = json.loads(body.decode("utf-8") or "{}")
            prompt = data.get("prompt")
            messages = data.get("messages")
            model_override = data.get("model") or settings.get("model")
            if not prompt and not messages:
                return json_response(start_response, "400 Bad Request", {"error": "prompt or messages required"})
            # prepare prompt for provider.generate
            payload = None
            if messages:
                try:
                    payload = json.dumps(messages)
                except Exception:
                    payload = messages
            else:
                payload = prompt

            try:
                # use processor's llm instance to send the prompt/messages
                if hasattr(proc, 'llm') and hasattr(proc.llm, 'generate'):
                    text = proc.llm.generate(payload, model=model_override)
                else:
                    # fallback: if payload is a string, try calling _call_llm_json as a best-effort
                    text = proc._call_llm_json(payload, existing={}, note=None, model=model_override) if hasattr(proc, '_call_llm_json') else ''
            except Exception as e:
                return json_response(start_response, "500 Internal Server Error", {"error": str(e)})
            return json_response(start_response, "200 OK", {"result": text})

        if path == "/create" and method == "POST":
            size = int(environ.get("CONTENT_LENGTH", 0) or 0)
            body = environ["wsgi.input"].read(size) if size else b""
            data = json.loads(body.decode("utf-8") or "{}")
            name = data.get("name")
            if not name:
                return json_response(start_response, "400 Bad Request", {"error": "name required"})
            contact = make_empty_contact(name)
            storage.save_contact(name, contact)
            return json_response(start_response, "200 OK", {"status": "created", "contact": contact})

        if path == "/save_notes" and method == "POST":
            size = int(environ.get("CONTENT_LENGTH", 0) or 0)
            body = environ["wsgi.input"].read(size) if size else b""
            data = json.loads(body.decode("utf-8") or "{}")
            name = data.get("name")
            note = data.get("note")
            if not name or not note:
                return json_response(start_response, "400 Bad Request", {"error": "name and note required"})
            profile = storage.load_contact(name)
            # append note event with timestamp
            from datetime import datetime
            evt = {"timestamp": datetime.utcnow().isoformat() + "Z", "note": note}
            profile.setdefault("historical_timeline", []).append(evt)
            storage.save_contact(name, profile)
            return json_response(start_response, "200 OK", {"status": "saved", "contact": profile})

        if path == "/delete" and method == "POST":
            size = int(environ.get("CONTENT_LENGTH", 0) or 0)
            body = environ["wsgi.input"].read(size) if size else b""
            data = json.loads(body.decode("utf-8") or "{}")
            name = data.get("name")
            if not name:
                return json_response(start_response, "400 Bad Request", {"error": "name required"})
            ok = storage.delete_contact(name)
            if ok:
                return json_response(start_response, "200 OK", {"status": "deleted", "name": name})
            return json_response(start_response, "404 Not Found", {"error": "contact not found"})

        if path == "/find" and method == "POST":
            size = int(environ.get("CONTENT_LENGTH", 0) or 0)
            body = environ["wsgi.input"].read(size) if size else b""
            data = json.loads(body.decode("utf-8") or "{}")
            q = data.get("query", "")
            if not q:
                return json_response(start_response, "400 Bad Request", {"error": "query required"})
            ql = q.lower()
            results = []
            for p in storage.list_contacts():
                d = json.loads(p.read_text(encoding="utf-8"))
                name = d.get("meta", {}).get("name", p.stem)
                tier = d.get("meta", {}).get("relationship_tier", "")
                matches = []
                def check(value, label):
                    if isinstance(value, list):
                        for item in value:
                            if ql in str(item).lower():
                                matches.append({"label": label, "value": item})
                    else:
                        if ql in str(value).lower():
                            matches.append({"label": label, "value": value})

                lm = d.get("leverage_metrics", {})
                check(lm.get("skills_and_resources", []), "Skill Match")
                check(lm.get("friction_points", []), "Friction")
                bio = d.get("biography", {})
                check(bio.get("role", ""), "Role")
                check(bio.get("background", ""), "Background")

                if matches:
                    results.append({"name": name, "relationship_tier": tier, "matches": matches})

            return json_response(start_response, "200 OK", {"results": results})

        if path == "/brief" and method == "POST":
            size = int(environ.get("CONTENT_LENGTH", 0) or 0)
            body = environ["wsgi.input"].read(size) if size else b""
            data = json.loads(body.decode("utf-8") or "{}")
            name = data.get("name")
            if not name:
                return json_response(start_response, "400 Bad Request", {"error": "name required"})
            profile = storage.load_contact(name)
            text = proc.brief(profile, model=settings.get("model"))
            return json_response(start_response, "200 OK", {"brief": text})

        if path == "/draft" and method == "POST":
            size = int(environ.get("CONTENT_LENGTH", 0) or 0)
            body = environ["wsgi.input"].read(size) if size else b""
            data = json.loads(body.decode("utf-8") or "{}")
            name = data.get("name")
            instruction = data.get("instruction")
            if not name or not instruction:
                return json_response(start_response, "400 Bad Request", {"error": "name and instruction required"})
            profile = storage.load_contact(name)
            recent = profile.get("historical_timeline", [])[-5:]
            msg = proc.draft(profile, instruction, recent_timeline=recent, model=settings.get("model"))
            return json_response(start_response, "200 OK", {"message": msg})

        if path == "/list" and method == "GET":
            contacts = []
            for p in storage.list_contacts():
                d = json.loads(p.read_text(encoding="utf-8"))
                contacts.append({
                    "name": d.get("meta", {}).get("name", p.stem),
                    "relationship_tier": d.get("meta", {}).get("relationship_tier", ""),
                    "last_updated": d.get("meta", {}).get("last_updated", ""),
                })
            return json_response(start_response, "200 OK", {"contacts": contacts})

        if path == "/view" and method == "GET":
            qs = parse_qs(environ.get("QUERY_STRING", ""))
            name = qs.get("name", [None])[0]
            if not name:
                return json_response(start_response, "400 Bad Request", {"error": "name query param required"})
            profile = storage.load_contact(name)
            return json_response(start_response, "200 OK", {"contact": profile})

        # default: serve ui.html if present
        if path == "/" and method == "GET":
            ui_path = Path(__file__).parent / "ui.html"
            if ui_path.exists():
                start_response("200 OK", [("Content-Type", "text/html; charset=utf-8")])
                return [ui_path.read_bytes()]

        return json_response(start_response, "404 Not Found", {"error": "unknown endpoint"})

    except Exception as e:
        return json_response(start_response, "500 Internal Server Error", {"error": str(e)})


def run():
    port = 8000
    with make_server("127.0.0.1", port, app) as httpd:
        print(f"Context CRM web UI running at http://127.0.0.1:{port}/")
        httpd.serve_forever()


if __name__ == "__main__":
    run()
