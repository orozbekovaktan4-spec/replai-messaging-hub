Context CRM — Local-first Personal CRM
=====================================

Context CRM is a local-first Personal CRM that transforms messy conversational notes into structured, searchable, and actionable contact intelligence.

Quick install
-------------

Prerequisites:
- Python 3.10+
- Either the official `openai` package (for OpenAI usage) or `ollama` CLI installed and configured (for Ollama provider). Both are optional; defaults set in `config/settings.json`.

Install (recommended in virtualenv):

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r context_crm/requirements.txt
```

Run examples
------------

Ingest a note:

```bash
python context_crm/app.py ingest "Daniel Oroz" "talked today, struggling with Docker deployment but fixed hardware issue"
```

Find contacts matching a keyword:

```bash
python context_crm/app.py find "Docker"
```

Generate a strategic brief:

```bash
python context_crm/app.py brief "Daniel Oroz"
```

Draft a tone-matched message:

```bash
python context_crm/app.py draft "Daniel Oroz" "Ask if he wants to work on the automation project tonight"
```

List contacts:

```bash
python context_crm/app.py list
```

View a contact:

```bash
python context_crm/app.py view "Daniel Oroz"
```

Project layout
--------------

- `context_crm/app.py` — CLI entrypoint
- `context_crm/processor.py` — merging and processing logic
- `context_crm/storage.py` — file I/O and validation
- `context_crm/models.py` — data schemas & validators
- `context_crm/prompts.py` — LLM prompt templates
- `context_crm/llm.py` — provider implementations
- `context_crm/config/settings.json` — example settings
- `context_crm/contacts/` — JSON contacts stored here
- `context_crm/logs/app.log` — log file

Notes
-----

All contact data is stored as human-readable JSON in the `context_crm/contacts/` folder. The application never requires a DB server.

If you want me to run tests or validate the environment, tell me to run them and I'll proceed.
