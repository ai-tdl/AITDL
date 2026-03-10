// || ॐ श्री गणेशाय नमः ||
//
// Organization : AITDL — AI Technology Development Lab
// Creator      : Jawahar R. Mallah
// Web          : https://aitdl.com
// Build        : AITDL Platform V3 · Vikram Samvat 2082
// Copyright    : © aitdl.com · AITDL | GANITSUTRAM.com

// SSR · Public Blog Index · SEO indexed
// Fetches from GET /api/v1/cms/blog?status=published

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog — AITDL',
  description: 'Insights on AI, ERP, Education and Technology from AITDL.',
}

interface BlogPost {
  id: string
  title: string
  slug: string
  ai_summary: string | null
  published_at: string
  tags: string[]
}

async function getPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cms/blog?status=published`,
      { next: { revalidate: 60 } }  // ISR — revalidate every 60s
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function BlogIndexPage() {
  const posts = await getPosts()

  return (
    <main className="min-h-screen bg-brand-900 px-6 py-20 max-w-4xl mx-auto">
      <h1 className="text-5xl font-bold text-white mb-2">Blog</h1>
      <p className="text-purple-300 mb-12">Insights from AITDL</p>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts published yet.</p>
      ) : (
        <div className="space-y-8">
          {posts.map(post => (
            <article key={post.id} className="border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-semibold text-white hover:text-purple-300 transition-colors mb-2">
                  {post.title}
                </h2>
              </Link>
              {post.ai_summary && (
                <p className="text-gray-400 text-sm mb-3">{post.ai_summary}</p>
              )}
              <div className="flex gap-2 flex-wrap">
                {post.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-purple-900/50 text-purple-300 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3">
                {new Date(post.published_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
