"use client"

import React from 'react'

export default function Door({
  subtext, title, desc, href, theme, isPickerTrigger, linkText, emoji
}: {
  subtext: string, title: string, desc: string, href: string, theme: 'blue' | 'purple' | 'green' | 'burgundy', isPickerTrigger?: boolean, linkText: string, emoji: string
}) {
  const themeClasses: Record<'blue' | 'purple' | 'green' | 'burgundy', string> = {
    blue: 'hover:bg-[#0a111a] border-r border-white/5 glow-hover-blue',
    purple: 'hover:bg-[#0f0e1a] border-r border-white/5 glow-hover-purple',
    green: 'hover:bg-[#0a1a0f] border-r border-white/5 glow-hover-green',
    burgundy: 'hover:bg-[#1a0a0d] glow-hover-burgundy'
  };

  const glowClasses: Record<'blue' | 'purple' | 'green' | 'burgundy', string> = {
    blue: 'glow-blue',
    purple: 'glow-purple',
    green: 'glow-green',
    burgundy: 'glow-burgundy'
  };

  const accentClasses: Record<'blue' | 'purple' | 'green' | 'burgundy', string> = {
    blue: 'text-blue-400',
    purple: 'text-pink-400',
    green: 'text-yellow-400',
    burgundy: 'text-pink-400'
  };

  const currentThemeClass = themeClasses[theme];
  const accentClass = accentClasses[theme];
  const glowClass = glowClasses[theme];

  return (
    <a
      href={href}
      className={`
        relative group block p-12 h-[550px] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
        flex flex-col justify-between overflow-hidden
        flex-1 hover:flex-[1.5]
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
           <div className={`text-4xl mb-6 grayscale group-hover:grayscale-0 group-hover:${glowClass} transition-all duration-700`}>{emoji}</div>
           <div className="flex items-center gap-2 mb-2">
             <div className="w-4 h-[1px] bg-[#6a6860] group-hover:w-8 transition-all duration-700" />
             <span className="font-mono text-[10px] tracking-[0.2em] text-[#6a6860] uppercase">{subtext}</span>
           </div>
           <h2 className="font-heading text-6xl leading-[1.1] tracking-tight text-white mb-8 group-hover:tracking-[0.05em] transition-all duration-1000">
            {title}
          </h2>
          <p className="text-[13px] leading-relaxed text-[#6a6860] group-hover:text-[#999] transition-colors duration-500 max-w-[280px]">
            {desc}
          </p>
        </div>
      </div>

      <div className="relative z-10">
        <span className={`font-mono text-[11px] tracking-[0.15em] font-bold ${accentClass} uppercase flex items-center gap-2 group-hover:gap-4 transition-all duration-500`}>
          {linkText} <span className="text-lg transition-transform group-hover:translate-x-2">→</span>
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
