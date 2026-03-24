import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { UsersIcon, BriefcaseIcon, CheckCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function HeatmapCell({ count }: { count: number }) {
  const cls = count === 0 ? 'bg-gray-100' : count === 1 ? 'bg-primary-200' : count === 2 ? 'bg-primary-400' : 'bg-primary-700'
  return <div className={`w-3 h-3 rounded-sm ${cls}`} title={`${count} logins`} />
}

export default function CollegeDashboard() {
  const { user, profile } = useAuthStore()
  const [stats, setStats] = useState({ total:0, active:0, placed:0, drives:0 })
  const [weeklyLogins, setWeeklyLogins] = useState<any[]>([])

  useEffect(() => {
    if (!profile?.id) return
    Promise.all([
      supabase.from('student_profiles').select('id', { count:'exact', head:true }).eq('college_id', profile.id),
      supabase.from('placement_drives').select('id', { count:'exact', head:true }).eq('college_id', profile.id),
    ]).then(([students, drives]) => {
      setStats(s => ({ ...s, total: students.count || 0, drives: drives.count || 0, active: Math.round((students.count||0)*0.7), placed: Math.round((students.count||0)*0.4) }))
    })
    // Mock weekly login data
    setWeeklyLogins([
      {day:'Mon',logins:34},{day:'Tue',logins:52},{day:'Wed',logins:41},
      {day:'Thu',logins:67},{day:'Fri',logins:48},{day:'Sat',logins:19},{day:'Sun',logins:11}
    ])
  }, [profile])

  // Mock 12-week heatmap data
  const heatmap = Array.from({ length: 12 * 7 }, () => Math.floor(Math.random() * 4))

  return (
    <div className="space-y-6">
      <div className="bg-hero-gradient rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-black">{profile?.college_name || 'College'} Dashboard</h1>
        <p className="text-primary-200 mt-1">Placement & Student Analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Students', value:stats.total, icon:UsersIcon, color:'bg-blue-50 text-blue-600' },
          { label:'Active Today', value:stats.active, icon:CheckCircleIcon, color:'bg-green-50 text-green-600' },
          { label:'Students Placed', value:stats.placed, icon:BriefcaseIcon, color:'bg-teal-50 text-teal-600' },
          { label:'Placement Drives', value:stats.drives, icon:ChartBarIcon, color:'bg-purple-50 text-purple-600' },
        ].map((s,i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Daily Student Logins (This Week)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyLogins}>
              <XAxis dataKey="day" tick={{fontSize:12}} /><YAxis hide />
              <Tooltip /><Bar dataKey="logins" fill="#2563eb" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">12-Week Student Activity Heatmap</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-[300px]">
              {Array.from({ length: 12 }).map((_, w) => (
                <div key={w} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, d) => (
                    <HeatmapCell key={d} count={heatmap[w*7+d]} />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <span>Less</span>
            {['bg-gray-100','bg-primary-200','bg-primary-400','bg-primary-700'].map(c => (
              <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}