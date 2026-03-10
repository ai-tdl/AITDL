// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// CMS Blog Management — Client Component

'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function CMSBlogPage() {
  const supabase = createSupabaseBrowserClient()
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPosts() {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false })
      
      setPosts(data || [])
      setIsLoading(false)
    }
    loadPosts()
  }, [supabase])

  return (
    <div className="p-12">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold text-white mb-2 tracking-tight">Blog Articles</h1>
          <p className="text-zinc-500 text-sm font-medium">Thought leadership and workspace updates</p>
        </div>
        <button className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/20 uppercase tracking-widest">
          + Draft Post
        </button>
      </header>

      <div className="glass rounded-3xl border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/2">
              <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Post Title</th>
              <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Categories</th>
              <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
              <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-zinc-600 text-xs italic tracking-widest uppercase">Fetching entries...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-zinc-500 text-sm font-medium">The blog is currently empty. Start writing your first story.</td></tr>
            ) : posts.map(post => (
              <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-5">
                  <p className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors uppercase tracking-tight">{post.title}</p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{post.slug}</p>
                </td>
                <td className="px-8 py-5">
                   <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${
                     post.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border border-white/5'
                   }`}>
                     {post.status || 'Draft'}
                   </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex gap-2">
                    {post.categories?.map((cat: string) => (
                      <span key={cat} className="text-[10px] text-zinc-600 border border-white/5 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                        {cat}
                      </span>
                    )) || <span className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Uncategorized</span>}
                  </div>
                </td>
                <td className="px-8 py-5 text-[10px] font-mono text-zinc-500">
                  {new Date(post.published_at || post.created_at).toLocaleDateString()}
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-[10px] font-bold text-violet-500 hover:text-violet-400 uppercase tracking-widest">Edit Entry →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
