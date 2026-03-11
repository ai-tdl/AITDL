"use client"

import React from 'react'

export default function Door({
  label, title, desc, points, href, theme, accent, isPickerTrigger, linkText, emoji
}: {
  label: string, title: string, desc: string, points?: string[], href: string, 
  theme: 'blue' | 'purple' | 'green' | 'burgundy', accent?: string,
  isPickerTrigger?: boolean, linkText: string, emoji: string
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
        relative group block p-12 h-[650px] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
        flex flex-col justify-between overflow-hidden
        flex-1 hover:flex-[1.5] border-t-2
        ${currentThemeClass}
      `}
      style={{ borderTopColor: accent || 'transparent' }}
      onClick={(e) => {
        if (isPickerTrigger) {
          e.preventDefault();
          (window as any).dispatchRolePicker?.();
        }
      }}
    >
      <div className="relative z-10 min-h-[420px] flex flex-col">
        <div className="mb-4 flex-1">
          <div 
            className={`text-6xl mb-8 grayscale group-hover:grayscale-0 transition-all duration-700 translate-y-0 group-hover:-translate-y-2`}
            style={{ 
              fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
              fontStyle: 'normal',
            }}
          >
             <span className="drop-shadow-none group-hover:drop-shadow-[0_0_25px_rgba(var(--primary),0.4)] transition-all duration-700">
              {emoji}
             </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-[1px] bg-[#6a6860] group-hover:w-8 transition-all duration-700" />
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#888] uppercase">{label}</span>
          </div>
          <h2 className="font-heading text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.9] tracking-tight text-white mb-6 group-hover:tracking-[0.05em] transition-all duration-1000 uppercase hi:text-[0.9em] sa:text-[0.9em]">
            {title}
          </h2>
          <p className="text-[13px] leading-relaxed text-[#999] group-hover:text-white transition-colors duration-500 max-w-[280px] mb-8 min-h-[50px]">
            {desc}
          </p>

          {/* Trust Points / Card Body */}
          {points && points.length > 0 && (
            <ul className="space-y-3 mt-8 border-l border-white/10 pl-4 py-2 opacity-20 group-hover:opacity-100 transition-all duration-700 translate-y-2 group-hover:translate-y-0">
              {points.map((pt, idx) => (
                <li key={idx} className="text-[11px] text-[#888] flex items-start gap-2">
                  <span style={{ color: accent || '#c9a84c' }}>•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-auto">
        <span 
          className="font-mono text-[11px] tracking-[0.15em] font-bold uppercase flex items-center gap-2 group-hover:gap-4 transition-all duration-500"
          style={{ color: accent || '#c9a84c' }}
        >
          {linkText} <span className="text-xl transition-transform group-hover:translate-x-2 duration-500">→</span>
        </span>
      </div>

      {/* Hover Background Accent Glow */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-1000 pointer-events-none"
           style={{ background: `radial-gradient(circle at bottom, ${accent || '#c9a84c'}, transparent 70%)` }} />
    </a>
  );
}
