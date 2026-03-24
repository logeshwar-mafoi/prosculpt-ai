import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ClipboardDocumentListIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline'

const TYPE_COLORS: Record<string, string> = {
  Quiz:           'bg-blue-100 text-blue-700',
  Coding:         'bg-purple-100 text-purple-700',
  Psychometric:   'bg-teal-100 text-teal-700',
}
TYPE_COLORS['AI Interview'] = 'bg-amber-100 text-amber-700'

export default function AdminAssessments() {
  const [assessments, setAssessments] = useState<any[]>([])

  useEffect(() => {
    supabase.from('assessments')
      .select('*, jobs(title, employer_profiles(company_name))')
      .order('created_at', { ascending: false })
      .then(({ data }) => setAssessments(data ?? []))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">Assessments</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Assessments', value: assessments.length, icon: ClipboardDocumentListIcon },
          { label: 'Completed by Students', value: 'â€”', icon: UsersIcon },
          { label: 'Avg Completion Time', value: '22 min', icon: ClockIcon },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-3">
            <s.icon className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-black text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {assessments.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 text-center py-12 text-gray-400">
            No assessments yet.
          </div>
        )}
        {assessments.map(a => (
          <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="font-bold text-gray-800">{a.jobs?.title}</p>
            <p className="text-sm text-blue-600">{a.jobs?.employer_profiles?.company_name}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${TYPE_COLORS[a.type] ?? 'bg-gray-100 text-gray-600'}`}>{a.type}</span>
              <span className="text-xs text-gray-500 flex items-center gap-1"><ClockIcon className="w-3 h-3" />{a.time_limit} min</span>
              <span className="text-xs text-gray-500">{a.questions?.length ?? 0} questions</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}