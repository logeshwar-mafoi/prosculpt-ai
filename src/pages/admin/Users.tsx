import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

export default function AdminUsers() {
  const [students, setStudents] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('student_profiles').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => setStudents(data || []))
  }, [])

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">Student Users</h1>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-12" placeholder="Search students..." />
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              {['Name','Email','College','Branch','Ma Foi','ATS','Joined','Actions'].map(h => (
                <th key={h} className="px-4 py-3 font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800">{s.name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{s.email}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{s.college_name || '—'}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{s.branch || '—'}</td>
                <td className="px-4 py-3 text-amber-600 font-bold">{s.mafoi_score || '—'}</td>
                <td className="px-4 py-3 text-primary-600 font-bold">{s.ats_score ? `${s.ats_score}%` : '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {s.created_at ? formatDistanceToNow(new Date(s.created_at), { addSuffix: true }) : '—'}
                </td>
                <td className="px-4 py-3">
                  <button className="text-xs text-red-600 hover:underline">Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}