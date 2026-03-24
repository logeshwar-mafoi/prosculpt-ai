import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit } = useForm<{ email: string }>()

  const onSubmit = async (data: any) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) { toast.error(error.message); return }
    setSent(true)
    toast.success('Reset link sent!')
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-black text-gray-800 mb-2">Reset Password</h1>
        <p className="text-gray-500 mb-6">Enter your email to receive a reset link.</p>
        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm">
            ✅ Reset link sent to your email. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register('email', { required: true })} type="email" className="input-field" placeholder="your@email.com" />
            <button type="submit" className="btn-primary w-full">Send Reset Link</button>
          </form>
        )}
        <Link to="/login" className="block text-center text-sm text-primary-600 mt-4 hover:underline">← Back to Login</Link>
      </div>
    </div>
  )
}