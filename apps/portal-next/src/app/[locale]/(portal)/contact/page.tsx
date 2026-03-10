// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// SSR · Contact Page · SEO indexed · Form → POST /api/contact

import { getDictionary } from '@/lib/get-dictionary'
import RevealOnScroll from '@/components/visual/RevealOnScroll'
import ContactForm from '@/components/forms/ContactForm'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  return {
    title: dict.contact.seo.title,
    description: dict.contact.seo.description,
  }
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <main className="min-h-screen px-6 py-20">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16 rv">
          <h1 className="font-display text-5xl md:text-7xl font-extrabold text-white mb-6 uppercase tracking-tight">
            {dict.contact.hero.title}
          </h1>
          <p className="text-zinc-500 max-w-lg mx-auto font-medium">
            {dict.contact.hero.subtitle}
          </p>
        </div>

        <RevealOnScroll />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* ── Contact Info ───────────────────────────────── */}
          <div className="lg:col-span-2 space-y-12 rv">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">{dict.contact.info.direct}</p>
              <ul className="space-y-4">
                <li>
                  <p className="text-xs text-zinc-500 mb-1">{dict.contact.info.general}</p>
                  <a href="mailto:contact@aitdl.com" className="text-white hover:text-purple-300 transition-colors text-sm">
                    contact@aitdl.com
                  </a>
                </li>
                <li>
                  <p className="text-xs text-zinc-500 mb-1">{dict.contact.info.partners}</p>
                  <a href="mailto:partners@aitdl.com" className="text-white hover:text-purple-300 transition-colors text-sm">
                    partners@aitdl.com
                  </a>
                </li>
                <li>
                  <p className="text-xs text-zinc-500 mb-1">{dict.contact.info.founder}</p>
                  <a href="mailto:jawahar@aitdl.com" className="text-white hover:text-purple-300 transition-colors text-sm">
                    jawahar@aitdl.com
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">{dict.contact.info.cities}</p>
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
          <div className="lg:col-span-3 rv">
            <ContactForm dict={dict.contact.form} />
          </div>

        </div>
      </div>
    </main>
  )
}
