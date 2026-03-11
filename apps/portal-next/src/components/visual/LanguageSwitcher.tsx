"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname()
  
  // Function to get the new path with the selected locale
  const getPathForLocale = (locale: string) => {
    if (!pathname) return `/${locale}`
    const segments = pathname.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  const locales = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'sa', label: 'संस्कृतम्' }
  ]

  return (
    <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.2em] border-l border-white/10 pl-6 ml-6">
      <span className="text-white/20 mr-2">|</span>
      {locales.map((loc, index) => (
        <React.Fragment key={loc.code}>
          <Link
            href={getPathForLocale(loc.code)}
            className={`transition-all duration-300 relative group ${
              currentLocale === loc.code ? 'text-[#c9a84c] font-bold' : 'text-[#444] hover:text-[#888]'
            }`}
          >
            {loc.label}
            <span className={`absolute -bottom-1 left-0 w-0 h-[1px] bg-[#c9a84c] transition-all duration-300 group-hover:w-full ${currentLocale === loc.code ? 'w-full' : ''}`} />
          </Link>
          {index < locales.length - 1 && <span className="text-[#222]">|</span>}
        </React.Fragment>
      ))}
    </div>
  )
}
