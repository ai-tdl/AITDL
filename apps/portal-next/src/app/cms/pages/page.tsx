// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// CMS Pages Management — Client Component

'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function CMSPagesPage() {
  const supabase = createSupabaseBrowserClient()
  const [pages, setPages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPages() {
      const { data } = await supabase
        .from('pages')
        .select('*')
        .order('updated_at', { ascending: false })
      
      setPages(data || [])
      setIsLoading(false)
    }
    loadPages()
  }, [supabase])

  return (
    <div className="p-12">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold text-white mb-2 tracking-tight">Content Pages</h1>
          <p className="text-zinc-500 text-sm font-medium">Manage and deploy portal sections</p>
        </div>
        <button className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/20 uppercase tracking-widest">
          + New Page
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
             <p className="text-zinc-600 italic text-sm tracking-widest uppercase">Indexing pages...</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="col-span-full glass p-20 rounded-3xl border-white/5 text-center">
             <p className="text-zinc-500 text-sm mb-4">No custom pages found in this workspace.</p>
             <button className="text-violet-400 text-xs font-bold uppercase tracking-widest hover:text-violet-300">
               Initialize from Template →
             </button>
          </div>
        ) : pages.map(page => (
          <div key={page.id} className="glass p-8 rounded-3xl border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="px-2 py-1 rounded bg-white/10 text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Draft</span>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-violet-400 transition-colors uppercase tracking-tight">{page.title}</h3>
            <p className="text-xs text-zinc-500 font-mono mb-6">{page.slug}</p>
            
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                Modified {new Date(page.updated_at).toLocaleDateString()}
              </span>
              <div className="flex gap-4">
                <button className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest">View</button>
                <button className="text-[10px] font-bold text-violet-500 hover:text-violet-400 uppercase tracking-widest">Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
