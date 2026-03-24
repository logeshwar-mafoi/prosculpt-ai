import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { BuildingOfficeIcon, AcademicCapIcon, UserIcon } from '@heroicons/react/24/outline'

type Role = 'student' | 'employer' | 'admin'

export default function Register() {
  const [role, setRole] = useState<Role>('student')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<any>()

  const onSubmit = async (data: any) => {
    setLoading(true)

    if (role === 'employer') {
      const emailDomain = data.email.split('@')[1]
      const websiteDomain = data.website
        ? data.website.replace(/https?:\/\//, '').replace(/www\./, '').split('/')[0]
        : null
      if (websiteDomain && emailDomain !== websiteDomain) {
        toast.error('Email domain must match your company website domain.')
        setLoading(false)
        return
      }
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { role } },
    })

    if (authError) { toast.error(authError.message); setLoading(false); return }

    const userId = authData.user?.id
    if (!userId) { toast.error('Registration failed.'); setLoading(false); return }

    if (role === 'student') {
      await supabase.from('student_profiles').insert({ user_id: userId, name: data.name, email: data.email })
    } else if (role === 'employer') {
      await supabase.from('employer_profiles').insert({ user_id: userId, company_name: data.company_name, email: data.email, website: data.website, verified: false })
    }

    toast.success('Account created! Please verify your email.')
    navigate('/auth/login')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-black text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join ProSculpt today</p>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          {(['student', 'employer'] as Role[]).map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${role === r ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>
              {r === 'student' ? <AcademicCapIcon className="w-4 h-4" /> : <BuildingOfficeIcon className="w-4 h-4" />}
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {role === 'student' && (
            <input {...register('name', { required: true })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Full Name" />
          )}
          {role === 'employer' && (
            <>
              <input {...register('company_name', { required: true })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Company Name" />
              <input {...register('website')} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Company Website (e.g. https://company.com)" />
            </>
          )}
          <input {...register('email', { required: true })} type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Email Address" />
          <input {...register('password', { required: true, minLength: 6 })} type="password" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Password (min 6 characters)" />
          {errors.password && <p className="text-red-500 text-xs">Password must be at least 6 characters</p>}

          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors mt-2">
            {loading && <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}