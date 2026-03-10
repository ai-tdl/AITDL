// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// Shared Sidebar Component for Admin & CMS

'use client'

import { usePathname } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface SidebarProps {
  user: any
  role: string
  workspaceId: string
}

export function ShellSidebar({ user, role, workspaceId }: SidebarProps) {
  const pathname = usePathname()
  const supabase = createSupabaseBrowserClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/admin'
  }

  const sections = [
    {
      label: 'Platform',
      items: [
        { href: '/admin', label: 'Dashboard', icon: '⬢' },
        { href: '/admin/leads', label: 'Leads', icon: '🎯' },
        { href: '/admin/partners', label: 'Partners', icon: '🤝' },
      ]
    },
    {
      label: 'Content',
      items: [
        { href: '/cms', label: 'Studio', icon: '⬡' },
        { href: '/cms/pages', label: 'Pages', icon: '📄' },
        { href: '/cms/blog', label: 'Blog', icon: '✍️' },
        { href: '/cms/media', label: 'Media', icon: '🖼️' },
      ]
    }
  ]

  return (
    <nav className="w-64 shrink-0 bg-zinc-900 border-r border-white/5 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-white/5">
        <p className="font-display text-lg font-bold text-white tracking-tight">AITDL Admin</p>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Workspace · {workspaceId}</p>
      </div>

      <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        {sections.map(section => (
          <div key={section.label}>
            <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] px-3 mb-4 font-bold">{section.label}</p>
            <div className="space-y-1">
              {section.items.map(item => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 text-sm px-3 py-2.5 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-violet-600/10 text-violet-400 border border-violet-500/20' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-4 bg-black/20 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs text-violet-300 font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{role}</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            ⏻
          </button>
        </div>
      </div>
    </nav>
  )
}
