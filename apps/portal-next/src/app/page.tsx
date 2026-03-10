// SSR · Public Homepage · SEO indexed
// Migrated from apps/portal/index.html — Gate concept preserved

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-900 flex flex-col items-center justify-center px-6">

      {/* Gate Brand */}
      <div className="text-center mb-16">
        <h1 className="text-7xl font-bold text-white tracking-tight">AITDL</h1>
        <p className="mt-4 text-xl text-purple-300">Choose Your World</p>
        <p className="mt-2 text-sm text-gray-500">
          Technology Solutions · Pan India · Since 2007
        </p>
      </div>

      {/* The Three Doors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <GateCard
          href="/explore"
          title="Universe"
          description="Explore all products — Retail, ERP, Education, AI"
          color="from-violet-600 to-purple-900"
        />
        <GateCard
          href="/ganitsutram"
          title="GanitSūtram"
          description="AI-powered mathematics learning platform"
          color="from-blue-600 to-cyan-900"
        />
        <GateCard
          href="/partner"
          title="Partner"
          description="Join the AITDL reseller & implementation network"
          color="from-emerald-600 to-green-900"
        />
      </div>

    </main>
  )
}

function GateCard({
  href, title, description, color
}: {
  href: string
  title: string
  description: string
  color: string
}) {
  return (
    <a
      href={href}
      className={`
        block p-8 rounded-2xl bg-gradient-to-br ${color}
        border border-white/10 hover:border-white/30
        transition-all duration-300 hover:scale-105 hover:shadow-2xl
        group cursor-pointer
      `}
    >
      <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
        {title}
      </h2>
      <p className="text-sm text-white/70">{description}</p>
    </a>
  )
}
