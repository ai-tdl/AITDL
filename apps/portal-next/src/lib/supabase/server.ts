// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// Supabase server-side client — for SSR + Server Components + Route Handlers

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Purpose : Create a Supabase client for server-side use (SSR, Server Components).
 *           Reads/writes auth cookies automatically via Next.js cookies() API.
 * Usage   : const supabase = await createSupabaseServerClient()
 *           const { data: { user } } = await supabase.auth.getUser()
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll called from a Server Component — safe to ignore
            // Middleware handles cookie refresh in this case
          }
        },
      },
    }
  )
}
