// SSR · Product Page · SEO indexed
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GanitSūtram — AI Mathematics Learning',
  description: 'AI-powered mathematics platform rooted in ancient Indian knowledge',
}

export default function GanitsutramPage() {
  return (
    <main className="min-h-screen bg-brand-900 px-6 py-20 max-w-5xl mx-auto">
      <h1 className="text-5xl font-bold text-white mb-4">GanitSūtram</h1>
      <p className="text-xl text-purple-300 mb-12">AI-powered mathematics platform rooted in ancient Indian knowledge</p>
      {/* TODO: Migrate content from apps/portal/index.html sections */}
    </main>
  )
}
