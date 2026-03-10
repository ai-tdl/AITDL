import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AITDL — Choose Your World',
  description: 'Technology Solutions for Retail, ERP, Education & AI. Pan India. Since 2007.',
  openGraph: {
    title: 'AITDL — Choose Your World',
    description: 'Retail POS · ERP & Tally · School Management · AI Learning Tools. Pan India since 2007.',
    url: 'https://aitdl.com',
    siteName: 'AITDL',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
