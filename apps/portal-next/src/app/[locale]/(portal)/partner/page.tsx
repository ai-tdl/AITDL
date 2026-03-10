// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// SSR · Partner Landing · SEO indexed · Form → POST /api/partner

import { getDictionary } from '@/lib/get-dictionary'
import RevealOnScroll from '@/components/visual/RevealOnScroll'
import PartnerForm from '@/components/forms/PartnerForm'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  return {
    title: dict.partner.seo.title,
    description: dict.partner.seo.description,
  }
}

const PARTNER_TYPES = [
  {
    title: 'Reseller',
    icon: '🤝',
    desc: 'Sell AITDL products in your city or region. Earn recurring commissions on every renewal.',
    perks: ['Territory protection', 'Sales training', 'Marketing materials', 'Lead sharing'],
    color: 'from-violet-600/15 to-purple-600/5',
    border: 'border-violet-500/20',
  },
  {
    title: 'Implementer',
    icon: '🔧',
    desc: 'Install, configure and train clients. Build a services business on top of AITDL products.',
    perks: ['Technical certification', 'Support escalation', 'Implementation toolkit', 'Priority helpdesk'],
    color: 'from-blue-600/15 to-cyan-600/5',
    border: 'border-blue-500/20',
  },
  {
    title: 'White Label',
    icon: '🏷️',
    desc: 'Build your own brand on top of AITDL infrastructure. Full customisation for your market.',
    perks: ['Custom branding', 'Dedicated instance', 'SLA agreement', 'Joint GTM support'],
    color: 'from-emerald-600/15 to-teal-600/5',
    border: 'border-emerald-500/20',
  },
]

export default async function PartnerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <main className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-600/6 blur-[100px] rounded-full" />
        </div>

        <RevealOnScroll />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-8">
            <span>🌏</span>
            <span>Pan India · Since 2007</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight uppercase">
            {dict.partner.hero.title}
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-4">
            {dict.partner.hero.subtitle}
          </p>
          <p className="text-sm text-zinc-500 mb-12">
            Mumbai · Nashik · Surat · Gorakhpur · and every city in between
          </p>

          <a
            href="#apply"
            className="inline-block px-10 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
          >
            {dict.partner.cta} →
          </a>
        </div>
      </section>

      {/* ── Partner Types ─────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-4 rv uppercase tracking-tight">
            {dict.partner.types.title}
          </h2>
          <p className="text-zinc-500 text-center mb-14 max-w-lg mx-auto text-sm rv">
            {dict.partner.types.subtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PARTNER_TYPES.map((p) => (
              <div key={p.title} className={`rounded-2xl p-8 bg-gradient-to-br ${p.color} border ${p.border} rv`}>
                <span className="text-4xl mb-4 block">{p.icon}</span>
                <h3 className="font-display font-bold text-white text-xl mb-3">{p.title}</h3>
                <p className="text-sm text-zinc-300 mb-6 leading-relaxed">{p.desc}</p>
                <ul className="space-y-2">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="text-emerald-400">✓</span> {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-2xl p-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center rv">
            {[
              { value: '2007', label: 'Founded' },
              { value: '4+', label: 'Cities' },
              { value: '10+', label: 'Products' },
              { value: '∞', label: 'Opportunity' },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-extrabold text-white mb-1">{s.value}</p>
                <p className="text-xs text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Apply Form ────────────────────────────────────────── */}
      <section id="apply" className="px-6 py-24">
        <div className="max-w-2xl mx-auto rv">
          <p className="text-zinc-500 text-center text-sm mb-12">
            We review every application within 2 business days.
          </p>

          <PartnerForm dict={dict.partner.form} />
        </div>
      </section>

    </main>
  )
}
