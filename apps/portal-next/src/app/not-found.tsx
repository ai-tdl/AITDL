'use client'
// ॥ ॐ श्री गणेशाय नमः ॥
// Organization: AITDL · Creator: Jawahar R. Mallah
// Cinematic 404 - Not Found Page

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6 text-center">
      
      {/* Background Decor (Consistent with Gate) */}
      <div className="orb w-[600px] h-[600px] bg-violet-600/5 top-[-300px] left-[-300px] animate-pulse" />
      <div className="orb w-[500px] h-[500px] bg-amber-500/5 bottom-[-200px] right-[-200px] animate-pulse" />

      <div className="relative z-10 fade-up max-w-2xl">
        
        {/* Spiritual Signature */}
        <div className="flex flex-col items-center mb-12 opacity-40">
           <span className="text-[10px] tracking-[0.4em] font-mono text-zinc-500 uppercase">॥ ॐ श्री गणेशाय नमः ॥</span>
           <div className="h-[1px] w-12 bg-zinc-800 my-4" />
        </div>

        <h1 className="text-8xl md:text-[12rem] font-heading leading-tight tracking-[0.05em] text-white/10 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full blur-sm">
          404
        </h1>

        <div className="badge-cs mb-6">LOST IN THE UNIVERSE</div>
        
        <h2 className="text-4xl md:text-6xl font-heading text-white mb-6 uppercase tracking-tight">
          Destined to <span className="text-violet-500 italic">Reconnect.</span>
        </h2>
        
        <p className="text-zinc-500 text-lg md:text-xl font-medium mb-12 leading-relaxed max-w-lg mx-auto">
          "Even when a path is not found, the legacy remains. Let us guide you back to the centers of our intelligence."
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link 
            href="/"
            className="px-10 py-4 glass border border-white/10 rounded-2xl text-white font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all hover:scale-105 active:scale-95"
          >
            Return to Gate
          </Link>
          
          <Link 
            href="/explore"
            className="px-10 py-4 bg-violet-600 rounded-2xl text-white font-bold uppercase tracking-widest text-xs hover:bg-violet-500 transition-all shadow-xl shadow-violet-600/20 hover:scale-105 active:scale-95"
          >
            Explore Universe
          </Link>
        </div>

        {/* Footer Lesson */}
        <div className="mt-20 opacity-30">
           <p className="text-[9px] font-mono tracking-[0.2em] text-zinc-600 uppercase">
             Error Code: AITDL-SOVEREIGN-RECOIL-404
           </p>
        </div>

      </div>

    </div>
  )
}
