import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { generateJobAssessment } from '@/lib/openai'
import { SparklesIcon } from '@heroicons/react/24/outline'

export default function PostJob() {
  const { register, handleSubmit, watch } = useForm<any>()
  const [loading, setLoading] = useState(false)
  const [assessmentTypes, setAssessmentTypes] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()

  const toggleAssessment = (type: string) => {
    setAssessmentTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const onSubmit = async (data: any) => {
    setLoading(true)
    const skillsArr = data.skills?.split(',').map((s: string) => s.trim()) || []
    const { data: job, error } = await supabase.from('jobs').insert({
      title: data.title,
      description: data.description,
      location: data.location,
      salary_range: data.salary,
      job_type: data.job_type,
      skills: skillsArr,
      employer_id: user?.id,
      has_assessment: assessmentTypes.length > 0,
      assessment_types: assessmentTypes,
      status: 'pending',
      deadline: data.deadline,
    }).select().single()
    if (error) { toast.error(error.message); setLoading(false); return }

    // AI generate assessments
    if (assessmentTypes.length > 0 && job) {
      setGenerating(true)
      for (const type of assessmentTypes) {
        const raw = await generateJobAssessment(data.title, data.description, type).catch(() => null)
        if (raw) {
          try {
            const parsed = JSON.parse(raw)
            await supabase.from('assessments').insert({ job_id: job.id, type, questions: parsed.questions, time_limit: parsed.timeLimit })
          } catch { }
        }
      }
      setGenerating(false)
    }
    toast.success('Job submitted for admin approval!')
    navigate('/employer/jobs')
    setLoading(false)
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-black text-gray-800 mb-6">Post a New Job</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card space-y-4">
          <h3 className="font-bold text-gray-800">Job Details</h3>
          <input {...register('title', { required: true })} className="input-field" placeholder="Job Title (e.g. Frontend Developer)" />
          <textarea {...register('description', { required: true })} rows={5} className="input-field resize-none" placeholder="Job Description..." />
          <div className="grid sm:grid-cols-2 gap-4">
            <input {...register('location', { required: true })} className="input-field" placeholder="Location (e.g. Chennai / Remote)" />
            <input {...register('salary', { required: true })} className="input-field" placeholder="Salary Range (e.g. 4-8 LPA)" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <select {...register('job_type')} className="input-field">
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
            <input {...register('deadline')} type="date" className="input-field" />
          </div>
          <input {...register('skills')} className="input-field" placeholder="Required Skills (comma separated: React, Node.js, SQL)" />
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary-600" /> AI-Generated Assessments
          </h3>
          <p className="text-sm text-gray-500 mb-4">Select assessment types. AI will auto-generate questions from your JD.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Quiz', 'Coding', 'Psychometric', 'AI Interview'].map(type => (
              <button key={type} type="button" onClick={() => toggleAssessment(type)}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                  ${assessmentTypes.includes(type) ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-primary-300'}`}>
                {type}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading || generating} className="btn-primary w-full flex items-center justify-center gap-2">
          {(loading || generating) ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
          {generating ? 'Generating AI Assessments...' : loading ? 'Submitting...' : 'Submit Job for Approval'}
        </button>
      </form>
    </div>
  )
}
