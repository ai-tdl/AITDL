// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// CMS AI Tools Hub — Client Component

'use client'

import { useState } from 'react'

export default function CMSAIPage() {
  const [tools] = useState([
    { id: 'maths', name: 'Maths Lab (GanitSūtram)', status: 'Active', icon: '📐' },
    { id: 'autocorrect', name: 'AutoCorrect Engine', status: 'Active', icon: '📝' },
    { id: 'seo', name: 'SEO Content Gen', status: 'Experimental', icon: '🔍' },
  ])

  return (
    <div className="p-12">
      <header className="mb-12">
        <h1 className="font-display text-4xl font-bold text-white mb-2 tracking-tight">AI Studio</h1>
        <p className="text-zinc-500 text-sm font-medium">Intelligence layer management and orchestration</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tools.map(tool => (
          <div key={tool.id} className="glass p-8 rounded-3xl border-white/5 hover:border-violet-500/10 transition-all group">
            <div className="flex justify-between items-start mb-6">
               <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{tool.icon}</span>
               <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                 tool.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
               }`}>
                 {tool.status}
               </span>
            </div>
            
            <h3 className="text-white font-bold group-hover:text-violet-400 transition-colors tracking-tight">{tool.name}</h3>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1 mb-6 font-bold">Model: AITDL-GPT-4o</p>
            
            <button className="w-full py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] text-white font-bold uppercase tracking-widest group-hover:border-violet-500/20 transition-all">
              Configure Agent →
            </button>
          </div>
        ))}
        
        <div className="glass p-8 rounded-3xl border-white/5 border-dashed flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
           <span className="text-xl mb-2 text-zinc-500">+</span>
           <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Register New Agent</p>
        </div>
      </div>
    </div>
  )
}
