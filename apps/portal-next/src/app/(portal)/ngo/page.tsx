// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// SSR · NGO & Trust Persona Page · SEO indexed

import type { Metadata } from 'next'
import RevealOnScroll from '@/components/visual/RevealOnScroll'

export const metadata: Metadata = {
  title: 'NGO & Trust — Social Impact & Fund Tracking',
  description: 'Technology for good in Bharat. Track donations, manage volunteers, and generate transparent impact reports with AITDL AI. Trusted by non-profits.',
  keywords: ['NGO Software India', 'Trust Management', 'Donation Tracking', 'Social Impact AI', 'AITDL NGO'],
}

const FEATURES = [
  {
    icon: '🏛️',
    title: 'Trust Management',
    desc: 'Complete administrative suite for managing trustees, meetings, and legal compliance.',
  },
  {
    icon: '🤝',
    title: 'Volunteer Network',
    desc: 'Organize and track volunteer contributions across multiple cities and projects.',
  },
  {
    icon: '📈',
    title: 'Impact Reporting',
    desc: 'Generate real-time, transparent reports on how every rupee is making a difference.',
  },
  {
    icon: '📜',
    title: 'Audit Ready',
    desc: 'Everything logged and ready for 80G/12A compliance and annual audits.',
  },
];

export default function NGOPage() {
  return (
    <main className="min-h-screen t-ngo">
      <section className="relative px-6 pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-600/8 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium mb-8">
            <span>🌏</span>
            <span>Technology for a Better Bharat · Since 2007</span>
          </div>

          <h1 className="font-heading text-6xl md:text-8xl font-extrabold text-white mb-6 leading-none tracking-tight">
            IMPACT.<br /><span className="text-gradient">RUN BETTER.</span>
          </h1>

          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-4">
            Transparent, intelligent, and scalable solutions for social change.
          </p>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:border-teal-500/20 transition-all rv">
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
