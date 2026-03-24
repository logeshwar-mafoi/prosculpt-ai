import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { ClockIcon, CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export default function Assessment() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState<any>(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    supabase.from('assessments').select('*').eq('id', id).single().then(({ data }) => {
      if (data) { setAssessment(data); setTimeLeft((data.time_limit || 30) * 60) }
    })
  }, [id])

  useEffect(() => {
    if (!assessment || submitted) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { if (timerRef.current) clearInterval(timerRef.current); doSubmit(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [assessment, submitted])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const doSubmit = async () => {
    if (submitted) return
    if (timerRef.current) clearInterval(timerRef.current)
    const qs = assessment?.questions || []
    let correct = 0
    qs.forEach((q: any, i: number) => { if (q.correctAnswer && answers[i] === q.correctAnswer) correct++ })
    const final = qs.length > 0 ? Math.round((correct / qs.length) * 100) : 0
    setScore(final); setSubmitted(true)
    await supabase.from('assessment_results').insert({ assessment_id: id, student_id: user?.id, answers, score: final })
    await supabase.from('applications').update({ assessment_score: final, status: 'assessment_done' }).eq('job_id', assessment.job_id).eq('student_id', user?.id)
    toast.success('Assessment submitted!')
  }

  if (!assessment) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  const qs: any[] = assessment.questions || []
  const q = qs[current]

  if (submitted) return (
    <div className="max-w-lg mx-auto text-center py-16 space-y-6">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto"><CheckCircleIcon className="w-12 h-12 text-green-600" /></div>
      <h1 className="text-3xl font-black text-gray-800">Assessment Complete!</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <p className="text-5xl font-black text-blue-600">{score}%</p>
        <p className="text-gray-500 mt-2">Your Score</p>
        <p className="text-sm text-gray-400 mt-1">{Object.keys(answers).length} / {qs.length} answered</p>
      </div>
      <button onClick={() => navigate('/student/jobs')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl">Back to Jobs</button>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
        <div><h2 className="font-bold text-gray-800">{String(assessment.type).toUpperCase()} Assessment</h2><p className="text-sm text-gray-500">Question {current + 1} of {qs.length}</p></div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}>
          <ClockIcon className="w-5 h-5" />{fmt(timeLeft)}
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${((current + 1) / qs.length) * 100}%` }} /></div>
      {q && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <p className="text-lg font-semibold text-gray-800">{q.question}</p>
          {q.type === 'coding' ? (
            <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm resize-none h-48 focus:outline-none focus:border-blue-500"
              placeholder="Write your code here..." value={answers[current] || ''} onChange={e => setAnswers(prev => ({ ...prev, [current]: e.target.value }))} />
          ) : (
            <div className="space-y-3">
              {q.options?.map((opt: string, i: number) => (
                <button key={i} onClick={() => setAnswers(prev => ({ ...prev, [current]: opt }))}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium ${answers[current] === opt ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-700'}`}>
                  <span className="font-bold mr-3">{String.fromCharCode(65 + i)}.</span>{opt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrent(p => Math.max(0, p - 1))} disabled={current === 0} className="border border-gray-200 text-gray-700 font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 disabled:opacity-40">Previous</button>
        {current < qs.length - 1
          ? <button onClick={() => setCurrent(p => p + 1)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2">Next <ChevronRightIcon className="w-4 h-4" /></button>
          : <button onClick={doSubmit} className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl">Submit Assessment</button>
        }
      </div>
    </div>
  )
}