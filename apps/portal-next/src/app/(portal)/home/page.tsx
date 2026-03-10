// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// SSR · Home & Family Persona Page · SEO indexed

import type { Metadata } from 'next'
import RevealOnScroll from '@/components/visual/RevealOnScroll'

export const metadata: Metadata = {
  title: 'Home & Family — AI Study Buddy & Family Accounts',
  description: 'Bringing AI to every Indian household. Personalised home tutoring (GanitSūtram) and intelligent family budgeting (Saathi Book).',
  keywords: ['Home AI India', 'Family Budgeting App', 'Home Study Buddy', 'Saathi Book', 'AITDL Home'],
}

const PRODUCTS = [
  {
    title: 'Home Study Buddy',
    icon: '📖',
    desc: 'An AI-powered tutor that helps your children master subjects with gamified challenges and real-time help.',
    status: 'Coming Soon',
    color: 'from-pink-500/20 to-rose-500/5'
  },
  {
    title: 'Saathi Book',
    icon: '📒',
    desc: 'The intelligent family account book. Track expenses, manage budgets, and plan your family\'s financial future with AI insights.',
    status: 'Beta Access',
    color: 'from-blue-500/20 to-indigo-500/5'
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen t-home">
      <section className="relative px-6 pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-rose-600/8 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium mb-8">
            <span>👨‍👩‍👧</span>
            <span>AI for every Bharat Household · Since 2007</span>
          </div>

          <h1 className="font-heading text-6xl md:text-8xl font-extrabold text-white mb-6 leading-none tracking-tight">
            HOME.<br /><span className="text-gradient">LIVE BETTER.</span>
          </h1>

          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-4">
            Empower your family with intelligent tools for learning and financial growth.
          </p>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {PRODUCTS.map((p) => (
            <div key={p.title} className={`glass rounded-3xl p-10 bg-gradient-to-br ${p.color} border-white/5 rv`}>
              <div className="flex justify-between items-start mb-8">
                <span className="text-5xl">{p.icon}</span>
                <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-white/10 text-white/50">{p.status}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{p.title}</h3>
              <p className="text-zinc-400 mb-8 leading-relaxed">{p.desc}</p>
              <button className="text-sm font-bold text-white uppercase tracking-widest hover:text-rose-400 transition-colors">Notify Me →</button>
            </div>
          ))}
        </div>
      </section>
      
      <RevealOnScroll />
    </main>
  );
}
