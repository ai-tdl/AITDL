// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// SSR · Teacher Persona Page · SEO indexed

import type { Metadata } from 'next'
import RevealOnScroll from '@/components/visual/RevealOnScroll'

export const metadata: Metadata = {
  title: 'For Teachers — AI Evaluation & Batch Management',
  description: 'Empowering Bharat\'s educators with AI. Automated paper checking, batch performance analytics, and digital classrooms. Built for the modern teacher.',
  keywords: ['Teacher AI Tools', 'AI Paper Evaluation India', 'Batch Management', 'Digital Classroom', 'AITDL Teacher'],
}

const FEATURES = [
  {
    icon: '📝',
    title: 'AI Evaluation',
    desc: 'Auto-grade subjective and objective tests. Gain deep insights into student learning gaps instantly.',
  },
  {
    icon: '📊',
    title: 'Batch Analytics',
    desc: 'Track progress across entire batches. Identify toppers and students who need extra support with one click.',
  },
  {
    icon: '📅',
    title: 'Smart Planner',
    desc: 'Automated lesson plans and timetable syncing. Spend less time on admin and more time on teaching.',
  },
  {
    icon: '🤝',
    title: 'Parent Connect',
    desc: 'Seamlessly share progress reports and attendance. Build a stronger bridge between home and school.',
  },
];

export default function TeacherPage() {
  return (
    <main className="min-h-screen t-education">
      <section className="relative px-6 pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/8 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-8">
            <span>👩‍🏫</span>
            <span>Empowering 50,000+ Educators · AI-Driven Guidance</span>
          </div>

          <h1 className="font-heading text-6xl md:text-8xl font-extrabold text-white mb-6 leading-none tracking-tight">
            TEACHERS.<br /><span className="text-gradient">TEACH BETTER.</span>
          </h1>

          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-4">
            Focus on inspiration. Let AITDL handle the evaluation and administration.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <a href="#contact" className="btn-premium btn-premium-emerald px-10">Start Teaching Smart →</a>
            <a href="/explore" className="px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/25 text-white font-medium transition-colors text-sm">Explore Tools</a>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:border-emerald-500/20 transition-all rv">
              <span className="text-3xl mb-4 block">{f.icon}</span>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      <RevealOnScroll />
    </main>
  );
}
