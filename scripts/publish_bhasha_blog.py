#!/usr/bin/env python3
"""
Seeder script to publish the 'Bhasha AI Revolution' blog post in English, Hindi, and Sanskrit.
Handles workspace resolution and inserts posts with localized slugs and SEO metadata.
"""

import asyncio
import os
import sys
import uuid
from pathlib import Path
from datetime import datetime, timezone

# Add backend and plugins to sys.path
repo_root = Path(__file__).parent.parent
sys.path.append(str(repo_root / "backend"))
sys.path.append(str(repo_root / "plugins"))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

# Import from plugin models
try:
    from cms_core.models.cms_tables import BlogPost, Workspace
except ImportError:
    print("ERROR: Could not import cms_tables. Ensure plugins/cms_core is in sys.path")
    sys.exit(1)

async def publish_blog():
    # Load env from multiple possible locations
    from dotenv import load_dotenv
    load_dotenv(repo_root / "backend" / ".env")
    load_dotenv(repo_root / ".env")

    db_url = os.environ.get("DATABASE_URL", "")
    if not db_url:
        print("ERROR: DATABASE_URL not set in environment.")
        return

    # Handle standard postgres URI to asyncpg
    if db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
    
    engine = create_async_engine(db_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # 1. Resolve Workspace (Default to aitdl-internal)
        result = await session.execute(select(Workspace).where(Workspace.slug == "aitdl-internal"))
        workspace = result.scalar_one_or_none()
        
        if not workspace:
            print("Creating default 'aitdl-internal' workspace...")
            workspace = Workspace(
                id=uuid.uuid4(),
                name="AITDL Internal",
                slug="aitdl-internal",
                plan="internal",
                is_active=True
            )
            session.add(workspace)
            await session.commit()
            await session.refresh(workspace)
        else:
            print(f"Using workspace: {workspace.name}")

        # 2. Define Multilingual Posts
        # Note: In a real scenario, we'd use localized slugs or a locale column.
        # Here we follow the 'Saathibook' naming convention.
        posts_data = [
            {
                "title": "The Bhasha AI Revolution: Scaling Bharat's Digital Economy",
                "slug": "bhasha-ai-revolution",
                "ai_summary": "How multi-lingual AI architecture is empowering regional entrepreneurs.",
                "seo_title": "Bhasha AI Revolution | AITDL",
                "seo_description": "Empowering Bharat's entrepreneurs with Hindi, Sanskrit and English AI.",
                "tags": ["AI", "Bhasha", "Saathibook"],
                "content": [
                    { "type": "heading", "text": "Breaking the English Barrier" },
                    { "type": "paragraph", "text": "For decades, the digital economy in India was a walled garden. Saathibook is changing that..." }
                ]
            },
            {
                "title": "भाषा एआई क्रांति: भारत की डिजिटल अर्थव्यवस्था को आगे बढ़ाना",
                "slug": "bhasha-ai-revolution-hi",
                "ai_summary": "साथीबुक की त्रि-भाषी एआई वास्तुकला क्षेत्रीय उद्यमियों को सशक्त बना रही है।",
                "seo_title": "भाषा एआई क्रांति | AITDL",
                "seo_description": "हिंदी, संस्कृत और अंग्रेजी एआई के साथ भारत के उद्यमियों को सशक्त बनाना।",
                "tags": ["एआई", "भाषा", "साथीबुक"],
                "content": [
                    { "type": "heading", "text": "अंग्रेजी की बाधा को तोड़ना" },
                    { "type": "paragraph", "text": "दशकों से, भारत में डिजिटल अर्थव्यवस्था एक बंद बगीचे की तरह थी। साथीबुक इसे बदल रहा है..." }
                ]
            },
            {
                "title": "भाषा एआई-क्रांतिः: भारतस्य डिजिटल-अर्थव्यवस्थायाः संवर्धनम्",
                "slug": "bhasha-ai-revolution-sa",
                "ai_summary": "साथीबुक-माध्यमेन क्षेत्रीय-उद्यमिनः कथं सशक्तं भवन्ति।",
                "seo_title": "भाषा एआई-क्रांतिः | AITDL",
                "seo_description": "हिन्दी, संस्कृतम्, आङ्ग्लभाषा एआई इत्यस्य सहाय्येन भारतस्य उद्यमिनः सशक्तं करोति।",
                "tags": ["एआई", "भाषा", "साथीबुक"],
                "content": [
                    { "type": "heading", "text": "आङ्ग्लभाषायाः प्रतिबन्धस्य भङ्गः" },
                    { "type": "paragraph", "text": "दशकेभ्यः भारते डिजिटल-अर्थव्यवस्था एकं संवृतम् उद्यानम् आसीत्। साथीबुक एतत् परिवर्तयति..." }
                ]
            }
        ]

        # 3. Insert / Update
        for p in posts_data:
            q = select(BlogPost).where(BlogPost.slug == p["slug"], BlogPost.workspace_id == workspace.id)
            res = await session.execute(q)
            post = res.scalar_one_or_none()
            
            if post:
                print(f"   -> Updating: {p['slug']}")
                post.title = p["title"]
                post.content = p["content"]
                post.seo_title = p["seo_title"]
                post.seo_description = p["seo_description"]
                post.ai_summary = p["ai_summary"]
                post.status = "published"
                post.published_at = datetime.now(timezone.utc)
            else:
                print(f"   -> Publishing: {p['slug']}")
                post = BlogPost(
                    id=uuid.uuid4(), workspace_id=workspace.id,
                    title=p["title"], slug=p["slug"], content=p["content"],
                    status="published", tags=p["tags"], author_id="master-agent",
                    seo_title=p["seo_title"], seo_description=p["seo_description"],
                    ai_summary=p["ai_summary"], published_at=datetime.now(timezone.utc)
                )
                session.add(post)

        await session.commit()
        print("\nSUCCESS: 'The Bhasha AI Revolution' series published to database.")

if __name__ == "__main__":
    asyncio.run(publish_blog())
