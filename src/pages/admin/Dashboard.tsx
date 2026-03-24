import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Link } from 'react-router-dom'
import {
  UsersIcon, BriefcaseIcon, BuildingOfficeIcon,
  CheckCircleIcon, ClockIcon, CurrencyRupeeIcon
} from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students:0, employers:0, colleges:0, jobs:0, pendingJobs:0, revenue:0 })
  const [pendingJobs, setPendingJobs] = useState<any[]>([])
  const [pendingEmployers, setPendingEmployers] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('student_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('employer_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('college_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('jobs').select('id', { count: 'exact', head: true }),
      supabase.from('jobs').select('*').eq('status', 'pending').limit(5),
      supabase.from('employer_profiles').select('*').eq('verified', false).limit(5),
    ]).then(([s, e, c, j, pj, pe]) => {
      setStats(prev => ({ ...prev, students: s.count||0, employers: e.count||0, colleges: c.count||0, jobs: j.count||0 }))
      setPendingJobs(pj.data || [])
      setPendingEmployers(pe.data || [])
    })
  }, [])

  const approveJob = async (jobId: string) => {
    await supabase.from('jobs').update({ status: 'approved' }).eq('id', jobId)
    setPendingJobs(prev => prev.filter(j => j.id !== jobId))
  }

  const verifyEmployer = async (empId: string) => {
    await supabase.from('employer_profiles').update({ verified: true }).eq('id', empId)
    setPendingEmployers(prev => prev.filter(e => e.id !== empId))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Students', value: stats.students, icon: UsersIcon, color: 'bg-blue-50 text-blue-600' },
          { label: 'Employers', value: stats.employers, icon: BriefcaseIcon, color: 'bg-green-50 text-green-600' },
          { label: 'Colleges', value: stats.colleges, icon: BuildingOfficeIcon, color: 'bg-purple-50 text-purple-600' },
          { label: 'Total Jobs', value: stats.jobs, icon: CheckCircleIcon, color: 'bg-amber-50 text-amber-600' },
        ].map((s, i) => (
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-amber-500" /> Pending Jobs
            </h3>
            <Link to="/admin/jobs" className="text-sm text-primary-600 hover:underline">View All</Link>
          </div>
          {pendingJobs.length === 0 && <p className="text-gray-400 text-sm text-center py-4">All caught up! ✅</p>}
          {pendingJobs.map(job => (
            <div key={job.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{job.title}</p>
                <p className="text-xs text-gray-500">{job.location} • {job.salary_range}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approveJob(job.id)} className="btn-primary py-1.5 px-3 text-xs">Approve</button>
                <button className="btn-outline py-1.5 px-3 text-xs text-red-600 border-red-300 hover:bg-red-600 hover:text-white">Reject</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5 text-primary-500" /> Pending Verifications
            </h3>
            <Link to="/admin/employers" className="text-sm text-primary-600 hover:underline">View All</Link>
          </div>
          {pendingEmployers.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No pending verifications ✅</p>}
          {pendingEmployers.map(emp => (
            <div key={emp.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{emp.company_name}</p>
                <p className="text-xs text-gray-500">{emp.email} • {emp.website}</p>
              </div>
              <button onClick={() => verifyEmployer(emp.id)} className="btn-primary py-1.5 px-3 text-xs">Verify</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
