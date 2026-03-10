// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// Copyright © aitdl.com · AITDL | GANITSUTRAM.com

import type { Metadata } from 'next'
import './globals.css'

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-zinc-950 text-white antialiased font-sans">
        {/* Global Nav */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
          <nav className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/" className="font-display text-lg font-bold text-white tracking-tight hover:text-purple-300 transition-colors">
              AITDL
            </a>
            <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
              <a href="/explore"     className="hover:text-white transition-colors">Products</a>
              <a href="/ganitsutram" className="hover:text-white transition-colors">GanitSūtram</a>
              <a href="/blog"        className="hover:text-white transition-colors">Blog</a>
              <a href="/partner"     className="hover:text-white transition-colors">Partner</a>
            </div>
            <a
              href="/partner"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
            >
              Get Started
            </a>
          </nav>
        </header>

        {/* Page content — padded for fixed nav */}
        <div className="pt-14">{children}</div>

        {/* Global Footer */}
        <footer className="border-t border-white/5 mt-24 py-12 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-zinc-500">
            <div>
              <p className="font-display font-bold text-white text-base mb-3">AITDL</p>
              <p className="text-xs leading-relaxed">A Living Knowledge Ecosystem.<br />Pan India · Since 2007.</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-300 mb-3">Products</p>
              <ul className="space-y-2">
                <li><a href="/ganitsutram" className="hover:text-white transition-colors">GanitSūtram</a></li>
                <li><a href="/dailyboard"  className="hover:text-white transition-colors">Dailyboard</a></li>
                <li><a href="/explore"     className="hover:text-white transition-colors">All Products</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-zinc-300 mb-3">Company</p>
              <ul className="space-y-2">
                <li><a href="/partner"  className="hover:text-white transition-colors">Partner</a></li>
                <li><a href="/blog"     className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-zinc-300 mb-3">Contact</p>
              <ul className="space-y-2">
                <li><a href="mailto:contact@aitdl.com"  className="hover:text-white transition-colors">contact@aitdl.com</a></li>
                <li><a href="mailto:partners@aitdl.com" className="hover:text-white transition-colors">partners@aitdl.com</a></li>
                <li className="text-xs pt-1">Mumbai · Nashik · Surat · Gorakhpur</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-zinc-600">
            <p>© aitdl.com · AITDL | GANITSUTRAM.com</p>
            <p className="font-mono">628 CE · Brahmasphuṭasiddhānta → Vikram Samvat 2082</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
