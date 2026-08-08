"""LLM provider abstraction layer.

Implements `LLMProvider` interface with `OpenAIProvider` and `OllamaProvider`.
"""
from __future__ import annotations

import json
import subprocess
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class LLMProvider:
    def generate(self, prompt: str, model: Optional[str] = None) -> str:
        """Generate text from the prompt.

        Subclasses must implement.
        """
        raise NotImplementedError()


class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: Optional[str] = None):
        try:
            import openai

            self.openai = openai
            if api_key:
                self.openai.api_key = api_key
        except Exception:
            raise RuntimeError("OpenAI package not available or failed to import")

    def generate(self, prompt: str, model: Optional[str] = None) -> str:
        model_name = model or "gpt-4o-mini"
        resp = self.openai.ChatCompletion.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=1200,
        )
        return resp.choices[0].message.content


class OllamaProvider(LLMProvider):
    def __init__(self, model: str = "llama3"):
        self.model = model

    def generate(self, prompt: str, model: Optional[str] = None) -> str:
        model_to_use = model or self.model
        try:
            # Use ollama CLI: `ollama generate <model> < input` pattern
            proc = subprocess.run(["ollama", "generate", model_to_use, "-"], input=prompt.encode("utf-8"), stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
            if proc.returncode != 0:
                logger.error("Ollama generate failed: %s", proc.stderr.decode("utf-8", errors="replace"))
                raise RuntimeError("Ollama generate failed")
            return proc.stdout.decode("utf-8")
        except FileNotFoundError:
            raise RuntimeError("Ollama CLI not found. Install ollama or choose OpenAI provider")


class GroqProvider(LLMProvider):
    """Simple Groq API provider.

    This provider expects either an API key in the `GROQ_API_KEY` environment variable
    or an `api_key` argument. The endpoint URL can be provided via `endpoint` or the
    `GROQ_ENDPOINT` env var. The exact request/response format may vary by Groq API
    version; this implementation posts JSON {"prompt": prompt, "model": model}
    and returns `response.text` or `response.json().get('output')` if present.
    """
    def __init__(self, api_key: Optional[str] = None, endpoint: Optional[str] = None):
        # Prefer `requests` if available, but fall back to stdlib urllib to avoid extra installs
        import os
        try:
            import requests
            self._use_requests = True
            self.requests = requests
        except Exception:
            self._use_requests = False
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        # Default to Groq's OpenAI-compatible chat completions endpoint used in examples
        self.endpoint = endpoint or os.getenv("GROQ_ENDPOINT") or "https://api.groq.com/openai/v1/chat/completions"
        if not self.api_key:
            raise RuntimeError("Groq API key not provided (GROQ_API_KEY)")

    def generate(self, prompt: str, model: Optional[str] = None) -> str:
        """Send a chat-style request to Groq's API and return the assistant text.

        Accepts `prompt` as a plain string (will be wrapped in a single user message)
        or as a prepared messages list (JSON string) if callers choose to supply that.
        """
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}

        # Prepare messages: if prompt looks like JSON array of messages, try to parse it
        messages = None
        try:
            import json as _json
            parsed = _json.loads(prompt)
            if isinstance(parsed, list):
                messages = parsed
        except Exception:
            messages = None

        if messages is None:
            messages = [{"role": "user", "content": prompt}]

        payload = {"model": model or "gpt-3.5-turbo", "messages": messages, "temperature": 0.2}

        # Use requests if available for nicer behavior, otherwise use urllib from stdlib
        try:
            if self._use_requests:
                resp = self.requests.post(self.endpoint, json=payload, headers=headers, timeout=30)
                resp.raise_for_status()
                j = resp.json()
            else:
                # urllib fallback to avoid requiring external packages
                import urllib.request as _ur
                import urllib.error as _ue
                import json as _json
                import ssl as _ssl
                data = _json.dumps(payload).encode('utf-8')
                req = _ur.Request(self.endpoint, data=data, headers=headers, method='POST')
                ctx = _ssl.create_default_context()
                with _ur.urlopen(req, timeout=30, context=ctx) as res:
                    resp_text = res.read().decode('utf-8')
                try:
                    j = _json.loads(resp_text)
                except Exception:
                    j = {"raw": resp_text}

            # Groq's OpenAI-compatible response typically contains choices[0].message.content
            if isinstance(j, dict) and j.get("choices"):
                choice = j["choices"][0]
                if isinstance(choice, dict):
                    if choice.get("message") and choice["message"].get("content"):
                        return choice["message"]["content"]
                    if choice.get("text"):
                        return choice.get("text")
            # Fallback: try top-level output/text/result/raw
            for key in ("output", "text", "result", "raw"):
                if key in j:
                    val = j[key]
                    if isinstance(val, str):
                        return val
                    if isinstance(val, list) and val:
                        return val[0]
            return str(j)
        except Exception as e:
            raise RuntimeError(f"Groq API request failed: {e}")


class HuggingFaceProvider(LLMProvider):
    """Hugging Face Inference API provider.

    Reads `HUGGINGFACE_API_KEY` from env if `api_key` not provided.
    Uses model name passed to `generate()` or a default model.
    """
    def __init__(self, api_key: Optional[str] = None):
        import os
        try:
            import requests
            self._use_requests = True
            self.requests = requests
        except Exception:
            self._use_requests = False
        self.api_key = api_key or os.getenv("HUGGINGFACE_API_KEY")
        if not self.api_key:
            raise RuntimeError("HuggingFace API key not provided (HUGGINGFACE_API_KEY)")

    def generate(self, prompt: str, model: Optional[str] = None) -> str:
        model_name = model or "gpt2"
        endpoint = f"https://api-inference.huggingface.co/models/{model_name}"
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}

        payload = {"inputs": prompt, "parameters": {"max_new_tokens": 256, "temperature": 0.2}}

        try:
            if self._use_requests:
                resp = self.requests.post(endpoint, json=payload, headers=headers, timeout=30)
                resp.raise_for_status()
                j = resp.json()
            else:
                import urllib.request as _ur
                import json as _json
                import ssl as _ssl
                data = _json.dumps(payload).encode('utf-8')
                req = _ur.Request(endpoint, data=data, headers=headers, method='POST')
                ctx = _ssl.create_default_context()
                with _ur.urlopen(req, timeout=30, context=ctx) as res:
                    text = res.read().decode('utf-8')
                try:
                    j = _json.loads(text)
                except Exception:
                    j = {"raw": text}

            # Parse response: HF may return list of dicts or dict with 'generated_text'
            if isinstance(j, list) and j:
                first = j[0]
                if isinstance(first, dict) and first.get('generated_text'):
                    return first['generated_text']
                # some models return {'generated_text': '...'} directly
            if isinstance(j, dict):
                if j.get('generated_text'):
                    return j.get('generated_text')
                # if it's a dict with 'choices' similar to OpenAI
                if j.get('choices'):
                    ch = j['choices'][0]
                    if isinstance(ch, dict) and ch.get('text'):
                        return ch.get('text')
            # fallback to string
            return str(j)
        except Exception as e:
            raise RuntimeError(f"HuggingFace API request failed: {e}")


class DemoProvider(LLMProvider):
    """Demo/Mock provider for testing UI without external API calls."""
    def generate(self, prompt: str, model: Optional[str] = None) -> str:
        demo_responses = {
            "hi": "Hey there! 👋 Welcome to Context CRM. I'm working locally right now so you can test the interface.",
            "hello": "Hello! 🎉 How can I help you today? Try adding a contact or asking me something.",
            "what is this": "This is Context CRM - a personal relationship management tool. You can add contacts, take notes, and analyze them with AI.",
            "test": "✓ Demo mode is working! Try typing 'hi', 'hello', or 'what is this' for preset responses.",
        }
        prompt_lower = prompt.lower().strip()
        for key in demo_responses:
            if key in prompt_lower:
                return demo_responses[key]
        # Default response
        return f"You said: '{prompt}' - This is a demo response. Set up HuggingFace or another provider to use real AI."
