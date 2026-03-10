import { getDictionary } from '@/lib/get-dictionary'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  return {
    title: dict.retail.seo.title,
    description: dict.retail.seo.description,
  }
}

const FEATURES = [
  {
    icon: '🧾',
    title: 'GST Compliant',
    desc: 'Full GST billing, returns filing, and reconciliation built-in. Stay compliant effortlessly.',
  },
  {
    icon: '🏪',
    title: 'Multi-Store',
    desc: 'Link all your branches to one Head Office. Centralised control over stock and pricing.',
  },
  {
    icon: '📊',
    title: 'Live Reports',
    desc: 'Sales, stock movement, and outstanding reports available in real-time from any device.',
  },
  {
    icon: '🛍️',
    title: 'Shoper 9 POS',
    desc: 'The gold standard for retail. Fast billing, barcode/RFID support, and customer loyalty.',
  },
  {
    icon: '📦',
    title: 'Inventory',
    desc: 'Advanced stock tracking with shelf-life management and automated re-ordering.',
  },
  {
    icon: '🤝',
    title: 'Customer Loyalty',
    desc: 'Built-in CRM to track purchases and reward your best customers automatically.',
  },
]

export default async function RetailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <main className="min-h-screen t-retail">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-600/8 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium mb-8">
            <span>🏪</span>
            <span>18+ Years · 100+ Live Stores · Pan India</span>
          </div>

          <h1 className="font-heading text-6xl md:text-8xl font-extrabold text-white mb-6 leading-none tracking-tight uppercase">
            {dict.retail.hero.title}
          </h1>

          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-4">
            {dict.retail.hero.subtitle}
          </p>
          <p className="text-sm text-zinc-500 mb-12">
            Mumbai · Nashik · Surat · Gorakhpur · and across Bharat
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="px-8 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors text-sm"
            >
              Book a Free Demo →
            </a>
            <a
              href={`/${locale}/explore`}
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
              <span className="text-white font-semibold">"See it. Love it. Then pay for it."</span>
              {' '}— Try Shoper working with your actual data before you commit.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-white text-center mb-4">
            Everything Your Store Needs
          </h2>
          <p className="text-zinc-500 text-center mb-16 max-lg mx-auto">
            A complete technological backbone for modern retailers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 hover:border-orange-500/20 transition-colors group">
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-heading text-2xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Form ───────────────────────────────────────── */}
      <section id="contact" className="px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-4xl font-bold text-white text-center mb-3">
            See it in action
          </h2>
          <p className="text-zinc-500 text-center text-sm mb-12">
            Schedule a free demo for your shop or retail chain.
          </p>

          <form
            action={`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`}
            method="POST"
            className="space-y-4"
          >
            <input type="hidden" name="section" value="retail" />
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
              <label className="block text-xs text-zinc-400 mb-1.5">Business Name</label>
              <input name="business" placeholder="Your store name" className="form-input" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Message</label>
              <textarea name="message" rows={3} placeholder="Tell us about your retail needs..." className="form-input resize-none" />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm transition-colors"
            >
              Book a Free Demo →
            </button>
          </form>
        </div>
      </section>

    </main>
  )
}
