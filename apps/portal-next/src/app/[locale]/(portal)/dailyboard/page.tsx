// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// SSR · Dailyboard Product Page · SEO indexed

import { getDictionary } from '@/lib/get-dictionary'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  return {
    title: dict.dailyboard.seo.title,
    description: dict.dailyboard.seo.description,
  }
}

const FEATURES = [
  {
    icon: '🎯',
    title: 'Daily Goals',
    desc: 'Set clear intentions every morning. Track completion by end of day. Build consistent habits.',
  },
  {
    icon: '🔄',
    title: 'Async Standup',
    desc: 'No more meetings just to share status. Post updates on your schedule, read them on yours.',
  },
  {
    icon: '📋',
    title: 'Progress Board',
    desc: 'Visual Kanban-style board showing the whole team\'s daily wins and blockers at a glance.',
  },
  {
    icon: '🤖',
    title: 'AI Assistant',
    desc: 'Let AI summarise team progress, flag recurring blockers, and suggest priority adjustments.',
  },
  {
    icon: '📱',
    title: 'WhatsApp Updates',
    desc: 'Get daily summary nudges straight to WhatsApp. No app install required for basic teams.',
  },
  {
    icon: '📈',
    title: 'Weekly Reports',
    desc: 'Automated weekly digest: goals met, blockers resolved, velocity trend. Sent every Friday.',
  },
]

const USE_CASES = [
  {
    title: 'Solo Professional',
    items: ['Personal daily goal tracker', 'End-of-day reflection log', 'Weekly self-review', 'AI-suggested priorities'],
    color: 'from-violet-600/20 to-purple-600/10',
    border: 'border-violet-500/20',
  },
  {
    title: 'Small Team (2–15)',
    items: ['Async standup board', 'Team progress visibility', 'Blocker escalation', 'WhatsApp daily digest'],
    color: 'from-blue-600/20 to-cyan-600/10',
    border: 'border-blue-500/20',
  },
  {
    title: 'Enterprise',
    items: ['Multi-team dashboards', 'Manager roll-up views', 'Integration with existing tools', 'Custom reporting'],
    color: 'from-emerald-600/20 to-teal-600/10',
    border: 'border-emerald-500/20',
  },
]

export default async function DailyboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <main className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-violet-600/8 blur-[100px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-8">
            <span>⚡</span>
            <span>Standalone · Works with AI Assistant plugin</span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-extrabold text-white mb-6 leading-none tracking-tight uppercase">
            {dict.dailyboard.hero.title}
          </h1>

          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-4">
            {dict.dailyboard.hero.subtitle}
          </p>
          <p className="text-sm text-zinc-500 mb-12">
            For solo professionals · small teams · enterprises
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors text-sm"
            >
              Request Early Access →
            </a>
            <a
              href={`/${locale}/explore`}
              className="px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/25 text-white font-medium transition-colors text-sm"
            >
              See All Products
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Your team, in sync
          </h2>
          <p className="text-zinc-500 text-center mb-16 max-w-lg mx-auto">
            Stop wasting mornings in status meetings. Dailyboard gives you that time back.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 hover:border-violet-500/20 transition-colors group">
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-display font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases ─────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-12">
            Built for how you work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {USE_CASES.map((u) => (
              <div key={u.title} className={`rounded-2xl p-8 bg-gradient-to-br ${u.color} border ${u.border}`}>
                <h3 className="font-display font-bold text-white text-xl mb-6">{u.title}</h3>
                <ul className="space-y-3">
                  {u.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="text-violet-400 mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ──────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-6">Integrations</p>
            <div className="flex justify-center items-center gap-10 flex-wrap">
              <div className="text-center">
                <p className="text-2xl mb-1">💬</p>
                <p className="text-xs text-zinc-400">WhatsApp</p>
                <p className="text-xs text-green-500">Live</p>
              </div>
              <div className="text-center opacity-40">
                <p className="text-2xl mb-1">📧</p>
                <p className="text-xs text-zinc-400">Email</p>
                <p className="text-xs text-zinc-500">Soon</p>
              </div>
              <div className="text-center opacity-40">
                <p className="text-2xl mb-1">🔷</p>
                <p className="text-xs text-zinc-400">Slack</p>
                <p className="text-xs text-zinc-500">Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Form ───────────────────────────────────────── */}
      <section id="contact" className="px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-3">
            Request early access
          </h2>
          <p className="text-zinc-500 text-center text-sm mb-12">
            Dailyboard is rolling out in phases. Get in queue.
          </p>
          <form
            action={`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`}
            method="POST"
            className="space-y-4"
          >
            <input type="hidden" name="section" value="dailyboard" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Full Name *</label>
                <input name="name" required placeholder="Your name" className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Phone *</label>
                <input name="phone" required placeholder="9876543210" className="form-input" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Email</label>
              <input name="email" type="email" placeholder="you@company.com" className="form-input" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Team size</label>
              <select name="business" className="form-input">
                <option value="">Select...</option>
                <option value="solo">Just me</option>
                <option value="2-10">2–10 people</option>
                <option value="11-50">11–50 people</option>
                <option value="50+">50+ people</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Message</label>
              <textarea name="message" rows={3} placeholder="What would you use Dailyboard for?" className="form-input resize-none" />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
            >
              Request Access →
            </button>
          </form>
        </div>
      </section>

    </main>
  )
}
