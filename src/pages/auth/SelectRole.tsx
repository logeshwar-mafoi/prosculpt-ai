import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { AcademicCapIcon, BuildingOfficeIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline'

const ROLES = [
  { id: 'student',  label: 'Student',  desc: 'Find jobs & build your career',     icon: AcademicCapIcon,     color: 'bg-blue-600' },
  { id: 'employer', label: 'Employer', desc: 'Post jobs & hire top talent',        icon: BuildingOfficeIcon,  color: 'bg-purple-600' },
  { id: 'college',  label: 'College',  desc: 'Manage placements & track students', icon: BuildingLibraryIcon, color: 'bg-teal-600' },
]

const REDIRECTS: Record<string, string> = {
  student: '/student', employer: '/employer', college: '/college'
}

export default function SelectRole() {
  const { user, fetchProfile } = useAuthStore()
  const navigate = useNavigate()

  const selectRole = async (role: string) => {
    if (!user) return

    // Save role to Supabase user metadata
    await supabase.auth.updateUser({ data: { role } })
    localStorage.setItem('prosculpt-role', role)

    // Create profile row if not exists
    const table = role === 'student' ? 'student_profiles'
      : role === 'employer' ? 'employer_profiles'
      : 'college_profiles'

    const { data: existing } = await supabase
      .from(table).select('id').eq('user_id', user.id).single()

    if (!existing) {
      await supabase.from(table).insert({
        user_id: user.id,
        name: user.user_metadata?.full_name ?? '',
        email: user.email ?? '',
        ...(role === 'employer' ? { company_name: '', verified: false } : {}),
        ...(role === 'college'  ? { college_name: '', verified: false } : {}),
      })
    }

    await fetchProfile(user.id, role)
    navigate(REDIRECTS[role], { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-black text-gray-800">Who are you?</h1>
          <p className="text-gray-500 text-sm mt-1">Select your role to continue</p>
        </div>
        <div className="space-y-3">
          {ROLES.map(r => (
            <button key={r.id} onClick={() => selectRole(r.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group">
              <div className={`w-12 h-12 ${r.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <r.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800 group-hover:text-blue-700">{r.label}</p>
                <p className="text-sm text-gray-500">{r.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
