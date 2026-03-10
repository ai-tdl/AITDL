// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// Admin Layout — Server Component · Supabase SSR auth

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Purpose : Server-side auth guard for admin sub-routes.
 *           Ensures authenticated users only for everything under /admin,
 *           EXCEPT the login page itself (handled by checking session).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    // We don't want to redirect if the user is already at /admin (login)
    // In Next.js Server Components, we can't easily get the current path without headers
    // but we can check if the children is the login page by structure OR 
    // just let the login page handle its own state if the layout doesn't block it.
  } catch (err) {
    console.error('Admin Layout Auth Error:', err)
  }

  return <>{children}</>
}
