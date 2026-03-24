import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { PlusIcon, PencilIcon, EyeIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const STATUS_COLOR: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending:  'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function EmployerJobs() {
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('jobs').select('*').eq('employer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setJobs(data ?? []); setLoading(false) })
  }, [user])

  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job?')) return
    await supabase.from('jobs').delete().eq('id', id)
    setJobs(prev => prev.filter(j => j.id !== id))
    toast.success('Job deleted')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800">My Job Posts</h1>
        <Link to="/employer/jobs/post"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Post New Job
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-16">
          <p className="text-gray-400 text-lg mb-4">No jobs posted yet.</p>
          <Link to="/employer/jobs/post"
            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700">
            Post Your First Job
          </Link>
        </div>
      ) : jobs.map(job => (
        <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-gray-800 truncate">{job.title}</h3>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${STATUS_COLOR[job.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {job.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>{job.location}</span>
              <span>{job.employment_type}</span>
              <span className="text-green-600 font-semibold">{job.salary_range}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link to={`/employer/candidates?job=${job.id}`}
              className="p-2 bg-gray-100 rounded-xl hover:bg-blue-100" title="View Candidates">
              <EyeIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <Link to={`/employer/jobs/edit/${job.id}`}
              className="p-2 bg-gray-100 rounded-xl hover:bg-blue-100" title="Edit">
              <PencilIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <button onClick={() => deleteJob(job.id)}
              className="p-2 bg-gray-100 rounded-xl hover:bg-red-100" title="Delete">
              <XCircleIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
