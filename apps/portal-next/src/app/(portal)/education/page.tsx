// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// SSR · Education Technology Page · SEO indexed

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Education Cloud — Institutional Management System',
  description: 'Complete cloud OS for schools and colleges across India. Automate admissions, fees, exams, and attendance with AITDL\'s AI-driven institution management.',
  keywords: ['School Management Software', 'College ERP India', 'Fee Collection', 'Admission Automation', 'EduTech India', 'AITDL Education'],
  openGraph: {
    title: 'Education Cloud — Institutional Management System | AITDL',
    description: 'Transform your institution with AI-powered ERP. Fee management, digital classrooms, and parent sync.',
  },
}

const FEATURES = [
  {
    icon: '🏫',
    title: 'School ERP',
    desc: 'Complete management from admission to alumni. Attendance, timetable, and library automated.',
  },
  {
    icon: '💳',
    title: 'Fee Collection',
    desc: 'Automated fee reminders, online payments, and instant receipt generation via WhatsApp.',
  },
  {
    icon: '📝',
    title: 'Exam Management',
    desc: 'Digital report cards, auto-generated question banks, and OMR-ready result sheets.',
  },
  {
    icon: '👨‍🏫',
    title: 'Coaching Suite',
    desc: 'Tailored for coaching institutes. Batch management, student tracking, and lead management.',
  },
  {
    icon: '📱',
    title: 'Parent/Student App',
    desc: 'Give parents real-time updates on attendance, marks, and announcements straight to their phone.',
  },
  {
    icon: '🤖',
    title: 'AI Learning',
    desc: 'Integrated with GanitSūtram for AI-powered personalised learning paths for every student.',
  },
]

export default function SchoolPage() {
  return (
    <main className="min-h-screen t-education">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-600/8 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-medium mb-8">
            <span>🎓</span>
            <span>Schools · Coaching · Institutions · Higher Ed</span>
          </div>

          <h1 className="font-heading text-6xl md:text-8xl font-extrabold text-white mb-6 leading-none tracking-tight">
            EDUCATION.<br /><span className="text-gradient">RUN BETTER.</span>
          </h1>

          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-4">
            Everything a modern educational institution needs, in one unified AI-powered platform.
          </p>
          <p className="text-sm text-zinc-500 mb-12">
            Fee Collection · Admission · Exam Prep · Parent Sync
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="px-8 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors text-sm"
            >
              Book a Free Demo →
            </a>
            <a
              href="/explore"
              className="px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/25 text-white font-medium transition-colors text-sm"
            >
              See All Products
            </a>
          </div>
        </div>
      </section>

      {/* ── Brand Promise ──────────────────────────────────────── */}
      <section className="px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-2xl px-8 py-5 flex items-center justify-center">
            <p className="text-zinc-400 text-sm text-center">
              <span className="text-white font-semibold">Digitise Your Campus</span>
              {' '}— Move away from manual registers to a real-time, cloud-synced ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-white text-center mb-4">
            Unified Institutional Management
          </h2>
          <p className="text-zinc-500 text-center mb-16 max-w-lg mx-auto">
            A comprehensive suite for principals, teachers, and parents.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 hover:border-green-500/20 transition-colors group">
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-heading text-2xl font-bold text-white mb-2 group-hover:text-green-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Form ───────────────────────────────────────── */}
      <section id="contact" className="px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-4xl font-bold text-white text-center mb-3">
            Schedule a Demo
          </h2>
          <p className="text-zinc-500 text-center text-sm mb-12">
            Free consultation and live demo for your institution.
          </p>

          <form
            action={`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`}
            method="POST"
            className="space-y-4"
          >
            <input type="hidden" name="section" value="education" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Full Name *</label>
                <input name="name" required placeholder="Principal / Owner Name" className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Phone *</label>
                <input name="phone" required placeholder="9876543210" className="form-input" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Institution Name</label>
              <input name="business" placeholder="Name of School / Coaching" className="form-input" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Message</label>
              <textarea name="message" rows={3} placeholder="How many students do you manage currently?" className="form-input resize-none" />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-colors"
            >
              Book a Free Demo →
            </button>
          </form>
        </div>
      </section>

    </main>
  )
}
