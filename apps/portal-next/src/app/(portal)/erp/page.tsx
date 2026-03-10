// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// SSR · ERP & Business Page · SEO indexed

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Business ERP & Tally Solutions — TallyPrime · TallyTDL · ERPNext',
  description: 'Custom ERP and Tally solutions for Indian businesses. TallyPrime, TallyTDL projects, ERPNext, and Odoo implementations. 18 years of expertise.',
  keywords: ['Business ERP', 'TallyPrime', 'TallyTDL', 'ERPNext India', 'Business Automation', 'AITDL'],
  openGraph: {
    title: 'Business ERP & Tally Solutions | AITDL',
    description: 'Scalable ERP solutions for manufacturing, trading, and services. TallyPrime & automation.',
  },
}

const SOLUTIONS = [
  {
    icon: '⚙️',
    title: 'TallyPrime',
    desc: 'Licensing, installation, and support for India\'s #1 accounting software. Multi-user and server editions.',
  },
  {
    icon: '📜',
    title: 'TallyTDL',
    desc: 'Custom Tally development to fit your unique business processes. Add fields, reports, and controls to Tally.',
  },
  {
    icon: '🌍',
    title: 'Modern ERP',
    desc: 'Full-scale cloud ERP implementations using ERPNext and Odoo. Built for growth and scalability.',
  },
  {
    icon: '🔄',
    title: 'Automation',
    desc: 'Connect your various business tools. Automated data sync between POS, Ecommerce, and Accounting.',
  },
  {
    icon: '📈',
    title: 'BI & Reports',
    desc: 'Advanced dashboards and business intelligence to give you a clear view of your company\'s health.',
  },
  {
    icon: '🛡️',
    title: 'Consultation',
    desc: 'Expert advice on picking the right software stack for your industry — trading, manufacturing, or services.',
  },
]

export default function ERPPage() {
  return (
    <main className="min-h-screen t-erp">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/8 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-8">
            <span>⚙️</span>
            <span>Tally Partner · ERP Specialists · Since 2007</span>
          </div>

          <h1 className="font-heading text-6xl md:text-8xl font-extrabold text-white mb-6 leading-none tracking-tight">
            BUSINESS.<br /><span className="text-gradient">RUN SMART.</span>
          </h1>

          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-4">
            Custom ERP and Tally solutions built for the complexity of Indian business.
          </p>
          <p className="text-sm text-zinc-500 mb-12">
            Manufacturing · Trading · Services · Retail
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors text-sm"
            >
              Book Free Consultation →
            </a>
            <a
              href="/explore"
              className="px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/25 text-white font-medium transition-colors text-sm"
            >
              See All Products
            </a>
          </div>
        </div>
      </section>

      {/* ── Brand Promise ──────────────────────────────────────── */}
      <section className="px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-2xl px-8 py-5 flex items-center justify-center">
            <p className="text-zinc-400 text-sm text-center">
              <span className="text-white font-semibold">18 Years of Expertise</span>
              {' '}— We bridge the gap between business needs and technical solutions.
            </p>
          </div>
        </div>
      </section>

      {/* ── Solutions Grid ───────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-white text-center mb-4">
            ERP Solutions for Every Scale
          </h2>
          <p className="text-zinc-500 text-center mb-16 max-w-lg mx-auto">
            From single-user Tally to enterprise-grade ERP clusters.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SOLUTIONS.map((s) => (
              <div key={s.title} className="glass rounded-2xl p-6 hover:border-blue-500/20 transition-colors group">
                <span className="text-3xl mb-4 block">{s.icon}</span>
                <h3 className="font-heading text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Form ───────────────────────────────────────── */}
      <section id="contact" className="px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-4xl font-bold text-white text-center mb-3">
            Let's Talk Business
          </h2>
          <p className="text-zinc-500 text-center text-sm mb-12">
            Get a free consultation on the right ERP for your industry.
          </p>

          <form
            action={`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`}
            method="POST"
            className="space-y-4"
          >
            <input type="hidden" name="section" value="erp" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Full Name *</label>
                <input name="name" required placeholder="Your name" className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Phone *</label>
                <input name="phone" required placeholder="9876543210" className="form-input" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Company / Business</label>
              <input name="business" placeholder="Your company name" className="form-input" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Message</label>
              <textarea name="message" rows={3} placeholder="What are your current accounting or ERP challenges?" className="form-input resize-none" />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
            >
              Book Free Consultation →
            </button>
          </form>
        </div>
      </section>

    </main>
  )
}
