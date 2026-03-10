# || ॐ श्री गणेशाय नमः ||

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from cms_core.models.cms_tables import Page, Block, Card, BlogPost, CMSForm

async def seed_new_workspace(workspace_id: uuid.UUID, db: AsyncSession, admin_email: str = "system@aitdl.com"):
    """
    Seeds a newly created workspace with default content so the client
    doesn't start with an empty dashboard.
    """
    
    # 1. Default Form Configuration
    contact_form_id = uuid.uuid4()
    form = CMSForm(
        id=contact_form_id,
        workspace_id=workspace_id,
        title="Contact Us",
        slug="contact",
        fields=[
            {"name": "name", "label": "Full Name", "type": "text", "required": True},
            {"name": "email", "label": "Email Address", "type": "email", "required": True},
            {"name": "message", "label": "How can we help you?", "type": "textarea", "required": True}
        ],
        success_message="Thank you for reaching out. We will get back to you shortly."
    )
    db.add(form)

    # 2. Default Home Page
    page_id = uuid.uuid4()
    page = Page(
        id=page_id,
        workspace_id=workspace_id,
        title="Home",
        slug="home",
        status="published",
        template="landing",
        created_by=admin_email,
        last_modified_by=admin_email
    )
    db.add(page)

    # 3. Default Hero Block for Home Page
    hero_block = Block(
        id=uuid.uuid4(),
        page_id=page_id,
        type="hero",
        sort_order=0,
        config={
            "title": "Welcome to your new platform.",
            "subtitle": "You can edit this content right from the CMS Studio.",
            "cta_text": "Contact Us",
            "cta_url": "/contact"
        }
    )
    db.add(hero_block)

    # 4. Default Blog Post
    blog = BlogPost(
        id=uuid.uuid4(),
        workspace_id=workspace_id,
        title="Welcome to your CMS Studio",
        slug="welcome",
        status="published",
        author_id=admin_email,
        content=[
            {
                "type": "paragraph",
                "children": [{"text": "Hello! This is your first blog post. You can edit it or delete it from the CMS Studio."}]
            }
        ]
    )
    db.add(blog)

    # 5. Default Card
    card = Card(
        id=uuid.uuid4(),
        workspace_id=workspace_id,
        title="Sample Service",
        description="A placeholder card for your services or features grid.",
        tags=["default"]
    )
    db.add(card)

    await db.commit()
    return True
