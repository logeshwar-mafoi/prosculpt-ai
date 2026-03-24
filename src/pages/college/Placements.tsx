import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { BriefcaseIcon, CurrencyRupeeIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function CollegePlacements() {
  const { profile } = useAuthStore()
  const [drives, setDrives] = useState<any[]>([])
  const [offers, setOffers] = useState<any[]>([])

  useEffect(() => {
    if (!profile?.id) return
    supabase.from('placement_drives').select('*, employer_profiles(company_name)').eq('college_id', profile.id)
      .then(({ data }) => setDrives(data || []))
  }, [profile])

  const chartData = [
    {batch:'2022',placed:120},{batch:'2023',placed:178},{batch:'2024',placed:205},{batch:'2025',placed:231}
  ]

  const statusColor: Record<string,string> = {
    pending:'bg-amber-100 text-amber-700', approved:'bg-blue-100 text-blue-700',
    active:'bg-green-100 text-green-700', completed:'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">Placement Overview</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Year-wise Placement Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="batch" tick={{fontSize:12}} /><YAxis hide />
              <Tooltip /><Bar dataKey="placed" fill="#2563eb" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card space-y-4">
          <h3 className="font-bold text-gray-800">Placement Stats</h3>
          {[
            { label:'Highest Package', value:'28 LPA', icon:CurrencyRupeeIcon, color:'text-green-600' },
            { label:'Average Package', value:'7.2 LPA', icon:CurrencyRupeeIcon, color:'text-primary-600' },
            { label:'Top Recruiter', value:'TCS', icon:BuildingOfficeIcon, color:'text-purple-600' },
            { label:'Placement %', value:'81%', icon:BriefcaseIcon, color:'text-amber-600' },
          ].map((s,i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <s.icon className={`w-4 h-4 ${s.color}`} />{s.label}
              </div>
              <span className={`font-black ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4">Placement Drives</h3>
        {drives.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No drives scheduled yet.</p>
        ) : drives.map(d => (
          <div key={d.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div>
              <p className="font-semibold text-gray-800">{d.title}</p>
              <p className="text-sm text-primary-600">{d.employer_profiles?.company_name}</p>
              <p className="text-xs text-gray-500">{d.drive_date} • {d.location}</p>
            </div>
            <span className={`badge ${statusColor[d.status]}`}>{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}