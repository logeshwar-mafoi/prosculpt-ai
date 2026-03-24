import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

export default function CollegeStudents() {
  const { profile } = useAuthStore()
  const [students, setStudents] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    supabase.from('student_profiles').select('*')
      .eq('college_id', profile.id)
      .order('mafoi_score', { ascending: false })
      .then(({ data }) => { setStudents(data || []); setLoading(false) })
  }, [profile])

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.branch?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">Students</h1>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-12" placeholder="Search by name or branch..." />
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {['Name','Branch','Year','CGPA','ATS Score','Ma Foi','Last Active','Status'].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center font-bold text-primary-700 text-xs flex-shrink-0">
                        {s.name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.branch || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.graduation_year || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{s.cgpa || '—'}</td>
                  <td className="px-4 py-3">
                    {s.ats_score ? (
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-2">
                          <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${s.ats_score}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-700">{s.ats_score}%</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {s.mafoi_score ? (
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <StarIcon className="w-3 h-3" />{s.mafoi_score}
                      </span>
                    ) : <span className="text-gray-400 text-xs">Not taken</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {s.updated_at ? formatDistanceToNow(new Date(s.updated_at), { addSuffix: true }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${s.resume_url ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {s.resume_url ? 'Ready' : 'Incomplete'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">No students found.</div>
          )}
        </div>
      )}
    </div>
  )
}