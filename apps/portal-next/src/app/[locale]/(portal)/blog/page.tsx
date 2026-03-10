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
import { getDictionary } from '@/lib/get-dictionary'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale)
  return {
    title: dict.blog.seo.title,
    description: dict.blog.seo.description,
  }
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

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const posts = await getPosts()

  return (
    <main className="min-h-screen px-6 py-32 max-w-4xl mx-auto">
      <div className="rv mb-16">
        <h1 className="text-6xl font-display font-extrabold text-white mb-4 uppercase tracking-tighter">
          {dict.blog.header.title}
        </h1>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">
          {dict.blog.header.subtitle}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center rv">
           <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">{dict.blog.noPosts}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map(post => (
            <article key={post.id} className="glass rounded-2xl p-8 hover:border-indigo-500/30 transition-all group rv">
              <Link href={`/${locale}/blog/${post.slug}`}>
                <h2 className="text-3xl font-display font-bold text-white group-hover:text-indigo-400 transition-colors mb-4 uppercase tracking-tight">
                  {post.title}
                </h2>
              </Link>
              {post.ai_summary && (
                <p className="text-zinc-400 leading-relaxed mb-6 font-light">{post.ai_summary}</p>
              )}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/10 uppercase tracking-widest font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                  {new Date(post.published_at).toLocaleDateString(locale === 'hi' ? 'hi-IN' : locale === 'sa' ? 'hi-IN' : 'en-IN', { dateStyle: 'long' })}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
