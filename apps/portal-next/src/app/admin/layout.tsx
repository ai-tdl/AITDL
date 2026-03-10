// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// Admin Layout — Auth Guard

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

/**
 * Purpose : Client-side layout for /admin routes.
 *           Ensures authenticated users only (except for the /admin login page itself).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createSupabaseBrowserClient()
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // If we are on /admin (which is the login page) and we have a session, 
      // we stay there to show the dashboard view within AdminPage, OR we could redirect.
      // But we definitely want to block other sub-routes like /admin/dashboard or /admin/users
      
      if (!session && pathname !== '/admin') {
        router.replace('/admin')
      } else {
        setIsVerifying(false)
      }
    }

    checkUser()

    // Real-time listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && pathname !== '/admin') {
        router.replace('/admin')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, pathname])

  if (isVerifying && pathname !== '/admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="loader ring-2 ring-violet-500/20" />
      </div>
    )
  }

  return <>{children}</>
}
