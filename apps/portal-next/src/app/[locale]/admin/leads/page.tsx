'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { ShellSidebar } from '@/components/visual/ShellSidebar'

export default function LeadsPage() {
  const supabase = createSupabaseBrowserClient()
  const [leads, setLeads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      const { data: { session: activeSession } } = await supabase.auth.getSession()
      setSession(activeSession)

      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      
      setLeads(data || [])
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
            <h1 className="font-display text-4xl font-bold text-white mb-2">Contact Leads</h1>
            <p className="text-zinc-500 text-sm">Direct inquiries from the portal</p>
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
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Name / Business</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Section</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 text-xs italic tracking-widest">Loading leads...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 text-xs italic tracking-widest">No leads found.</td>
                </tr>
              ) : leads.map(lead => (
                <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-xs font-mono text-zinc-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-white">{lead.name}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{lead.business || 'Individual'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-300">{lead.email || '—'}</p>
                    <p className="text-xs text-zinc-500">{lead.phone || '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-violet-600/10 border border-violet-500/20 text-[10px] text-violet-400 font-bold uppercase tracking-widest">
                      {lead.section}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
                      View Details →
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
