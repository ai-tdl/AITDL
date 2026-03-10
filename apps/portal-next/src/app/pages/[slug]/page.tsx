// || ॐ श्री गणेशाय नमः ||
//
// Organization : AITDL — AI Technology Development Lab
// Creator      : Jawahar R. Mallah
// Web          : https://aitdl.com
// Build        : AITDL Platform V3 · Vikram Samvat 2082
// Copyright    : © aitdl.com · AITDL | GANITSUTRAM.com

// SSR · Dynamic CMS Page Renderer · SEO indexed
// Fetches from GET /api/v1/cms/pages?slug={slug}&status=published

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface CMSPage {
  id: string; title: string; slug: string
  seo_title: string | null; seo_description: string | null
  status: string; published_at: string | null
}

async function getCMSPage(slug: string): Promise<CMSPage | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cms/pages?slug=${slug}`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return null
    const pages: CMSPage[] = await res.json()
    return pages.find(p => p.slug === slug && p.status === 'published') ?? null
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const page = await getCMSPage(params.slug)
  if (!page) return { title: 'Page Not Found — AITDL' }
  return {
    title: page.seo_title ?? page.title,
    description: page.seo_description ?? '',
  }
}

export default async function CMSPageRenderer({ params }: { params: { slug: string } }) {
  const page = await getCMSPage(params.slug)
  if (!page) notFound()

  return (
    <main className="min-h-screen bg-brand-900 px-6 py-20 max-w-5xl mx-auto">
      <h1 className="text-5xl font-bold text-white mb-8">{page.title}</h1>
      {/* TODO: Render blocks via GET /api/v1/cms/pages/{page.id}/blocks */}
      <p className="text-gray-500">Page content loading...</p>
    </main>
  )
}
