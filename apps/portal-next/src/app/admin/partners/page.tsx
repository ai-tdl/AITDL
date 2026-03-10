'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { ShellSidebar } from '@/components/visual/ShellSidebar'

export default function PartnersPage() {
  const supabase = createSupabaseBrowserClient()
  const [partners, setPartners] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      const { data: { session: activeSession } } = await supabase.auth.getSession()
      setSession(activeSession)

      const { data } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false })
      
      setPartners(data || [])
      setIsLoading(false)
    }
    loadData()
  }, [supabase])

  if (!session && !isLoading) return null

  const role = session?.user?.app_metadata?.role || 'admin'
  const workspaceId = session?.user?.app_metadata?.workspace_id || 'aitdl'

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans">
      <ShellSidebar user={session?.user} role={role} workspaceId={workspaceId} />

      <main className="flex-1 p-12 overflow-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="font-display text-4xl font-bold text-white mb-2">Partner Applications</h1>
            <p className="text-zinc-500 text-sm">Ecosystem expansion requests</p>
          </div>
          <button className="btn-premium py-2 px-6 glass text-[10px]">
            Export CSV
          </button>
        </header>

        <div className="glass rounded-3xl border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Partner / Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 text-xs italic tracking-widest">Loading partners...</td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 text-xs italic tracking-widest">No applications found.</td>
                </tr>
              ) : partners.map(partner => (
                <tr key={partner.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-xs font-mono text-zinc-500">
                    {new Date(partner.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-white">{partner.name}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{partner.role || 'Partner'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-300">{partner.city || '—'}</p>
                    <p className="text-xs text-zinc-500">{partner.email || '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-emerald-600/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                      {partner.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
                      Review →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
