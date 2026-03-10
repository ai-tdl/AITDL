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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 w-full max-w-[1600px] relative z-20 border-t border-white/5">

        <Door
          subtext="WHOLE UNIVERSE"
          title="EXPLORE EVERYTHING"
          desc="Browse all our solutions freely — no filter, no restrictions. Retail, ERP, education, AI tools — the full picture, all at once."
          href="/explore"
          theme="blue"
          linkText="OVERVIEW DASHBOARD"
          emoji="🌌"
        />

        <Door
          subtext="SPECIFIC DESTINATION"
          title="GO TO MY WORLD"
          desc="You know what you need. Pick your role — retailer, business, school, teacher, student, or parent. Only what's relevant to you."
          href="#"
          theme="purple"
          linkText="CHOOSE MY ROLE"
          isPickerTrigger
          emoji="🎯"
        />

        <Door
          subtext="BECOME A PARTNER"
          title="GROW WITH AITDL"
          desc="You have the network. We have 18 years of proven products. Resell our entire portfolio in your city — and build your own technology business."
          href="/partner"
          theme="green"
          linkText="PARTNER PROGRAMME"
          emoji="🤝"
        />

        <Door
          subtext="LEARN · EARN · FUN"
          title="GROW ON YOUR TERMS."
          desc="Online courses. Referral income. Gamified challenges. Daily rewards. Built for working professionals who want to grow without slowing down."
          href="/explore"
          theme="burgundy"
          linkText="EXPLORE PLATFORM"
          emoji="🎯"
        />

      </div>

      {/* Background Decor */}
      <div className="orb w-[500px] h-[500px] bg-[#c9a84c]/10 top-[-200px] left-[-200px]" />
      <div className="orb w-[600px] h-[600px] bg-[#1a8fff]/5 bottom-[-300px] right-[-300px]" />
    </div>
  )
}

function Door({
  subtext, title, desc, href, theme, isPickerTrigger, linkText, emoji
}: {
  subtext: string, title: string, desc: string, href: string, theme: 'blue' | 'purple' | 'green' | 'burgundy', isPickerTrigger?: boolean, linkText: string, emoji: string
}) {
  const themeClasses: Record<'blue' | 'purple' | 'green' | 'burgundy', string> = {
    blue: 'hover:bg-[#0a111a] border-r border-white/5',
    purple: 'hover:bg-[#0f0e1a] border-r border-white/5',
    green: 'hover:bg-[#0a1a0f] border-r border-white/5',
    burgundy: 'hover:bg-[#1a0a0d]'
  };

  const accentClasses: Record<'blue' | 'purple' | 'green' | 'burgundy', string> = {
    blue: 'text-blue-400',
    purple: 'text-pink-400',
    green: 'text-yellow-400',
    burgundy: 'text-pink-400'
  };

  const currentThemeClass = themeClasses[theme];
  const accentClass = accentClasses[theme];

  return (
    <a
      href={href}
      className={`
        relative group block p-12 h-[550px] transition-all duration-500 
        flex flex-col justify-between overflow-hidden
        ${currentThemeClass}
      `}
      onClick={(e) => {
        if (isPickerTrigger) {
          e.preventDefault();
          (window as any).dispatchRolePicker?.();
        }
      }}
    >
      <div className="relative z-10">
        <div className="mb-8">
           <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500">{emoji}</div>
           <div className="flex items-center gap-2 mb-2">
             <div className="w-4 h-[1px] bg-[#6a6860]" />
             <span className="font-mono text-[10px] tracking-[0.2em] text-[#6a6860] uppercase">{subtext}</span>
           </div>
           <h2 className="font-heading text-5xl leading-[1.1] tracking-tight text-white mb-8 group-hover:text-white transition-colors">
            {title}
          </h2>
          <p className="text-[13px] leading-relaxed text-[#6a6860] group-hover:text-[#999] transition-colors duration-500 max-w-[280px]">
            {desc}
          </p>
        </div>
      </div>

      <div className="relative z-10">
        <span className={`font-mono text-[11px] tracking-[0.15em] font-bold ${accentClass} uppercase flex items-center gap-2`}>
          {linkText} <span className="text-lg">→</span>
        </span>
      </div>

      {/* Hover Background Accent */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700
        bg-gradient-to-t from-black to-transparent
      `} />
    </a>
  );
}
