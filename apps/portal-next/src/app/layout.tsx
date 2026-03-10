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

        <main className="relative min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
