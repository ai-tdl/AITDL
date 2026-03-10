import { getDictionary } from '@/lib/get-dictionary'
import ExploreCTA from '@/components/visual/ExploreCTA'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  return {
    title: dict.explore.seo.title,
    description: dict.explore.seo.description,
  }
}

const getProducts = (locale: string, dict: any) => [
  {
    id: '01',
    name: 'GanitSūtram',
    href: `/${locale}/student/tools/ganitsutram`,
    desc: 'AI-powered mathematics learning platform used by institutions to automate education and personalize learning paths.',
    theme: 'blue',
    icon: '✧'
  },
  {
    id: '02',
    name: 'Retail POS',
    href: `/${locale}/retail`,
    desc: 'Modern Point-of-Sale for retail stores and chains. Cloud-synced, real-time inventory and AI sales predictions.',
    theme: 'gold',
    icon: '🛍️'
  },
  {
    id: '03',
    name: 'Business ERP',
    href: `/${locale}/erp`,
    desc: 'Tally integration, inventory management, and business intelligence. Simplified for SMEs, built for scale.',
    theme: 'blue',
    icon: '⚙️'
  },
  {
    id: '04',
    name: 'Education Cloud',
    href: `/${locale}/education`,
    desc: `Complete institutional management. Admissions, fees, exams, and attendance — all powered by ${dict.common.brand} AI.`,
    theme: 'green',
    icon: '🏫'
  },
  {
    id: '05',
    name: 'Saathibook',
    href: `/${locale}/saathibook`,
    desc: `Professional sync and productivity tool for growing teams. Stay aligned, stay productive with ${dict.common.brand}.`,
    theme: 'purple',
    icon: '◈'
  },
  {
    id: '06',
    name: 'Partner Network',
    href: `/${locale}/partner`,
    desc: `The official ${dict.common.brand} reseller and implementation partner programme. Build your business with our technology.`,
    theme: 'green',
    icon: '🤝'
  },
]

export default async function ExplorePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const products = getProducts(locale, dict)

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-[1400px] mx-auto">

      {/* Header Section */}
      <section className="mb-20 fade-up">
        <div className="badge-cs">{dict.explore.badge}</div>
        <h1 className="text-6xl md:text-8xl font-heading tracking-tight text-white mb-6 uppercase">
          {dict.explore.title}<br /><span className="text-[#6a6860]">{dict.explore.subtitle}</span>
        </h1>
        <p className="max-w-2xl text-[#6a6860] text-sm leading-relaxed">
          {dict.explore.desc}
        </p>
      </section>

      {/* Marquee Accent */}
      <div className="mq mb-20">
        <div className="mq-t font-mono text-[10px] uppercase tracking-[0.3em] text-[#c9a84c]">
          <span>Retail POS</span><span>✦</span><span>ERP Intelligence</span><span>✦</span><span>Maths Learning</span><span>✦</span><span>Edu Cloud</span><span>✦</span><span>AI Automation</span><span>✦</span><span>Partner Program</span><span>✦</span>
          <span>Retail POS</span><span>✦</span><span>ERP Intelligence</span><span>✦</span><span>Maths Learning</span><span>✦</span><span>Edu Cloud</span><span>✦</span><span>AI Automation</span><span>✦</span><span>Partner Program</span><span>✦</span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 relative z-10 bg-white/5 border border-white/5">
        {products.map(p => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>

      {/* CTA Section */}
      <ExploreCTA dict={dict.explore.cta} />

    </main>
  )
}

function ProductCard({ id, name, href, desc, theme, icon }: any) {
  const themes: any = {
    gold: { border: 'group-hover:border-[#c9a84c]/40', text: 'group-hover:text-[#c9a84c]' },
    blue: { border: 'group-hover:border-[#1a8fff]/40', text: 'group-hover:text-[#1a8fff]' },
    purple: { border: 'group-hover:border-[#a259ff]/40', text: 'group-hover:text-[#a259ff]' },
    green: { border: 'group-hover:border-[#39e07a]/40', text: 'group-hover:text-[#39e07a]' },
  };

  const t = themes[theme] || themes.gold;

  return (
    <a href={href} className={`group relative block p-10 bg-[#03040a] border border-transparent transition-all duration-500 hover:z-20 rv ${t.border}`}>
      <div className="flex justify-between items-start mb-12">
        <span className="font-mono text-[9px] tracking-[0.2em] text-[#6a6860]">{id}</span>
        <span className="text-2xl opacity-10 group-hover:opacity-100 transition-opacity duration-500">{icon}</span>
      </div>

      <h3 className="font-heading text-3xl tracking-[0.05em] text-white mb-4 group-hover:translate-x-2 transition-transform duration-500">
        {name}
      </h3>

      <p className="text-xs leading-relaxed text-[#6a6860] group-hover:text-[#e8e4da] transition-colors duration-500 min-h-[60px]">
        {desc}
      </p>

      <div className="mt-12 flex items-center gap-3">
        <div className="h-[1px] w-0 group-hover:w-8 bg-white/20 transition-all duration-500" />
        <span className="font-mono text-[9px] tracking-[0.2em] text-[#6a6860] group-hover:text-white transition-colors duration-500">
          EXPLORE →
        </span>
      </div>

      {/* Hover Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
    </a>
  );
}
