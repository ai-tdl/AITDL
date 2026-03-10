// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// CMS Editor Layout — Server Component · Supabase SSR auth

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ShellSidebar } from '@/components/visual/ShellSidebar'

export const dynamic = 'force-dynamic'

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
  let user = null
  let role = ''
  let workspaceId = 'aitdl'

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
      redirect('/admin')
    }

    user = data.user
    role = user.app_metadata?.role ?? user.user_metadata?.role ?? ''
    workspaceId = user.app_metadata?.workspace_id ?? 'aitdl'

    if (!CMS_ALLOWED_ROLES.has(role)) {
      redirect('/admin')
    }
  } catch (err) {
    console.error('CMS Auth Error:', err)
    redirect('/admin')
  }

  if (user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex">
        <ShellSidebar user={user} role={role} workspaceId={workspaceId} />
        
        {/* ── Main Content ────────────────────────────────────── */}
        <main className="flex-1 overflow-auto bg-zinc-950/50">{children}</main>
      </div>
    )
  }

  return null
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
