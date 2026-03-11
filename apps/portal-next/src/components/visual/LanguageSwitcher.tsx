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
            className={`transition-all duration-300 hover:text-white ${
              currentLocale === loc.code ? 'text-[#c9a84c] font-bold' : 'text-[#444]'
            }`}
          >
            {loc.label}
          </Link>
          {index < locales.length - 1 && <span className="text-[#222]">|</span>}
        </React.Fragment>
      ))}
    </div>
  )
}
