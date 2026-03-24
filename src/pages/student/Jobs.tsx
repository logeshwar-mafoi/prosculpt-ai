import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { MagnifyingGlassIcon, MapPinIcon, BriefcaseIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline'

export default function StudentJobs() {
  const [jobs, setJobs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const { user } = useAuthStore()

  useEffect(() => {
    supabase.from('jobs').select('*, employer_profiles(company_name)').eq('status', 'approved').then(({ data }) => {
      if (data) setJobs(data)
    })
  }, [])

  const apply = async (jobId: string, hasAssessment: boolean) => {
    const { error } = await supabase.from('applications').insert({
      job_id: jobId, student_id: user?.id, status: 'applied'
    })
    if (error) { toast.error('Already applied or error'); return }
    toast.success(hasAssessment ? 'Applied! Complete the assessment to proceed.' : 'Application submitted!')
  }

  const filtered = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.employer_profiles?.company_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-12" placeholder="Search jobs, companies..." />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field w-40">
          <option value="all">All Jobs</option>
          <option value="it">IT</option>
          <option value="non-it">Non-IT</option>
          <option value="remote">Remote</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 && (
          <div className="card text-center py-12 text-gray-400">
            <BriefcaseIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            No jobs found. Check back soon!
          </div>
        )}
        {filtered.map(job => (
          <div key={job.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-gray-800 text-lg">{job.title}</h3>
                  {job.has_assessment && <span className="badge bg-purple-100 text-purple-700">Assessment</span>}
                  {job.job_type === 'remote' && <span className="badge bg-green-100 text-green-700">Remote</span>}
                </div>
                <p className="text-primary-600 font-semibold">{job.employer_profiles?.company_name}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4" />{job.location}</span>
                  <span className="flex items-center gap-1"><CurrencyRupeeIcon className="w-4 h-4" />{job.salary_range}</span>
                  <span className="flex items-center gap-1"><BriefcaseIcon className="w-4 h-4" />{job.job_type}</span>
                </div>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{job.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.skills?.map((s: string) => (
                    <span key={s} className="badge bg-primary-100 text-primary-700">{s}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => apply(job.id, job.has_assessment)} className="btn-primary py-2 px-5 text-sm">
                  Apply Now
                </button>
                <button className="btn-outline py-2 px-5 text-sm">Save</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
