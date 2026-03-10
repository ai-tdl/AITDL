// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// Admin Dashboard Overview — Client Component

'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function AdminDashboardPage() {
  const supabase = createSupabaseBrowserClient()
  const [stats, setStats] = useState({
    leads: 0,
    partners: 0,
    newToday: 0,
    conversion: '—'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true })
      const { count: partnersCount } = await supabase.from('partners').select('*', { count: 'exact', head: true })

      setStats({
        leads: leadsCount || 0,
        partners: partnersCount || 0,
        newToday: 0,
        conversion: '24%'
      })
      setIsLoading(false)
    }

    fetchStats()
  }, [supabase])

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Leads',
        data: [12, 19, 3, 5, 2, 3, 7],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { display: false },
      x: { grid: { display: false }, ticks: { color: '#555', font: { size: 10 } } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111',
        titleFont: { size: 10 },
        bodyFont: { size: 10 },
        padding: 10,
        displayColors: false
      }
    }
  }

  return (
    <div className="p-12">
      <header className="mb-12 text-center md:text-left">
        <h1 className="font-display text-4xl font-bold text-white mb-2 tracking-tight">Platform Overview</h1>
        <p className="text-zinc-500 text-sm font-medium">Real-time ecosystem metrics · v3.0</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MetricCard label="Total Leads" value={stats.leads} trend="+12%" />
        <MetricCard label="Partner Apps" value={stats.partners} trend="+4%" />
        <MetricCard label="New Submissions" value={stats.newToday} subText="Last 24h" />
        <MetricCard label="Conversion Rate" value={stats.conversion} trend="+2%" />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Chart */}
        <div className="glass lg:col-span-3 p-8 rounded-3xl border-white/5 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Lead Velocity</h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Daily trend over last 7 days</p>
            </div>
            <div className="flex gap-2 items-center bg-violet-600/10 px-3 py-1.5 rounded-full border border-violet-500/20">
               <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
               <span className="text-[9px] text-violet-300 uppercase tracking-widest font-bold">Live Feed</span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
             <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Region Breakdown */}
        <div className="glass lg:col-span-2 p-8 rounded-3xl border-white/5 h-[400px] flex flex-col">
          <h2 className="text-lg font-bold text-white mb-2 tracking-tight">Regional Distribution</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-10">Top City Inquiries</p>
          
          <div className="flex-1 space-y-6">
             {[
               { city: 'Mumbai', val: 45, color: 'bg-violet-500' },
               { city: 'Delhi NCR', val: 28, color: 'bg-blue-500' },
               { city: 'Nashik', val: 18, color: 'bg-emerald-500' },
               { city: 'Other', val: 9, color: 'bg-zinc-700' }
             ].map(item => (
               <div key={item.city} className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-[0.1em] font-bold">
                    <span className="text-zinc-400">{item.city}</span>
                    <span className="text-white">{item.val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.5)]`} 
                      style={{ width: `${item.val}%` }} 
                    />
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, trend, subText }: { label: string, value: string | number, trend?: string, subText?: string }) {
  return (
    <div className="glass p-8 rounded-3xl border-white/5 hover:border-violet-500/20 transition-all">
      <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] mb-4 font-bold">{label}</p>
      <div className="flex items-end gap-3">
        <p className="text-4xl font-display font-bold text-white">{value}</p>
        {trend && <span className="text-xs text-emerald-400 font-bold mb-1.5">{trend}</span>}
        {subText && <span className="text-[10px] text-zinc-500 mb-1.5 tracking-tight font-medium uppercase">{subText}</span>}
      </div>
    </div>
  )
}
