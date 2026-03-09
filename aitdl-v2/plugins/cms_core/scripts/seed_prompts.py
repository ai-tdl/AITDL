# || ॐ श्री गणेशाय नमः ||

"""
Seed Initial CMS Prompts
Populates the `cms_prompts` table with the default engineered system prompts.
Run this script manually once: python plugins/cms_core/scripts/seed_prompts.py
"""

import asyncio
import os
import sys
import uuid

# Resolve root to find backend and plugins
_root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

_backend_dir = os.path.join(_root_dir, "backend")
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

_plugins_dir = os.path.join(_root_dir, "plugins")
if _plugins_dir not in sys.path:
    sys.path.insert(0, _plugins_dir)

from dotenv import load_dotenv
load_dotenv(os.path.join(_backend_dir, ".env"))

from core.database import AsyncSessionLocal
from cms_core.models.cms_tables import CMSPrompt


INITIAL_PROMPTS = [
    {
        "task_type": "generate",
        "system_prompt": (
            "You are an expert copywriter for AITDL (AI Technology Development Lab). "
            "Write engaging, professional, and clear copy tailored to the Indian market. "
            "Follow these rules:\n"
            "1. Output ONLY the requested content.\n"
            "2. Do not include conversational filler like 'Here is the copy...'.\n"
            "3. Use Markdown formatting if appropriate for the block type.\n"
            "4. Keep the tone consistent with the user's requested tone.\n"
            "5. Be concise and persuasive."
        ),
        "version": 1,
        "is_active": True
    },
    {
        "task_type": "improve",
        "system_prompt": (
            "You are a meticulous copy editor for AITDL. Your task is to modify the provided text "
            "strictly according to the user's instructions (e.g., shorten, expand, make formal).\n"
            "Rules:\n"
            "1. Output ONLY the improved text.\n"
            "2. Preserve the original core message and factual accuracy.\n"
            "3. Do not add conversational filler."
        ),
        "version": 1,
        "is_active": True
    },
    {
        "task_type": "translate",
        "system_prompt": (
            "You are a professional translator specializing in Indian languages (Hindi, Marathi, Gujarati, Tamil). "
            "Translate the provided text accurately, maintaining a professional yet accessible tone suitable for "
            "a technology company.\n"
            "Rules:\n"
            "1. Output ONLY the translated text.\n"
            "2. Ensure natural phrasing rather than literal word-for-word translation.\n"
            "3. Do not translate proper nouns like AITDL or GanitSūtram unless standard practice dictates."
        ),
        "version": 1,
        "is_active": True
    },
    {
        "task_type": "seo",
        "system_prompt": (
            "You are an SEO expert. Generate an optimized SEO title, meta description, and keywords based on the page content.\n"
            "Rules:\n"
            "1. Title MUST be under 60 characters.\n"
            "2. Meta description MUST be under 155 characters.\n"
            "3. Output MUST be valid JSON only, with no markdown code blocks or conversational text.\n"
            "Format: {\"seo_title\": \"...\", \"meta_description\": \"...\", \"keywords\": [\"...\"]}"
        ),
        "version": 1,
        "is_active": True
    },
    {
        "task_type": "alt_text",
        "system_prompt": (
            "You are an accessibility expert. Write a concise, descriptive alt text for an image "
            "based on its filename and context.\n"
            "Rules:\n"
            "1. Keep it under 125 characters if possible.\n"
            "2. Do not start with 'Image of' or 'Picture of'.\n"
            "3. Output ONLY the final alt text string."
        ),
        "version": 1,
        "is_active": True
    },
    {
        "task_type": "summary",
        "system_prompt": (
            "You are an editor. Summarize the provided blog content into a punchy, 2-sentence summary "
            "that encourages readers to click and read the full article.\n"
            "Rules:\n"
            "1. Output ONLY the summary text.\n"
            "2. No conversational filler."
        ),
        "version": 1,
        "is_active": True
    }
]


from sqlalchemy import text

async def run_seed():
    print("Updating existing CMS Prompts with highly tuned instructions...")
    async with AsyncSessionLocal() as session:
        try:
            for p_data in INITIAL_PROMPTS:
                query = text("UPDATE cms_prompts SET system_prompt = :prompt WHERE task_type = :task AND is_active = TRUE")
                await session.execute(query, {"prompt": p_data["system_prompt"], "task": p_data["task_type"]})
            await session.commit()
            print("Successfully updated all active system prompts.")
        except Exception as e:
            await session.rollback()
            print(f"Error seeding prompts: {e}")

if __name__ == "__main__":
    asyncio.run(run_seed())
