import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/store/authStore'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const roles: { value: UserRole; label: string; emoji: string }[] = [
  { value: 'student', label: 'Student', emoji: '🎓' },
  { value: 'employer', label: 'Employer', emoji: '💼' },
  { value: 'college', label: 'College/TPO', emoji: '🏛️' },
  { value: 'admin', label: 'Admin', emoji: '⚙️' },
]

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, fetchProfile } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>()

  const onSubmit = async (data: any) => {
    setLoading(true)
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email, password: data.password
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    setUser(authData.user)
    localStorage.setItem('prosculpt-role', selectedRole)
    await fetchProfile(authData.user.id, selectedRole)
    toast.success('Welcome back!')
    navigate(`/${selectedRole}`)
    setLoading(false)
  }

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/${selectedRole}` }
    })
    if (error) toast.error(error.message)
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-primary-700 font-black text-2xl">P</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white">Welcome Back</h1>
          <p className="text-primary-200 mt-2">Sign in to continue to ProSculpt.AI</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Role selector */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {roles.map(r => (
              <button key={r.value} onClick={() => setSelectedRole(r.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-xs font-semibold
                  ${selectedRole === r.value ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-primary-300'}`}>
                <span className="text-xl">{r.emoji}</span>
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input {...register('email', { required: true })} type="email"
                className="input-field" placeholder="you@example.com" />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input {...register('password', { required: true, minLength: 6 })}
                type={showPw ? 'text' : 'password'}
                className="input-field pr-12" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-9 text-gray-400">
                {showPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Sign In as {roles.find(r => r.value === selectedRole)?.label}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-gray-500">or continue with</span></div>
          </div>

          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 text-sm font-semibold hover:bg-gray-50 transition-colors">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-600 mt-6">
            No account?{' '}
            <Link to={`/register?role=${selectedRole}`} className="text-primary-600 font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}