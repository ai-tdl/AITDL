import { getDictionary } from '@/lib/get-dictionary'
import Door from '@/components/visual/Door'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <div id="gate" className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6 pt-20 pb-12">

      {/* Cinematic Logo/Hero */}
      <div className="text-center mb-16 relative z-10 fade-up">
        <div className="badge-cs">AITDL · LIVING KNOWLEDGE</div>
        <h1 className="text-8xl md:text-[12rem] font-heading leading-tight tracking-[0.05em] text-white">
          AITDL
        </h1>
        <div className="h-[1px] w-24 bg-[#c9a84c] mx-auto my-6" />
        <p className="font-heading text-lg md:text-2xl tracking-[0.3em] text-[#6a6860] uppercase">
          {dict.gate.title}
        </p>
      </div>

      {/* The 4-Door Primary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 w-full max-w-[1600px] relative z-20 border-t border-white/5">

        <Door
          subtext="WHOLE UNIVERSE"
          title={dict.gate.doors.retail.title}
          desc={dict.gate.doors.retail.description}
          href={`/${locale}/explore`}
          theme="blue"
          linkText={dict.gate.doors.retail.link}
          emoji="🌌"
        />

        <Door
          subtext="SPECIFIC DESTINATION"
          title={dict.gate.doors.erp.title}
          desc={dict.gate.doors.erp.description}
          href="#"
          theme="purple"
          linkText={dict.gate.doors.erp.link}
          isPickerTrigger
          emoji="🎯"
        />

        <Door
          subtext="BECOME A PARTNER"
          title={dict.gate.doors.education.title}
          desc={dict.gate.doors.education.description}
          href={`/${locale}/partner`}
          theme="green"
          linkText={dict.gate.doors.education.link}
          emoji="🤝"
        />

        <Door
          subtext="LEARN · EARN · FUN"
          title={dict.gate.doors.ai.title}
          desc={dict.gate.doors.ai.description}
          href={`/${locale}/student`}
          theme="burgundy"
          linkText={dict.gate.doors.ai.link}
          emoji="🎯"
        />

      </div>

      {/* Background Decor */}
      <div className="orb w-[500px] h-[500px] bg-[#c9a84c]/10 top-[-200px] left-[-200px]" />
      <div className="orb w-[600px] h-[600px] bg-[#1a8fff]/5 bottom-[-300px] right-[-300px]" />
    </div>
  )
}
