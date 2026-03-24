import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { analyzeResume } from '@/lib/openai'
import { CloudArrowUpIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const SKILLS_LIST = ['React','Node.js','Python','Java','SQL','TypeScript','MongoDB','AWS','Figma','Excel','Communication','Leadership','Sales','Marketing','Data Analysis']

export default function StudentProfile() {
  const { user, profile, setProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [completion, setCompletion] = useState(0)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [mafoiLoading, setMafoiLoading] = useState(false)
  const { register, handleSubmit, setValue, watch } = useForm<any>({ defaultValues: profile || {} })

  useEffect(() => {
    if (profile) {
      Object.keys(profile).forEach(k => setValue(k, profile[k]))
      setSelectedSkills(profile.skills || [])
      calcCompletion(profile)
    }
  }, [profile])

  const calcCompletion = (data: any) => {
    const fields = ['name','phone','city','degree','branch','graduation_year','cgpa','resume_url','photo_url','linkedin','skills']
    const filled = fields.filter(f => data[f] && data[f] !== '' && (!Array.isArray(data[f]) || data[f].length > 0))
    setCompletion(Math.round((filled.length / fields.length) * 100))
  }

  const uploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
    formData.append('resource_type', 'raw')
    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/raw/upload`, { method: 'POST', body: formData })
    const data = await res.json()
    setValue('resume_url', data.secure_url)
    setUploading(false)
    toast.success('Resume uploaded!')
  }

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
    const data = await res.json()
    setValue('photo_url', data.secure_url)
    setUploading(false)
    toast.success('Photo uploaded!')
  }

  const takeMaFoiAssessment = async () => {
    if (profile?.mafoi_taken) { toast.error('Ma Foi assessment can only be taken once.'); return }
    setMafoiLoading(true)
    // Call Ma Foi / Jombay API via backend
    const res = await fetch('/api/mafoi/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: user?.id, email: profile?.email })
    }).catch(() => null)
    if (res?.ok) {
      const data = await res.json()
      window.open(data.assessment_url, '_blank')
    } else {
      toast.error('Ma Foi API not configured. Ask admin to set up API key.')
    }
    setMafoiLoading(false)
  }

  const onSubmit = async (data: any) => {
    setLoading(true)
    data.skills = selectedSkills
    const { error } = await supabase.from('student_profiles').upsert({ ...data, user_id: user?.id })
    if (error) { toast.error(error.message); setLoading(false); return }
    setProfile({ ...profile, ...data })
    calcCompletion(data)
    toast.success('Profile saved!')
    setLoading(false)
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }

  const photoUrl = watch('photo_url')

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800">My Profile</h1>
        <span className={`badge text-sm px-4 py-2 font-bold ${completion >= 80 ? 'bg-green-100 text-green-700' : completion >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
          {completion}% Complete
        </span>
      </div>

      {/* Profile completion bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">Profile Strength</p>
          <p className="text-sm text-gray-500">{completion}%</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="bg-primary-600 h-3 rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
        </div>
        {completion < 80 && (
          <p className="text-xs text-amber-600 mt-2">Complete your profile to improve job match quality and ATS score.</p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Photo + Basic Info */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Personal Information</h3>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-2xl bg-primary-100 overflow-hidden flex items-center justify-center border-2 border-primary-200">
                {photoUrl ? <img src={photoUrl} alt="Photo" className="w-full h-full object-cover" /> :
                  <span className="text-3xl font-black text-primary-600">{profile?.name?.[0] || 'S'}</span>}
              </div>
              <label className="cursor-pointer text-xs text-primary-600 font-semibold hover:underline">
                Upload Photo
                <input type="file" className="hidden" accept="image/*" onChange={uploadPhoto} />
              </label>
            </div>
            <div className="flex-1 grid sm:grid-cols-2 gap-4">
              <input {...register('name', { required: true })} className="input-field" placeholder="Full Name" />
              <input {...register('phone')} className="input-field" placeholder="Phone Number" />
              <input {...register('city')} className="input-field" placeholder="City" />
              <input {...register('dob')} type="date" className="input-field" />
              <select {...register('gender')} className="input-field">
                <option value="">Gender</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
              <input {...register('linkedin')} className="input-field" placeholder="LinkedIn URL" />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Education</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input {...register('degree')} className="input-field" placeholder="Degree (e.g. B.E Computer Science)" />
            <input {...register('branch')} className="input-field" placeholder="Branch / Specialization" />
            <input {...register('college_name')} className="input-field" placeholder="College Name" />
            <input {...register('graduation_year')} type="number" className="input-field" placeholder="Graduation Year (e.g. 2025)" />
            <input {...register('cgpa')} type="number" step="0.01" className="input-field" placeholder="CGPA / Percentage" />
            <input {...register('github')} className="input-field" placeholder="GitHub URL" />
          </div>
        </div>

        {/* Skills */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {SKILLS_LIST.map(s => (
              <button key={s} type="button" onClick={() => toggleSkill(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all
                  ${selectedSkills.includes(s) ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-400'}`}>
                {s}
              </button>
            ))}
          </div>
          <input className="input-field mt-2" placeholder="Type custom skill and press Enter..." 
            onKeyDown={(e: any) => { if (e.key === 'Enter') { e.preventDefault(); const v = e.target.value.trim(); if (v) { toggleSkill(v); e.target.value = '' } } }} />
        </div>

        {/* Resume Upload */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Resume</h3>
          <div className="border-2 border-dashed border-primary-200 rounded-xl p-8 text-center hover:border-primary-400 transition-colors">
            <CloudArrowUpIcon className="w-10 h-10 text-primary-400 mx-auto mb-3" />
            <p className="text-gray-600 text-sm mb-3">Upload your latest resume (PDF recommended)</p>
            <label className="btn-primary cursor-pointer inline-block">
              {uploading ? 'Uploading...' : 'Choose Resume File'}
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={uploadResume} />
            </label>
            {watch('resume_url') && (
              <p className="text-green-600 text-sm mt-3 flex items-center justify-center gap-2">
                <CheckCircleIcon className="w-4 h-4" /> Resume uploaded successfully
              </p>
            )}
          </div>
        </div>

        {/* Ma Foi Score */}
        <div className="card border-2 border-amber-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-500" /> Ma Foi Employability Score
              </h3>
              <p className="text-sm text-gray-500 mt-1">One-time certified assessment by Jombay. Shown on your resume & to employers.</p>
              {profile?.mafoi_score && (
                <div className="mt-3 inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-xl">
                  <StarIcon className="w-5 h-5" />
                  <span className="font-black text-lg">{profile.mafoi_score}</span>
                  <span className="text-sm">/ 100</span>
                </div>
              )}
            </div>
            {!profile?.mafoi_taken ? (
              <button type="button" onClick={takeMaFoiAssessment} disabled={mafoiLoading}
                className="btn-primary flex-shrink-0 flex items-center gap-2 text-sm">
                {mafoiLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                Take Assessment
              </button>
            ) : (
              <span className="badge bg-green-100 text-green-700 flex-shrink-0">Completed ✅</span>
            )}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
          {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
          Save Profile
        </button>
      </form>
    </div>
  )
}

import { StarIcon } from '@heroicons/react/24/outline'