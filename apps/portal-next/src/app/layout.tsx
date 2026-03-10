// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// Copyright © aitdl.com · AITDL | GANITSUTRAM.com

import type { Metadata } from 'next'
import './globals.css'
import CustomCursor from '@/components/visual/CustomCursor'
import CanvasBackground from '@/components/visual/CanvasBackground'
import RolePicker from '@/components/visual/RolePicker'
import RevealOnScroll from '@/components/visual/RevealOnScroll'

export const metadata: Metadata = {
  title: {
    default: 'AITDL — A Living Knowledge Ecosystem',
    template: '%s | AITDL',
  },
  description: 'Technology Solutions for Retail, ERP, Education & AI. Pan India. Since 2007.',
  keywords: ['AITDL', 'AI', 'ERP', 'Tally', 'GanitSutram', 'School ERP', 'Retail POS', 'India'],
  authors: [{ name: 'Jawahar R. Mallah', url: 'https://aitdl.com' }],
  openGraph: {
    title: 'AITDL — A Living Knowledge Ecosystem',
    description: 'Retail POS · ERP & Tally · School Management · AI Learning Tools. Pan India since 2007.',
    url: 'https://aitdl.com',
    siteName: 'AITDL',
    type: 'website',
    images: [{ url: 'https://aitdl.com/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AITDL — A Living Knowledge Ecosystem',
    description: 'Technology Solutions for Retail, ERP, Education & AI. Pan India.',
  },
  metadataBase: new URL('https://aitdl.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <CustomCursor />
        <CanvasBackground />
        <RolePicker />
        <RevealOnScroll />

        {/* Header - Transparent/Minimal */}
        <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-transparent backdrop-blur-sm">
          <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="font-heading text-2xl tracking-[0.1em] text-white hover:text-[#c9a84c] transition-colors">
              AITDL
            </a>

            <div className="hidden md:flex items-center gap-10 font-mono text-[10px] uppercase tracking-[0.2em] text-[#6a6860]">
              <a href="/explore" className="hover:text-[#c9a84c] transition-colors">Universe</a>
              <a href="/ganitsutram" className="hover:text-[#c9a84c] transition-colors">Sūtram</a>
              <a href="/blog" className="hover:text-[#c9a84c] transition-colors">Intelligence</a>
              <a href="/partner" className="hover:text-[#c9a84c] transition-colors font-bold text-[#c9a84c]">Partner</a>
            </div>

            <button className="md:hidden text-white p-2">
              <span className="font-mono text-[10px] tracking-[0.2em]">MEMU</span>
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
              <p className="font-heading text-3xl tracking-[0.05em] text-white mb-4">AITDL</p>
              <p className="text-[#6a6860] max-w-sm leading-relaxed text-xs">
                A living knowledge ecosystem providing 18 years of business technology solutions across India.
                Built with precision, delivered with pride.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <p className="font-heading text-lg tracking-[0.1em] text-[#c9a84c]">Network</p>
              <ul className="space-y-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#6a6860]">
                <li><a href="/partner" className="hover:text-white">Partner Program</a></li>
                <li><a href="/blog" className="hover:text-white">AITDL Blog</a></li>
                <li><a href="/explore" className="hover:text-white">The Universe</a></li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <p className="font-heading text-lg tracking-[0.1em] text-[#c9a84c]">Direct</p>
              <ul className="space-y-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#6a6860]">
                <li><a href="mailto:contact@aitdl.com" className="hover:text-white">contact@aitdl.com</a></li>
                <li className="text-white/20">Mumbai · Nashik · Surat · Gorakhpur</li>
              </ul>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-mono uppercase tracking-[0.2em] text-[#2a2a2a]">
            <p>© 2026 aitdl.com · All rights reserved</p>
            <p>Pan India Since 2007 · Brahmasphuṭasiddhānta 628</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
