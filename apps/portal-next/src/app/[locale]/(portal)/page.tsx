import { getDictionary } from '@/lib/get-dictionary'
import Door from '@/components/visual/Door'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const dict = (await getDictionary(locale)) as any

  return (
    <div id="gate" className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6 pt-20 pb-12">

      {/* Cinematic Logo/Hero */}
      <div className="text-center mb-16 relative z-10 w-full max-w-4xl mx-auto">
        <div className="badge-cs">{dict.common.brand} · LIVING KNOWLEDGE</div>
        <h1 className="brand-h1 font-heading leading-tight text-white flex justify-center h-[1.4em] py-2 px-4 whitespace-nowrap">
          {(() => {
            const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });
            const segments = Array.from(segmenter.segment(dict.common.brand));
            return segments.map((s, i) => (
              <span key={i} className="reveal-container">
                <span 
                  className="reveal-letter"
                  style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                >
                  {s.segment}
                </span>
              </span>
            ));
          })()}
        </h1>
        <div className="hero-divider" />
        <p className="tagline-scaling font-heading text-lg md:text-2xl tracking-[0.4em] text-[#888] uppercase fade-up" style={{ animationDelay: '1.2s' }}>
          {dict.gate.title}
        </p>
      </div>

      <div className="scroll-indicator fade-up" style={{ animationDelay: '2s' }}>
        <span>Scroll</span>
        <span className="text-xs">↓</span>
      </div>

      {/* The 4-Door Primary Grid - Flex based for magnetic expansion */}
      <div className="flex flex-col lg:flex-row gap-0 w-full max-w-[1600px] relative z-20 border-t border-white/5">

        <Door
          label={dict.gate.doors.retail.label}
          title={dict.gate.doors.retail.title}
          desc={dict.gate.doors.retail.description}
          points={dict.gate.doors.retail.points}
          href={`/${locale}/explore`}
          theme="blue"
          accent="#c9a84c"
          linkText={dict.gate.doors.retail.link}
          emoji="🌌"
        />

        <Door
          label={dict.gate.doors.erp.label}
          title={dict.gate.doors.erp.title}
          desc={dict.gate.doors.erp.description}
          points={dict.gate.doors.erp.points}
          href="#"
          theme="purple"
          accent="#ff6b1a"
          linkText={dict.gate.doors.erp.link}
          isPickerTrigger
          emoji="🎯"
        />

        <Door
          label={dict.gate.doors.education.label}
          title={dict.gate.doors.education.title}
          desc={dict.gate.doors.education.description}
          points={dict.gate.doors.education.points}
          href={`/${locale}/partner`}
          theme="green"
          accent="#39e07a"
          linkText={dict.gate.doors.education.link}
          emoji="🤝"
        />

        <Door
          label={dict.gate.doors.ai.label}
          title={dict.gate.doors.ai.title}
          desc={dict.gate.doors.ai.description}
          points={dict.gate.doors.ai.points}
          href={`/${locale}/student`}
          theme="burgundy"
          accent="#f5a623"
          linkText={dict.gate.doors.ai.link}
          emoji="🎯"
        />

      </div>

      {/* Background Decor */}
      <div className="orb animate-float w-[500px] h-[500px] bg-[#c9a84c]/10 top-[-200px] left-[-200px]" />
      <div className="orb animate-float-delayed w-[600px] h-[600px] bg-[#1a8fff]/5 bottom-[-300px] right-[-300px]" />
    </div>
  )
}
