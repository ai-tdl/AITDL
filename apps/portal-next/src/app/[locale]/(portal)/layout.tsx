// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// Public Portal Layout — Wrapper with Header and Footer

import LanguageSwitcher from '@/components/visual/LanguageSwitcher'
import { getDictionary } from '@/lib/get-dictionary'

export default async function PortalLayout({ 
  children,
  params
}: { 
  children: React.ReactNode,
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const dict = (await getDictionary(locale as any)) as any

  return (
    <>
      {/* Header - Transparent/Minimal */}
      <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-transparent backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href={`/${locale}`} className="font-heading text-2xl tracking-[0.1em] text-white hover:text-[#c9a84c] transition-colors">
            {dict.common.brand}
          </a>

          <div className="flex items-center">
            <div className="hidden md:flex items-center gap-10 font-mono text-[10px] uppercase tracking-[0.2em] text-[#6a6860]">
              <a href={`/${locale}/explore`} className="nav-link">Universe</a>
              <a href={`/${locale}/explore`} className="nav-link">Products</a>
              <a href={`/${locale}/blog`} className="nav-link">AI</a>
              <a href={`/${locale}/partner`} className="nav-link">Partner</a>
            </div>

            <LanguageSwitcher currentLocale={locale} />
          </div>

          <button className="md:hidden text-white p-2">
            <span className="font-mono text-[10px] tracking-[0.2em]">MENU</span>
          </button>
        </nav>
      </header>

      <main className="relative min-h-screen">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-white/5 py-16 px-6 bg-[#03040a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          <div className="col-span-1 md:col-span-2">
            <p className="font-heading text-4xl tracking-[0.05em] text-white mb-4">{dict.common.brand}</p>
            <p className="text-[#6a6860] max-w-sm leading-relaxed text-[11px]">
              18 years of business technology across India. 
              <span className="block mt-1">Mumbai · Nashik · Surat · Gorakhpur.</span>
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-heading text-lg tracking-[0.1em] text-[#c9a84c]">Network</p>
            <ul className="space-y-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#6a6860]">
              <li><a href={`/${locale}/partner`} className="hover:text-white">Partner Program</a></li>
              <li><a href={`/${locale}/blog`} className="hover:text-white">AITDL Blog</a></li>
              <li><a href={`/${locale}/explore`} className="hover:text-white">The Universe</a></li>
              <li><a href={`/${locale}/careers`} className="hover:text-white">Careers</a></li>
              <li><a href={`/${locale}/products`} className="hover:text-white">All Products</a></li>
              <li><a href={`/${locale}/contact`} className="hover:text-white">Contact Us</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-heading text-lg tracking-[0.1em] text-[#c9a84c]">Direct</p>
            <ul className="space-y-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#6a6860]">
              <li><a href="mailto:contact@aitdl.com" className="hover:text-white">contact@aitdl.com</a></li>
              <li className="flex gap-2 text-white/40 flex-wrap">
                <a href={`/${locale}/contact`} className="hover:text-white">Mumbai</a> · 
                <a href={`/${locale}/contact`} className="hover:text-white">Nashik</a> · 
                <a href={`/${locale}/contact`} className="hover:text-white">Surat</a> · 
                <a href={`/${locale}/contact`} className="hover:text-white">Gorakhpur</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-mono uppercase tracking-[0.2em] text-[#2a2a2a]">
          <p>© 2026 aitdl.com · All rights reserved</p>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p>Creator & System Architect: Jawahar R. Mallah</p>
            <span className="hidden md:inline">·</span>
            <p>Pan India Since 2007 · Brahmasphuṭasiddhānta 628</p>
          </div>
        </div>
      </footer>
    </>
  )
}
