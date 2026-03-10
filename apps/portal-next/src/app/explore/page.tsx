# || ॐ श्री गणेशाय नमः ||
#
# Organization : AITDL — AI Technology Development Lab
# Creator      : Jawahar R. Mallah
# Web          : https://aitdl.com
# Build        : AITDL Platform V3 · Vikram Samvat 2082
# Copyright    : © aitdl.com · AITDL | GANITSUTRAM.com

// SSR · Explore Universe · SEO indexed
// All AITDL products and solutions

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore — AITDL Universe',
  description: 'Retail POS · ERP & Tally · School Management · AI Learning Tools. Pan India since 2007.',
}

const PRODUCTS = [
  { name: 'GanitSūtram',    href: '/ganitsutram',  desc: 'AI Mathematics Learning Platform',        color: 'from-blue-600 to-cyan-900'    },
  { name: 'Dailyboard',     href: '/dailyboard',   desc: 'Daily Productivity & Team Sync',          color: 'from-violet-600 to-purple-900'},
  { name: 'Retail POS',     href: '/retail',       desc: 'Modern Point-of-Sale for retail stores',  color: 'from-orange-600 to-orange-900'},
  { name: 'School ERP',     href: '/school',       desc: 'Complete school management system',       color: 'from-green-600 to-green-900'  },
  { name: 'Ecommerce',      href: '/ecommerce',    desc: 'End-to-end ecommerce solutions',          color: 'from-pink-600 to-rose-900'    },
  { name: 'AI Pathsala',    href: '/pathsala',     desc: 'AI-powered learning for every student',   color: 'from-yellow-600 to-amber-900' },
]

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-brand-900 px-6 py-20 max-w-6xl mx-auto">
      <h1 className="text-5xl font-bold text-white mb-3">AITDL Universe</h1>
      <p className="text-purple-300 text-xl mb-12">Technology Solutions · Pan India · Since 2007</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRODUCTS.map(p => (
          <a key={p.href} href={p.href}
            className={`p-8 rounded-2xl bg-gradient-to-br ${p.color} border border-white/10
              hover:border-white/30 transition-all hover:scale-105 hover:shadow-2xl group`}>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-white/80">{p.name}</h2>
            <p className="text-sm text-white/70">{p.desc}</p>
          </a>
        ))}
      </div>
    </main>
  )
}
