// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// SSR · GanitSūtram Product Page · SEO indexed

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GanitSūtram — AI Mathematics Learning',
  description: 'AI-powered mathematics for Class 5–12 students. Gamified learning in Hindi, Marathi & English. Rooted in Brahmasphuṭasiddhānta, 628 CE.',
  keywords: ['GanitSutram', 'AI mathematics', 'CBSE maths', 'India', 'Class 5-12', 'Hindi maths', 'AI tutor'],
  openGraph: {
    title: 'GanitSūtram — AI Mathematics Learning | AITDL',
    description: 'AI-powered mathematics for Class 5–12. Hindi, Marathi, English. See it. Love it. Then pay for it.',
    url: 'https://ganitsutram.com',
  },
}

const FEATURES = [
  {
    icon: '🧠',
    title: 'AI Tutor',
    desc: 'Personalised step-by-step explanations that adapt to each student\'s pace and learning style.',
  },
  {
    icon: '🎯',
    title: 'Practice Engine',
    desc: 'Thousands of problems across CBSE, ICSE & State Board syllabi. Difficulty adjusts automatically.',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    desc: 'Real-time dashboards for students, parents and teachers. Spot weak areas before exams.',
  },
  {
    icon: '🗣️',
    title: 'Multilingual',
    desc: 'Learn mathematics in Hindi, Marathi or English. Switch languages mid-session.',
  },
  {
    icon: '📝',
    title: 'Exam Preparation',
    desc: 'Full mock tests, previous year papers, and AI analysis of where marks are being lost.',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Parent Dashboard',
    desc: 'Daily activity summaries, progress alerts and session duration — always in the loop.',
  },
]

const AUDIENCE = [
  {
    title: 'Students',
    subtitle: 'Class 5–12',
    desc: 'From fractions to calculus — every concept explained, every doubt resolved, at any hour.',
    color: 'from-blue-600/20 to-cyan-600/10',
    border: 'border-blue-500/20',
    icon: '🎒',
  },
  {
    title: 'Teachers',
    subtitle: 'School & Coaching',
    desc: 'Assign practice sets, monitor class performance, and identify struggling students early.',
    color: 'from-violet-600/20 to-purple-600/10',
    border: 'border-violet-500/20',
    icon: '📐',
  },
  {
    title: 'Parents',
    subtitle: 'Stay Informed',
    desc: 'Get daily progress reports, study time tracking, and exam readiness scores on your phone.',
    color: 'from-emerald-600/20 to-teal-600/10',
    border: 'border-emerald-500/20',
    icon: '🏠',
  },
]

export default function GanitsutramPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-28 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/8 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-8">
            <span>🧮</span>
            <span>Rooted in Brahmasphuṭasiddhānta · 628 CE</span>
          </div>

          <h1 className="font-display text-6xl md:text-7xl font-extrabold text-white mb-6 leading-none tracking-tight">
            Gaṇit<span className="text-gradient">Sūtram</span>
          </h1>

          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-4">
            AI-powered mathematics learning for Class 5–12 students across India.
          </p>
          <p className="text-sm text-zinc-500 mb-12">
            Hindi · Marathi · English &nbsp;·&nbsp; CBSE · ICSE · State Board
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://ganitsutram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors text-sm"
            >
              Try GanitSūtram →
            </a>
            <a
              href="#contact"
              className="px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/25 text-white font-medium transition-colors text-sm"
            >
              Talk to Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Brand Promise ──────────────────────────────────────── */}
      <section className="px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-2xl px-8 py-5 flex items-center justify-center">
            <p className="text-zinc-400 text-sm text-center">
              <span className="text-white font-semibold">"See it. Love it. Then pay for it."</span>
              {' '}— Try everything free before you commit.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Everything a student needs
          </h2>
          <p className="text-zinc-500 text-center mb-16 max-w-lg mx-auto">
            One platform. Every class. Every topic. Every doubt — answered.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 hover:border-blue-500/20 transition-colors group">
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-display font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who is it for ─────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-12">
            Who is it for?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AUDIENCE.map((a) => (
              <div key={a.title} className={`rounded-2xl p-8 bg-gradient-to-br ${a.color} border ${a.border}`}>
                <span className="text-4xl mb-4 block">{a.icon}</span>
                <h3 className="font-display font-bold text-white text-xl mb-1">{a.title}</h3>
                <p className="text-xs text-zinc-400 mb-3">{a.subtitle}</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Form ───────────────────────────────────────── */}
      <section id="contact" className="px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-3">
            Get in touch
          </h2>
          <p className="text-zinc-500 text-center text-sm mb-12">
            Free demo for schools and coaching institutes.
          </p>

          <ContactForm section="ganitsutram" />
        </div>
      </section>

    </main>
  )
}

// ── Contact Form Component (client island) ─────────────────────
// Separated to keep page SSR while form is interactive
function ContactForm({ section }: { section: string }) {
  // Note: For interactivity, extract this to a 'use client' component file
  // For Phase 3, this renders as a standard HTML form pointing to the API
  return (
    <form
      action={`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`}
      method="POST"
      className="space-y-4"
    >
      <input type="hidden" name="section" value={section} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Full Name *</label>
          <input name="name" required placeholder="Rahul Sharma" className="form-input" />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Phone *</label>
          <input name="phone" required placeholder="9876543210" className="form-input" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-zinc-400 mb-1.5">Email</label>
        <input name="email" type="email" placeholder="rahul@example.com" className="form-input" />
      </div>
      <div>
        <label className="block text-xs text-zinc-400 mb-1.5">City</label>
        <input name="city" placeholder="Mumbai, Nashik, Surat..." className="form-input" />
      </div>
      <div>
        <label className="block text-xs text-zinc-400 mb-1.5">Message</label>
        <textarea
          name="message"
          rows={4}
          placeholder="I'm interested in GanitSūtram for my school / my child..."
          className="form-input resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
      >
        Send Message →
      </button>
      <p className="text-xs text-zinc-600 text-center">
        We reply within 1 business day · contact@aitdl.com
      </p>
    </form>
  )
}
