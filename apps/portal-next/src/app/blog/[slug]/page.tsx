// || ॐ श्री गणेशाय नमः ||
//
// Organization : AITDL — AI Technology Development Lab
// Creator      : Jawahar R. Mallah
// Web          : https://aitdl.com
// Build        : AITDL Platform V3 · Vikram Samvat 2082
// Copyright    : © aitdl.com · AITDL | GANITSUTRAM.com

// SSR · Individual Blog Post · SEO indexed with generateMetadata
// Fetches from GET /api/v1/cms/blog?slug={slug}&status=published

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface BlogPost {
  id: string; title: string; slug: string
  content: any[]; ai_summary: string | null
  seo_title: string | null; seo_description: string | null
  published_at: string; tags: string[]
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cms/blog?slug=${slug}&status=published`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return null
    const posts: BlogPost[] = await res.json()
    return posts.find(p => p.slug === slug) ?? null
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post Not Found — AITDL' }
  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.ai_summary ?? '',
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <main className="min-h-screen bg-brand-900 px-6 py-20 max-w-3xl mx-auto">
      <a href="/blog" className="text-sm text-gray-500 hover:text-purple-400 mb-8 block">
        ← Back to Blog
      </a>
      <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
      <p className="text-xs text-gray-500 mb-10">
        Published {new Date(post.published_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
      </p>
      {/* Content renderer — blocks to JSX */}
      <div className="prose prose-invert max-w-none">
        {post.content.map((block: any, i: number) => (
          <div key={i}>{JSON.stringify(block)}</div>
        ))}
      </div>
    </main>
  )
}
