// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// SSR · Partner Landing · SEO indexed · Form → POST /api/partner

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partner with AITDL — Reseller & Implementation Network',
  description: 'Join the AITDL partner network. Resell, implement, and earn with our Pan India technology platform. Mumbai · Nashik · Surat · Gorakhpur and beyond.',
  keywords: ['AITDL partner', 'Tally reseller', 'ERP partner India', 'school software reseller', 'technology partner'],
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

const CITIES = ['Mumbai', 'Nashik', 'Surat', 'Gorakhpur', 'Pune', 'Bangalore', 'Delhi', 'Other']
const OCCUPATIONS = [
  'IT Reseller / VAR',
  'Tally Partner',
  'School / Coaching Owner',
  'Retail Chain Owner',
  'Freelance Consultant',
  'System Integrator',
  'Other',
]

export default function PartnerPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-600/6 blur-[100px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-8">
            <span>🌏</span>
            <span>Pan India · Since 2007</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Grow with AITDL
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-4">
            Join India's most versatile technology partner network.
            Resell, implement, or white-label — your market, your way.
          </p>
          <p className="text-sm text-zinc-500 mb-12">
            Mumbai · Nashik · Surat · Gorakhpur · and every city in between
          </p>

          <a
            href="#apply"
            className="inline-block px-10 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
          >
            Apply to Partner →
          </a>
        </div>
      </section>

      {/* ── Partner Types ─────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-4">
            Three ways to partner
          </h2>
          <p className="text-zinc-500 text-center mb-14 max-w-lg mx-auto text-sm">
            Choose the model that fits your business. Most partners start as resellers and grow into implementers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PARTNER_TYPES.map((p) => (
              <div key={p.title} className={`rounded-2xl p-8 bg-gradient-to-br ${p.color} border ${p.border}`}>
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
          <div className="glass rounded-2xl p-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
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
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-3">
            Apply to Partner
          </h2>
          <p className="text-zinc-500 text-center text-sm mb-12">
            We review every application within 2 business days.
          </p>

          {/*
            Form posts to POST /api/partner via Next.js rewrite proxy → FastAPI
            FastAPI stores in partner_applications table + triggers WhatsApp notification
          */}
          <form
            action="/api/partner"
            method="POST"
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Full Name *</label>
                <input name="name" required placeholder="Your full name" className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Phone *</label>
                <input name="phone" required placeholder="10-digit mobile" className="form-input" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Email *</label>
              <input name="email" type="email" required placeholder="you@company.com" className="form-input" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">City *</label>
                <select name="city" required className="form-input">
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Current Occupation *</label>
                <select name="occupation" required className="form-input">
                  <option value="">Select occupation</option>
                  {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Why do you want to partner with AITDL?</label>
              <textarea
                name="message"
                rows={4}
                placeholder="Tell us about your existing business, your market, and what you hope to achieve..."
                className="form-input resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
            >
              Submit Application →
            </button>
            <p className="text-xs text-zinc-600 text-center">
              Partners: partners@aitdl.com &nbsp;·&nbsp; "See it. Love it. Then pay for it."
            </p>
          </form>
        </div>
      </section>

    </main>
  )
}
