import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function AdminJobs() {
  const [jobs, setJobs] = useState<any[]>([])
  const [filter, setFilter] = useState('pending')
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('jobs').select('*, employer_profiles(company_name)').eq('status', filter)
      .then(({ data }) => setJobs(data || []))
  }, [filter])

  const updateJob = async (id: string, status: string) => {
    await supabase.from('jobs').update({ status }).eq('id', id)
    setJobs(prev => prev.filter(j => j.id !== id))
    toast.success(`Job ${status}`)
  }

  const filtered = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.employer_profiles?.company_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">Job Management</h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-12" placeholder="Search jobs..." />
        </div>
        <div className="flex gap-2">
          {['pending','approved','rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary-50'}`}>{s}</button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && <div className="card text-center py-12 text-gray-400">No {filter} jobs.</div>}
        {filtered.map(job => (
          <div key={job.id} className="card flex items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-gray-800">{job.title}</p>
              <p className="text-sm text-primary-600">{job.employer_profiles?.company_name}</p>
              <p className="text-xs text-gray-500">{job.location} • {job.salary_range} • {job.job_type}</p>
              {job.has_assessment && <span className="badge bg-purple-100 text-purple-700 text-xs mt-1">Has Assessment</span>}
            </div>
            {filter === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => updateJob(job.id, 'approved')} className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-green-700">
                  <CheckCircleIcon className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => updateJob(job.id, 'rejected')} className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-red-200">
                  <XCircleIcon className="w-4 h-4" /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}