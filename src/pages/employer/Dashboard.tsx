import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { BriefcaseIcon, UsersIcon, CheckCircleIcon, ClockIcon, PlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const WEEK = [
  { name: 'Mon', v: 12 }, { name: 'Tue', v: 19 }, { name: 'Wed', v: 8 },
  { name: 'Thu', v: 24 }, { name: 'Fri', v: 17 }, { name: 'Sat', v: 6 }, { name: 'Sun', v: 3 },
]
const PIE = [
  { name: 'Applied', value: 45, color: '#3b82f6' },
  { name: 'Assessment', value: 28, color: '#8b5cf6' },
  { name: 'Shortlisted', value: 15, color: '#10b981' },
  { name: 'Rejected', value: 12, color: '#ef4444' },
]
const STATUS_BADGE: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending:  'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function EmployerDashboard() {
  const { user, profile } = useAuthStore()
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, totalApplicants: 0, shortlisted: 0 })
  const [recentJobs, setRecentJobs] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('jobs').select('*').eq('employer_id', user.id),
      supabase.from('applications').select('*, jobs!inner(employer_id)').eq('jobs.employer_id', user.id),
    ]).then(([jobs, apps]) => {
      const j = jobs.data ?? []
      const a = apps.data ?? []
      setStats({ totalJobs: j.length, activeJobs: j.filter((x: any) => x.status === 'approved').length, totalApplicants: a.length, shortlisted: a.filter((x: any) => x.status === 'shortlisted').length })
      setRecentJobs(j.slice(0, 5))
    })
  }, [user])

  return (
    <div className="space-y-6">
      {!profile?.verified && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <ShieldCheckIcon className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">Account Pending Verification</p>
            <p className="text-sm text-amber-600">Admin will verify your company within 24 hours.</p>
          </div>
        </div>
      )}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Welcome, {profile?.company_name ?? 'Employer'} ðŸ‘‹</h1>
          <p className="text-blue-200 mt-1">You have <strong className="text-white">{stats.totalApplicants}</strong> total applicants.</p>
        </div>
        <Link to="/employer/jobs/post" className="bg-white text-blue-700 font-bold px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-50 flex-shrink-0">
          <PlusIcon className="w-5 h-5" /> Post Job
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: stats.totalJobs, icon: BriefcaseIcon, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active Jobs', value: stats.activeJobs, icon: CheckCircleIcon, color: 'bg-green-50 text-green-600' },
          { label: 'Total Applicants', value: stats.totalApplicants, icon: UsersIcon, color: 'bg-purple-50 text-purple-600' },
          { label: 'Shortlisted', value: stats.shortlisted, icon: ClockIcon, color: 'bg-amber-50 text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="w-6 h-6" /></div>
            <div><p className="text-2xl font-black text-gray-800">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Applications This Week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEK}><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis hide /><Tooltip /><Bar dataKey="v" fill="#2563eb" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Application Status</h3>
          <div className="flex justify-center">
            <PieChart width={200} height={180}>
              <Pie data={PIE} cx={100} cy={90} innerRadius={45} outerRadius={75} dataKey="value">
                {PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie><Tooltip />
            </PieChart>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {PIE.map(p => <span key={p.name} className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-3 h-3 rounded-full" style={{ background: p.color }} />{p.name}</span>)}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Recent Job Posts</h3>
          <Link to="/employer/jobs" className="text-sm text-blue-600 hover:underline">View All</Link>
        </div>
        {recentJobs.length === 0 ? (
          <div className="text-center py-8">
            <BriefcaseIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400">No jobs posted yet.</p>
            <Link to="/employer/jobs/post" className="bg-blue-600 text-white font-bold px-5 py-2 rounded-xl mt-4 inline-block text-sm">Post Your First Job</Link>
          </div>
        ) : recentJobs.map(job => (
          <div key={job.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div><p className="font-semibold text-gray-800">{job.title}</p><p className="text-xs text-gray-500">{job.location} Â· {job.salary_range}</p></div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_BADGE[job.status] ?? 'bg-gray-100 text-gray-600'}`}>{job.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}