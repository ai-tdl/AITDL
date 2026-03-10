// SSR · Product Page · SEO indexed
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dailyboard — Productivity Platform',
  description: 'Daily productivity and task management for modern teams',
}

export default function DailyboardPage() {
  return (
    <main className="min-h-screen bg-brand-900 px-6 py-20 max-w-5xl mx-auto">
      <h1 className="text-5xl font-bold text-white mb-4">Dailyboard</h1>
      <p className="text-xl text-purple-300 mb-12">Daily productivity and task management for modern teams</p>
      {/* TODO: Migrate content from apps/portal/index.html sections */}
    </main>
  )
}
