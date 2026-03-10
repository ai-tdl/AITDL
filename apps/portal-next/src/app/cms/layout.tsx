// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// CMS Editor Layout — Server Component · Supabase SSR auth

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Roles allowed to access the CMS editor
const CMS_ALLOWED_ROLES = new Set([
  'superadmin',
  'admin',
  'workspace_admin',
  'workspace_editor',
])

/**
 * Purpose : Server-side auth guard for all /cms/* routes.
 *           Reads Supabase session from cookies (set by middleware).
 *           Extracts role from app_metadata — same as FastAPI backend.
 *           Redirects to /admin if unauthenticated or insufficient role.
 */
export default async function CMSLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()

  // getUser() validates the JWT server-side — safe against cookie tampering
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/admin')
  }

  // Extract role from Supabase app_metadata (mirrors backend security.py)
  const role: string = user.app_metadata?.role ?? user.user_metadata?.role ?? ''

  if (!CMS_ALLOWED_ROLES.has(role)) {
    redirect('/admin')
  }

  const workspaceId: string = user.app_metadata?.workspace_id ?? 'aitdl'

  return (
    <div className="min-h-screen bg-zinc-950 flex">

      {/* ── CMS Sidebar ─────────────────────────────────────── */}
      <nav className="w-56 shrink-0 bg-zinc-900 border-r border-white/5 flex flex-col">
        <div className="px-5 py-4 border-b border-white/5">
          <p className="font-display text-sm font-bold text-white">Content Studio</p>
          <p className="text-xs text-zinc-500 mt-0.5 truncate">{workspaceId}</p>
        </div>

        <div className="flex-1 px-3 py-4 space-y-1">
          <p className="text-xs text-zinc-600 uppercase tracking-widest px-2 mb-3">Content</p>
          {[
            { href: '/cms',       label: 'Dashboard',  icon: '⬡' },
            { href: '/cms/pages', label: 'Pages',      icon: '📄' },
            { href: '/cms/blog',  label: 'Blog',       icon: '✍️'  },
            { href: '/cms/media', label: 'Media',      icon: '🖼️'  },
            { href: '/cms/forms', label: 'Forms',      icon: '📋' },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </a>
          ))}

          <div className="pt-4">
            <p className="text-xs text-zinc-600 uppercase tracking-widest px-2 mb-3">AI Tools</p>
            <a
              href="/cms/ai"
              className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors"
            >
              <span className="text-base">🤖</span>
              AI Tools
            </a>
          </div>
        </div>

        {/* Sidebar footer */}
        <div className="px-4 py-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">{role}</p>
              <p className="text-xs text-zinc-600 truncate">{user.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">{children}</main>

    </div>
  )
}

// ── Sign Out Button (client island) ───────────────────────────
// Kept minimal — just needs onClick for Supabase signOut
function SignOutButton() {
  // For full interactivity, extract to 'use client' component
  // For now, links to /admin which clears session via middleware
  return (
    <a
      href="/api/auth/signout"
      className="text-xs text-zinc-600 hover:text-red-400 transition-colors px-2 py-1 rounded"
      title="Sign out"
    >
      ⏻
    </a>
  )
}
