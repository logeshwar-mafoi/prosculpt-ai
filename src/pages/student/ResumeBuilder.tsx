import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { analyzeResume } from '@/lib/openai'
import toast from 'react-hot-toast'
import { SparklesIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'

const TEMPLATES = [
  { id: 1, name: 'Professional Blue', preview: 'bg-primary-700' },
  { id: 2, name: 'Modern Minimal', preview: 'bg-gray-800' },
  { id: 3, name: 'ATS Classic', preview: 'bg-green-700' },
  { id: 4, name: 'Executive Dark', preview: 'bg-gray-900' },
  { id: 5, name: 'Creative Teal', preview: 'bg-teal-700' },
]

export default function ResumeBuilder() {
  const { profile } = useAuthStore()
  const [selectedTemplate, setSelectedTemplate] = useState(1)
  const [atsResult, setAtsResult] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [resumeText, setResumeText] = useState('')

  const analyzeATS = async () => {
    if (!resumeText.trim()) { toast.error('Paste your resume text first'); return }
    setAnalyzing(true)
    try {
      const raw = await analyzeResume(resumeText)
      const result = JSON.parse(raw)
      setAtsResult(result)
    } catch {
      toast.error('Analysis failed. Try again.')
    }
    setAnalyzing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800">Resume Builder</h1>
        <button className="btn-primary flex items-center gap-2">
          <DocumentArrowDownIcon className="w-5 h-5" /> Export PDF
        </button>
      </div>

      {/* Template selection */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4">Choose Template</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                ${selectedTemplate === t.id ? 'border-primary-600' : 'border-gray-200 hover:border-primary-300'}`}>
              <div className={`w-full h-16 ${t.preview} rounded-lg opacity-80`} />
              <span className="text-xs font-medium text-gray-700 text-center">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ATS Analyzer */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-primary-600" /> AI ATS Score Analyzer
        </h3>
        <p className="text-sm text-gray-500 mb-4">Paste your resume text to get instant ATS score and suggestions</p>
        <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={6}
          className="input-field resize-none mb-4" placeholder="Paste your resume text here..." />
        <button onClick={analyzeATS} disabled={analyzing} className="btn-primary flex items-center gap-2">
          {analyzing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
          {analyzing ? 'Analyzing...' : 'Analyze ATS Score'}
        </button>

        {atsResult && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2563eb" strokeWidth="3"
                    strokeDasharray={`${atsResult.atsScore} 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-primary-700">{atsResult.atsScore}</span>
                  <span className="text-xs text-gray-500">ATS Score</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 mb-1">{atsResult.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {atsResult.keywords?.map((k: string) => <span key={k} className="badge bg-primary-100 text-primary-700">{k}</span>)}
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="font-semibold text-green-800 mb-2">✅ Strengths</p>
                <ul className="space-y-1">{atsResult.strengths?.map((s: string, i: number) => <li key={i} className="text-sm text-green-700">• {s}</li>)}</ul>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="font-semibold text-amber-800 mb-2">⚠️ Improvements</p>
                <ul className="space-y-1">{atsResult.improvements?.map((s: string, i: number) => <li key={i} className="text-sm text-amber-700">• {s}</li>)}</ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
