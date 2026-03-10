// Individual Blog Post page with i18n support
//
// Organization : AITDL — AI Technology Development Lab
// Creator      : Jawahar R. Mallah
// Web          : https://aitdl.com
// Build        : AITDL Platform V3 · Vikram Samvat 2082
// Copyright    : © aitdl.com · AITDL | GANITSUTRAM.com

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDictionary } from '@/lib/get-dictionary'

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
  { params }: { params: Promise<{ locale: string, slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post Not Found — AITDL' }
  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.ai_summary ?? '',
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await params
  const dict = await getDictionary(locale)
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <main className="min-h-screen px-6 py-32 max-w-3xl mx-auto">
      <Link 
        href={`/${locale}/blog`} 
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 hover:text-indigo-400 transition-colors mb-12 rv"
      >
        <span className="text-sm">←</span> {dict.blog.header.title}
      </Link>
      
      <div className="rv mb-12">
        <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white mb-6 uppercase tracking-tighter leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-6">
          <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
            {new Date(post.published_at).toLocaleDateString(locale === 'hi' ? 'hi-IN' : locale === 'sa' ? 'hi-IN' : 'en-IN', { dateStyle: 'long' })}
          </p>
          <div className="flex gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-[9px] px-2 py-0.5 bg-white/5 text-zinc-500 rounded border border-white/5 uppercase tracking-widest font-mono">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-8 md:p-12 border-white/5 rv">
        {/* Content renderer — blocks to JSX */}
        <div className="prose prose-invert max-w-none prose-p:text-zinc-400 prose-p:leading-relaxed prose-headings:text-white prose-headings:uppercase prose-headings:font-display prose-a:text-indigo-400 hover:prose-a:text-indigo-300">
          {post.content.map((block: any, i: number) => (
            <div key={i} className="mb-8">
              {block.type === 'paragraph' && <p>{block.text}</p>}
              {block.type === 'heading' && <h3 className="text-2xl font-bold mt-12 mb-6">{block.text}</h3>}
              {block.type === 'image' && (
                <figure className="my-10">
                  <img src={block.url} alt={block.caption || ''} className="rounded-2xl border border-white/10 w-full" />
                  {block.caption && <figcaption className="text-center text-[10px] text-zinc-600 font-mono mt-4 uppercase tracking-widest">{block.caption}</figcaption>}
                </figure>
              )}
              {/* Fallback for raw JSON if direct mapping fails */}
              {!['paragraph', 'heading', 'image'].includes(block.type) && <pre className="text-[10px] bg-black/20 p-4 rounded overflow-x-auto">{JSON.stringify(block, null, 2)}</pre>}
            </div>
          ))}
        </div>

        {/* Author Details Section */}
        <div className="mt-20 pt-12 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center p-0.5 overflow-hidden">
                <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center text-2xl font-display font-bold text-white/50 group-hover:text-white/80 transition-colors">
                  JM
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 mb-2 block">
                {dict.blog.author.label}
              </span>
              <h4 className="text-xl font-display font-bold text-white mb-1 uppercase tracking-tight">
                {dict.blog.author.name}
              </h4>
              <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">
                {dict.blog.author.title}
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                {dict.blog.author.bio}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
