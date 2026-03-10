// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// SSR · Ecommerce Persona Page · SEO indexed

import type { Metadata } from 'next'
import RevealOnScroll from '@/components/visual/RevealOnScroll'

export const metadata: Metadata = {
  title: 'Ecommerce Solutions — AI-Powered Bharat Storefronts',
  description: 'Sell globally from India with AITDL. High-performance storefronts, intelligent inventory sync, and AI-driven growth for Indian brands.',
  keywords: ['Ecommerce India', 'AI Storefront', 'Inventory Sync', 'Omnichannel Retail', 'AITDL Ecom'],
}

const HIGHLIGHTS = [
  {
    icon: '🛒',
    title: 'Cinematic Storefront',
    desc: 'High-speed, high-fidelity shopping experiences that convert visitors into loyal customers.',
  },
  {
    icon: '📦',
    title: 'Omnichannel Sync',
    desc: 'Sync stock across your warehouse, physical shops, and online store in real-time.',
  },
  {
    icon: '🤖',
    title: 'AI Growth Engine',
    desc: 'Predictive analytics to manage stock and personalized recommendations for every buyer.',
  },
  {
    icon: '💳',
    title: 'Unified Payments',
    desc: 'Integrated with all major Indian gateways. Credit, UPI, and EMI support out-of-the-box.',
  },
];

export default function EcomPage() {
  return (
    <main className="min-h-screen t-ecom">
      <section className="relative px-6 pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/8 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8">
            <span>🛒</span>
            <span>Scaling High-Growth Brands · Pan India</span>
          </div>

          <h1 className="font-heading text-6xl md:text-8xl font-extrabold text-white mb-6 leading-none tracking-tight">
            E-COM.<br /><span className="text-gradient">SELL SMARTER.</span>
          </h1>

          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-4">
            Next-generation commerce infrastructure for the future of Indian retail.
          </p>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="glass rounded-2xl p-6 hover:border-indigo-500/20 transition-all rv">
              <span className="text-3xl mb-4 block">{h.icon}</span>
              <h3 className="text-white font-bold text-lg mb-2">{h.title}</h3>
              <p className="text-sm text-zinc-400">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      <RevealOnScroll />
    </main>
  );
}
