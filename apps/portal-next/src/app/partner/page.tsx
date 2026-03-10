# || ॐ श्री गणेशाय नमः ||
#
# Organization : AITDL — AI Technology Development Lab
# Creator      : Jawahar R. Mallah
# Web          : https://aitdl.com
# Build        : AITDL Platform V3 · Vikram Samvat 2082
# Copyright    : © aitdl.com · AITDL | GANITSUTRAM.com

// SSR · Partner Landing · SEO indexed
// Migrated from apps/portal/index.html — Partner section

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partner with AITDL — Reseller & Implementation Network',
  description: 'Join the AITDL partner network. Resell, implement, and earn with our Pan India technology platform.',
}

export default function PartnerPage() {
  return (
    <main className="min-h-screen bg-brand-900 px-6 py-20 max-w-4xl mx-auto">
      <h1 className="text-5xl font-bold text-white mb-4">Partner with AITDL</h1>
      <p className="text-xl text-purple-300 mb-6">
        Join India's fastest growing technology partner network
      </p>
      <p className="text-gray-400 mb-12">
        Resell, implement, and earn with AITDL products — Retail POS, School ERP,
        GanitSūtram, and more. Pan India since 2007.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { title: 'Reseller',       desc: 'Sell AITDL products in your city/region' },
          { title: 'Implementer',    desc: 'Install and configure for clients'       },
          { title: 'White Label',    desc: 'Build on AITDL, brand as your own'      },
        ].map(t => (
          <div key={t.title} className="p-6 bg-gray-900 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-2">{t.title}</h3>
            <p className="text-sm text-gray-400">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Apply form — posts to /api/partner */}
      <div className="bg-gray-900 rounded-2xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Apply to Partner</h2>
        <p className="text-gray-500 text-sm mb-4">
          Form connects to: <code className="text-purple-400">POST /api/partner</code>
        </p>
        {/* TODO: wire PartnerForm component → POST /api/partner */}
        <button className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl transition-colors">
          Apply Now
        </button>
      </div>
    </main>
  )
}
