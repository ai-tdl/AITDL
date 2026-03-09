# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# Creator: Jawahar R. Mallah
# Then: 628 CE · Brahmasphuṭasiddhānta · Now: 9 March MMXXVI
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

"""
Hybrid AI Gateway — backend/services/ai_gateway.py

Purpose : Universal AI routing layer with intelligent tier selection\n          and automatic fallback across 6 providers.

Providers:
    LOCAL       → Ollama         (llama3:8b — self-hosted)
    OPEN_SOURCE → Groq           (llama3-8b-8192 — fast OSS inference)
    DEEPSEEK    → DeepSeek       (deepseek-chat — cost-effective reasoning)
    GEMINI      → Google Gemini  (gemini-2.0-flash — fast multimodal)
    PREMIUM     → OpenAI         (gpt-4-turbo — flagship)
    CLAUDE      → Anthropic      (claude-sonnet-4-20250514 — premium reasoning)

Fallback chain: Claude → OpenAI → Gemini → DeepSeek → Groq → Ollama

Env vars: AI_STUB_MODE, OLLAMA_HOST, GROQ_API_KEY, DEEPSEEK_API_KEY,
          GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY
"""

import os
import httpx
import logging
import openai
from enum import Enum
from typing import Dict, Any, Optional

log = logging.getLogger(__name__)

STUB_MODE = os.getenv('AI_STUB_MODE', 'true').lower() == 'true'
OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'http://localhost:11434')


class AISource(str, Enum):
    LOCAL = "local"
    OPEN_SOURCE = "open_source"
    DEEPSEEK = "deepseek"
    GEMINI = "gemini"
    PREMIUM = "premium"
    CLAUDE = "claude"


class TaskComplexity(str, Enum):
    BASIC = "basic"
    CONTENT = "content"
    ADVANCED = "advanced"


def _determine_source(task_type: TaskComplexity) -> AISource:
    """
    Route the task to the most appropriate AI tier based on complexity.

    BASIC    → Ollama (local, zero cost)
    CONTENT  → Gemini (fast, cost-effective)
    ADVANCED → Claude (premium reasoning)
    """
    if task_type == TaskComplexity.BASIC:
        return AISource.LOCAL
    elif task_type == TaskComplexity.CONTENT:
        return AISource.GEMINI
    elif task_type == TaskComplexity.ADVANCED:
        return AISource.CLAUDE
    return AISource.LOCAL


# ── Fallback order (highest quality → lowest cost) ─────────────────────────────

_FALLBACK_ORDER = [
    AISource.CLAUDE,
    AISource.PREMIUM,
    AISource.GEMINI,
    AISource.DEEPSEEK,
    AISource.OPEN_SOURCE,
    AISource.LOCAL,
]


async def generate_response(
    prompt: str,
    task_type: TaskComplexity = TaskComplexity.BASIC,
    context: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Universal entry point for the Hybrid AI Layer with fallback chain.
    """
    source = _determine_source(task_type)

    providers = {
        AISource.CLAUDE: _call_claude_model,
        AISource.PREMIUM: _call_premium_model,
        AISource.GEMINI: _call_gemini_model,
        AISource.DEEPSEEK: _call_deepseek_model,
        AISource.OPEN_SOURCE: _call_opensource_model,
        AISource.LOCAL: _call_local_model,
    }

    # Start from the preferred source and fall through
    try:
        start_idx = _FALLBACK_ORDER.index(source)
    except ValueError:
        start_idx = len(_FALLBACK_ORDER) - 1

    log.info(f"Routing AI request: task='{task_type}' -> preferred='{source}'")

    for provider_key in _FALLBACK_ORDER[start_idx:]:
        try:
            return await providers[provider_key](prompt, context)
        except Exception as e:
            log.warning(f"AI Provider {provider_key} failed, trying next: {e}")

    raise RuntimeError("All AI providers in the fallback chain failed.")


# ── Provider: Ollama (Local) ───────────────────────────────────────────────────

async def _call_local_model(prompt: str, context: Optional[Dict] = None) -> Dict[str, Any]:
    if STUB_MODE:
        return {
            "provider": "ollama_stub",
            "model": "llama3:8b",
            "response": f"[Stub] Local AI processed: {prompt[:30]}...",
            "status": "success"
        }

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            r = await client.post(
                f"{OLLAMA_HOST}/api/generate",
                json={'model': 'llama3:8b', 'prompt': prompt, 'stream': False}
            )
            r.raise_for_status()
            return {
                "provider": "ollama",
                "model": "llama3:8b",
                "response": r.json()['response'],
                "status": "success"
            }
        except Exception as e:
            log.error(f"Ollama call failed: {e}")
            raise


# ── Provider: Groq (Open Source) ───────────────────────────────────────────────

async def _call_opensource_model(prompt: str, context: Optional[Dict] = None) -> Dict[str, Any]:
    if STUB_MODE:
        return {
            "provider": "groq_stub",
            "model": "llama3-8b-8192",
            "response": f"[Stub] Open-Source AI generated: {prompt[:30]}...",
            "status": "success"
        }

    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        raise ValueError("GROQ_API_KEY not set")

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            r = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": "llama3-8b-8192",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7
                }
            )
            r.raise_for_status()
            data = r.json()
            return {
                "provider": "groq",
                "model": "llama3-8b-8192",
                "response": data['choices'][0]['message']['content'],
                "status": "success"
            }
        except Exception as e:
            log.error(f"Groq call failed: {e}")
            raise


# ── Provider: DeepSeek ─────────────────────────────────────────────────────────

async def _call_deepseek_model(prompt: str, context: Optional[Dict] = None) -> Dict[str, Any]:
    if STUB_MODE:
        return {
            "provider": "deepseek_stub",
            "model": "deepseek-chat",
            "response": f"[Stub] DeepSeek AI generated: {prompt[:30]}...",
            "status": "success"
        }

    api_key = os.getenv('DEEPSEEK_API_KEY')
    if not api_key:
        raise ValueError("DEEPSEEK_API_KEY not set")

    async with httpx.AsyncClient(timeout=60) as client:
        try:
            r = await client.post(
                "https://api.deepseek.com/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                }
            )
            r.raise_for_status()
            data = r.json()
            return {
                "provider": "deepseek",
                "model": "deepseek-chat",
                "response": data['choices'][0]['message']['content'],
                "status": "success"
            }
        except Exception as e:
            log.error(f"DeepSeek call failed: {e}")
            raise


# ── Provider: Google Gemini ────────────────────────────────────────────────────

async def _call_gemini_model(prompt: str, context: Optional[Dict] = None) -> Dict[str, Any]:
    if STUB_MODE:
        return {
            "provider": "gemini_stub",
            "model": "gemini-2.0-flash",
            "response": f"[Stub] Gemini AI generated: {prompt[:30]}...",
            "status": "success"
        }

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set")

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            r = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 2048,
                    }
                }
            )
            r.raise_for_status()
            data = r.json()
            text = data['candidates'][0]['content']['parts'][0]['text']
            return {
                "provider": "gemini",
                "model": "gemini-2.0-flash",
                "response": text,
                "status": "success"
            }
        except Exception as e:
            log.error(f"Gemini call failed: {e}")
            raise


# ── Provider: OpenAI (Premium) ─────────────────────────────────────────────────

async def _call_premium_model(prompt: str, context: Optional[Dict] = None) -> Dict[str, Any]:
    if STUB_MODE:
        return {
            "provider": "openai_stub",
            "model": "gpt-4-turbo",
            "response": f"[Stub] Premium AI reasoned: {prompt[:30]}...",
            "status": "success"
        }

    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise ValueError("OPENAI_API_KEY not set")

    client = openai.AsyncOpenAI(api_key=api_key)
    try:
        r = await client.chat.completions.create(
            model='gpt-4-turbo',
            messages=[{'role': 'user', 'content': prompt}]
        )
        return {
            "provider": "openai",
            "model": "gpt-4-turbo",
            "response": r.choices[0].message.content,
            "status": "success"
        }
    except Exception as e:
        log.error(f"OpenAI call failed: {e}")
        raise


# ── Provider: Anthropic Claude ─────────────────────────────────────────────────

async def _call_claude_model(prompt: str, context: Optional[Dict] = None) -> Dict[str, Any]:
    if STUB_MODE:
        return {
            "provider": "claude_stub",
            "model": "claude-sonnet-4-20250514",
            "response": f"[Stub] Claude AI reasoned: {prompt[:30]}...",
            "status": "success"
        }

    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not set")

    async with httpx.AsyncClient(timeout=60) as client:
        try:
            r = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 2048,
                    "messages": [{"role": "user", "content": prompt}],
                }
            )
            r.raise_for_status()
            data = r.json()
            text = data['content'][0]['text']
            return {
                "provider": "claude",
                "model": "claude-sonnet-4-20250514",
                "response": text,
                "status": "success"
            }
        except Exception as e:
            log.error(f"Claude call failed: {e}")
            raise
