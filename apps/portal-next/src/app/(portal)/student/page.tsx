// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// SSR · Student Hub Page · SEO indexed

import type { Metadata } from 'next'
import RevealOnScroll from '@/components/visual/RevealOnScroll'

export const metadata: Metadata = {
  title: 'Student Hub — AI Learning & Gamified Growth',
  description: 'Your gateway to intelligent learning in India. GanitSūtram for Maths, AutoCorrect for language, and personalised AI study paths.',
  keywords: ['Student Hub India', 'GanitSutram', 'AutoCorrect', 'AI Learning App', 'AITDL Student'],
}

const TOOLS = [
  {
    title: 'GanitSūtram',
    slug: 'ganitsutram',
    icon: '🧮',
    desc: 'The ultimate AI Maths companion. Solve, learn, and master mathematics with a gamified journey.',
    color: 'from-orange-500/20 to-yellow-500/5'
  },
  {
    title: 'AutoCorrect',
    slug: 'autocorrect',
    icon: '✍️',
    desc: 'Master languages with real-time AI feedback on your writing, grammar, and style.',
    color: 'from-blue-500/20 to-cyan-500/5'
  },
  {
    title: 'My AI Pathasala',
    slug: 'myaipathasala',
    icon: '📚',
    desc: 'A personalised AI tutor for all subjects. Your private digital classroom, available 24/7.',
    color: 'from-purple-500/20 to-pink-500/5'
  }
];

export default function StudentHubPage() {
  return (
    <main className="min-h-screen t-ai">
      <section className="relative px-6 pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/8 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-8">
            <span>🎓</span>
            <span>Your Personalised AI Learning Universe</span>
          </div>

          <h1 className="font-heading text-6xl md:text-8xl font-extrabold text-white mb-6 leading-none tracking-tight">
            STUDENTS.<br /><span className="text-gradient">LEARN FASTER.</span>
          </h1>

          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-4">
            Master any subject with the power of AITDL's specialized AI tools.
          </p>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOOLS.map((t) => (
            <a 
              key={t.title} 
              href={`/student/tools/${t.slug}`} 
              className={`glass rounded-3xl p-8 bg-gradient-to-br ${t.color} border-white/5 hover:scale-[1.02] transition-all group rv`}
            >
              <span className="text-5xl mb-6 block">{t.icon}</span>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">{t.title}</h3>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{t.desc}</p>
              <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                Open Tool <span className="text-lg">→</span>
              </span>
            </a>
          ))}
        </div>
      </section>
      
      <RevealOnScroll />
    </main>
  );
}
