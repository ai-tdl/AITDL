// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// Supabase browser client — for 'use client' components

import { createBrowserClient } from '@supabase/ssr'

/**
 * Purpose : Create a Supabase client for client-side use ('use client' components).
 *           Singleton pattern — safe to call multiple times.
 * Usage   : const supabase = createSupabaseBrowserClient()
 *           await supabase.auth.signOut()
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
