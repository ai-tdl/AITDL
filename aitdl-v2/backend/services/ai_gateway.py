import os
import httpx
import logging
import openai
from enum import Enum
from typing import Dict, Any, Optional, List

log = logging.getLogger(__name__)

STUB_MODE = os.getenv('AI_STUB_MODE', 'true').lower() == 'true'
OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'http://localhost:11434')

class AISource(str, Enum):
    LOCAL = "local"
    OPEN_SOURCE = "open_source"
    PREMIUM = "premium"


class TaskComplexity(str, Enum):
    BASIC = "basic"
    CONTENT = "content"
    ADVANCED = "advanced"


def _determine_source(task_type: TaskComplexity) -> AISource:
    """
    Routs the task to the most appropriate AI tier based on complexity.
    """
    if task_type == TaskComplexity.BASIC:
        return AISource.LOCAL
    elif task_type == TaskComplexity.CONTENT:
        return AISource.OPEN_SOURCE
    elif task_type == TaskComplexity.ADVANCED:
        return AISource.PREMIUM
    return AISource.LOCAL


async def generate_response(prompt: str, task_type: TaskComplexity = TaskComplexity.BASIC, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Universal entry point for the Hybrid AI Layer with fallback chain.
    """
    source = _determine_source(task_type)
    
    providers = {
        AISource.PREMIUM: _call_premium_model,
        AISource.OPEN_SOURCE: _call_opensource_model,
        AISource.LOCAL: _call_local_model,
    }
    
    # Fallback chain: premium -> oss -> local
    order = list(providers.keys())
    try:
        start_idx = order.index(source)
    except ValueError:
        start_idx = len(order) - 1 # Default to local
        
    log.info(f"Routing AI request: task='{task_type}' -> preferred='{source}'")

    for provider_key in order[start_idx:]:
        try:
            return await providers[provider_key](prompt, context)
        except Exception as e:
            log.warning(f"AI Provider {provider_key} failed, trying next: {e}")
            
    raise RuntimeError("All AI providers in the fallback chain failed.")


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
