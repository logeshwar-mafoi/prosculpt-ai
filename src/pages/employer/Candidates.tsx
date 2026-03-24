import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { MagnifyingGlassIcon, StarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const STATUS_COLOR: Record<string, string> = {
  applied:         'bg-blue-100 text-blue-700',
  assessment_done: 'bg-purple-100 text-purple-700',
  shortlisted:     'bg-green-100 text-green-700',
  offered:         'bg-teal-100 text-teal-700',
  rejected:        'bg-red-100 text-red-700',
}

export default function EmployerCandidates() {
  const { user } = useAuthStore()
  const [candidates, setCandidates] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('jobs').select('id, title').eq('employer_id', user.id).then(({ data }) => setJobs(data ?? []))
    supabase.from('applications')
      .select('*, student_profiles(*), jobs!inner(employer_id, title)')
      .eq('jobs.employer_id', user.id)
      .order('assessment_score', { ascending: false })
      .then(({ data }) => { setCandidates(data ?? []); setLoading(false) })
  }, [user])

  const updateStatus = async (appId: string, status: string) => {
    await supabase.from('applications').update({ status }).eq('id', appId)
    setCandidates(prev => prev.map(c => c.id === appId ? { ...c, status } : c))
    toast.success(`Status updated to ${status}`)
  }

  const filtered = candidates.filter(c => {
    const matchJob = selectedJob === 'all' || c.job_id === selectedJob
    const q = search.toLowerCase()
    return matchJob && (c.student_profiles?.name?.toLowerCase().includes(q) || c.student_profiles?.email?.toLowerCase().includes(q))
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">Candidates</h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Search by name or email..." />
        </div>
        <select value={selectedJob} onChange={e => setSelectedJob(e.target.value)}
          className="w-56 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
          <option value="all">All Jobs</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-12 text-gray-400">No candidates found.</div>
      ) : filtered.map((c, rank) => {
        const sp = c.student_profiles
        return (
          <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-black text-blue-700 text-sm flex-shrink-0">#{rank + 1}</div>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">{sp?.name?.[0] ?? 'S'}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{sp?.name}</p>
              <p className="text-xs text-gray-500 truncate">{sp?.degree} Â· {sp?.college_name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {sp?.skills?.slice(0, 3).map((s: string) => <span key={s} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{s}</span>)}
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0 text-center">
              {c.assessment_score != null && <div><p className="text-lg font-black text-purple-600">{c.assessment_score}%</p><p className="text-xs text-gray-400">Assessment</p></div>}
              {sp?.ats_score > 0 && <div><p className="text-lg font-black text-blue-600">{sp.ats_score}%</p><p className="text-xs text-gray-400">ATS</p></div>}
              {sp?.mafoi_score && <div className="flex items-center gap-1"><StarIcon className="w-4 h-4 text-amber-500" /><p className="text-lg font-black text-amber-600">{sp.mafoi_score}</p></div>}
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${STATUS_COLOR[c.status] ?? 'bg-gray-100 text-gray-600'}`}>{c.status?.replace('_', ' ')}</span>
            <div className="flex gap-2 flex-shrink-0">
              {sp?.resume_url && <a href={sp.resume_url} target="_blank" rel="noreferrer" className="p-2 bg-gray-100 rounded-xl hover:bg-blue-100"><DocumentArrowDownIcon className="w-4 h-4 text-gray-600" /></a>}
              {c.status !== 'shortlisted' && c.status !== 'offered' && (
                <button onClick={() => updateStatus(c.id, 'shortlisted')} className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700">Shortlist</button>
              )}
              {c.status === 'shortlisted' && (
                <button onClick={() => updateStatus(c.id, 'offered')} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700">Send Offer</button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}