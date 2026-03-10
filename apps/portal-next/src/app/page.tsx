"use client";

// SSR · Public Homepage · SEO indexed
// Migrated from apps/portal/index.html — Gate concept preserved

export default function HomePage() {
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
          Choose Your World
        </p>
      </div>

      {/* The 4-Door Primary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[1400px] relative z-20">

        <Door
          num="01"
          title="Universe"
          desc="The All-In-One Dashboard. Explore every tool and solution AITDL provides."
          href="/explore"
          icon="✦"
          theme="gold"
        />

        <Door
          num="02"
          title="Start Here"
          desc="Enter your personalized world. Pick your role to see only what matters."
          href="#"
          icon="◈"
          theme="purple"
          isPickerTrigger
        />

        <Door
          num="03"
          title="Partner"
          desc="Join the ecosystem. Become an implementation partner or reseller."
          href="/partner"
          icon="◈"
          theme="green"
        />

        <Door
          num="04"
          title="Maths Lab"
          desc="GanitSūtram. AI-powered mathematical intelligence and learning."
          href="/ganitsutram"
          icon="✧"
          theme="blue"
        />

      </div>

      {/* Background Decor */}
      <div className="orb w-[500px] h-[500px] bg-[#c9a84c]/10 top-[-200px] left-[-200px]" />
      <div className="orb w-[600px] h-[600px] bg-[#1a8fff]/5 bottom-[-300px] right-[-300px]" />
    </div>
  )
}

function Door({
  num, title, desc, href, icon, theme, isPickerTrigger
}: {
  num: string, title: string, desc: string, href: string, icon: string, theme: 'gold' | 'purple' | 'green' | 'blue', isPickerTrigger?: boolean
}) {
  const themeClasses: Record<'gold' | 'purple' | 'green' | 'blue', string> = {
    gold: 'border-[#c9a84c]/20 hover:border-[#c9a84c]/60 group-hover:text-[#c9a84c]',
    purple: 'border-[#a259ff]/20 hover:border-[#a259ff]/60 group-hover:text-[#a259ff]',
    green: 'border-[#39e07a]/20 hover:border-[#39e07a]/60 group-hover:text-[#39e07a]',
    blue: 'border-[#1a8fff]/20 hover:border-[#1a8fff]/60 group-hover:text-[#1a8fff]'
  };

  const currentThemeClass = themeClasses[theme];

  return (
    <a
      href={href}
      className={`
        relative group block p-8 h-[400px] glass transition-all duration-700 
        hover:translate-y-[-8px] flex flex-col justify-between overflow-hidden
        ${currentThemeClass}
      `}
      onClick={(e) => {
        if (isPickerTrigger) {
          e.preventDefault();
          // window.openPicker() will be implemented via client component pattern
          (window as any).dispatchRolePicker?.();
        }
      }}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#6a6860]">{num}</span>
          <span className="text-xl opacity-20 group-hover:opacity-100 transition-opacity duration-500">{icon}</span>
        </div>
        <h2 className="font-heading text-4xl tracking-[0.05em] text-white group-hover:translate-x-2 transition-transform duration-500">
          {title}
        </h2>
        <p className="mt-4 text-xs leading-relaxed text-[#6a6860] group-hover:text-[#e8e4da] transition-colors duration-500 max-w-[200px]">
          {desc}
        </p>
      </div>

      <div className="relative z-10 flex justify-end">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#6a6860] group-hover:text-white transition-colors duration-500">
          ENTER →
        </span>
      </div>

      {/* Decorative Gradient Shine */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000
        bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none
      `} />
    </a>
  );
}
