'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

import { ShellSidebar } from '@/components/visual/ShellSidebar'

/**
 * Purpose : Entry point for /admin. 
 *           Shows login form if unauthenticated.
 *           Redirects/Shows dashboard if authenticated.
 */
export default function AdminPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  
  // Auth Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session: activeSession } } = await supabase.auth.getSession()
      setSession(activeSession)
      setIsLoading(false)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMsg(error.message)
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="loader ring-2 ring-violet-500/20" />
      </div>
    )
  }

  // If already logged in, show the Admin Shell
  if (session) {
    const role = session.user.app_metadata?.role || 'admin'
    const workspaceId = session.user.app_metadata?.workspace_id || 'aitdl'

    return (
      <div className="min-h-screen bg-zinc-950 flex font-sans">
        <ShellSidebar user={session.user} role={role} workspaceId={workspaceId} />
        
        <main className="flex-1 p-12 overflow-auto">
          <header className="mb-12">
            <h1 className="font-display text-4xl font-bold text-white mb-2">Platform Overview</h1>
            <p className="text-zinc-500">Welcome back, {session.user.email}</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Leads" value="—" color="border-blue-500/20" />
            <StatCard title="Partner Apps" value="—" color="border-emerald-500/20" />
            <StatCard title="Storage Usage" value="12%" color="border-violet-500/20" />
          </div>

          <div className="mt-12 glass p-10 rounded-3xl border-white/5">
             <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="/cms/pages" className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-sm font-medium">
                   ✍️ Create New Page
                </a>
                <a href="/cms/blog" className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-sm font-medium">
                   📝 Write Blog Post
                </a>
             </div>
          </div>
        </main>
      </div>
    )
  }

  // Login Form
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Authenticate Access</h1>
          <p className="text-zinc-500 text-sm italic">॥ ॐ श्री गणेशाय नमः ॥</p>
        </div>

        <form onSubmit={handleLogin} className="glass p-8 rounded-2xl border-white/5 space-y-5">
          <div>
            <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-widest">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@aitdl.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-widest">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          {errorMsg && (
            <p className="text-red-400 text-xs px-1">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-violet-600/10"
          >
            {isSubmitting ? 'Verifying...' : 'Authorize Login →'}
          </button>
        </form>

        <p className="text-center mt-8 text-xs text-zinc-700 tracking-tighter">
          AITDL PLATFORM V3 · SECURE SESSION CONTROL
        </p>
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string, value: string, color: string }) {
  return (
    <div className={`glass p-8 rounded-2xl border-white/5 border-l-4 ${color}`}>
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-display font-bold text-white">{value}</p>
    </div>
  )
}
