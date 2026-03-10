// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// SSR · Contact Page · SEO indexed · Form → POST /api/contact

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact AITDL',
  description: 'Get in touch with AITDL. Mumbai · Nashik · Surat · Gorakhpur. contact@aitdl.com',
  openGraph: {
    title: 'Contact AITDL',
    description: 'Reach us for products, partnerships, or support.',
  },
}

const SECTIONS = [
  { value: 'general',      label: 'General Enquiry' },
  { value: 'ganitsutram',  label: 'GanitSūtram' },
  { value: 'dailyboard',   label: 'Dailyboard' },
  { value: 'retail',       label: 'Retail POS / Shoper' },
  { value: 'erp',          label: 'ERP / TallyPrime' },
  { value: 'education',    label: 'School / Coaching ERP' },
  { value: 'partner',      label: 'Partnership' },
]

export default function ContactPage() {
  return (
    <main className="min-h-screen px-6 py-20">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl font-extrabold text-white mb-4">Get in Touch</h1>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Questions about products, pricing, or partnerships — we reply within 1 business day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* ── Contact Info ───────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Direct Contact</p>
              <ul className="space-y-4">
                <li>
                  <p className="text-xs text-zinc-500 mb-1">General</p>
                  <a href="mailto:contact@aitdl.com" className="text-white hover:text-purple-300 transition-colors text-sm">
                    contact@aitdl.com
                  </a>
                </li>
                <li>
                  <p className="text-xs text-zinc-500 mb-1">Partners</p>
                  <a href="mailto:partners@aitdl.com" className="text-white hover:text-purple-300 transition-colors text-sm">
                    partners@aitdl.com
                  </a>
                </li>
                <li>
                  <p className="text-xs text-zinc-500 mb-1">Founder</p>
                  <a href="mailto:jawahar@aitdl.com" className="text-white hover:text-purple-300 transition-colors text-sm">
                    jawahar@aitdl.com
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Cities</p>
              <ul className="space-y-2 text-sm text-zinc-300">
                {['Mumbai', 'Nashik', 'Surat', 'Gorakhpur'].map(city => (
                  <li key={city} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-purple-500 shrink-0" />
                    {city}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-2xl p-6">
              <p className="text-sm text-white font-semibold mb-2">"See it. Love it. Then pay for it."</p>
              <p className="text-xs text-zinc-500">
                AITDL · A Living Knowledge Ecosystem<br />
                Pan India · Since 2007
              </p>
            </div>
          </div>

          {/* ── Contact Form ────────────────────────────────── */}
          <div className="lg:col-span-3">
            <form
              action="/api/contact"
              method="POST"
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Full Name *</label>
                  <input name="name" required placeholder="Rahul Sharma" className="form-input" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Phone *</label>
                  <input name="phone" required placeholder="9876543210" className="form-input" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Email</label>
                <input name="email" type="email" placeholder="rahul@example.com" className="form-input" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">City</label>
                  <input name="city" placeholder="Your city" className="form-input" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Subject *</label>
                  <select name="section" required className="form-input">
                    <option value="">Select topic</option>
                    {SECTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Message *</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  minLength={20}
                  placeholder="Tell us what you need — product demo, pricing, technical question..."
                  className="form-input resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors"
              >
                Send Message →
              </button>
              <p className="text-xs text-zinc-600 text-center">
                We reply within 1 business day · All enquiries welcome
              </p>
            </form>
          </div>

        </div>
      </div>
    </main>
  )
}
