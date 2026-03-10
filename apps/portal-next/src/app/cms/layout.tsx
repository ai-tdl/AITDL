# || ॐ श्री गणेशाय नमः ||
#
# Organization : AITDL — AI Technology Development Lab
# Creator      : Jawahar R. Mallah
# Web          : https://aitdl.com
# Build        : AITDL Platform V3 · Vikram Samvat 2082
# Copyright    : © aitdl.com · AITDL | GANITSUTRAM.com

'use client'
// CMS Editor Layout — client-only, auth required
// Distinct from /admin — this is the content editor workspace
// Roles: workspace_admin | workspace_editor | admin | superadmin

import { useEffect, useState } from 'react'

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    // TODO: replace with Supabase session check
    const token = localStorage.getItem('aitdl_token')
    setAuthorized(!!token)
  }, [])

  if (authorized === null) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Checking access...</p>
    </div>
  )

  if (!authorized) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">CMS access required.</p>
        <a href="/admin" className="text-purple-400 text-sm hover:underline">← Back to Admin</a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* CMS Sidebar */}
      <nav className="w-56 bg-gray-900 border-r border-white/10 p-4 flex flex-col gap-1">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">CMS</p>
        {[
          { href: '/cms', label: 'Dashboard' },
          { href: '/cms/pages', label: 'Pages' },
          { href: '/cms/blog', label: 'Blog' },
          { href: '/cms/media', label: 'Media' },
          { href: '/cms/forms', label: 'Forms' },
          { href: '/cms/ai', label: 'AI Tools' },
        ].map(item => (
          <a key={item.href} href={item.href}
            className="text-sm text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors">
            {item.label}
          </a>
        ))}
      </nav>
      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
