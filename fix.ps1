# ProSculpt Fix Script
# Run this in PowerShell as: Set-ExecutionPolicy -Scope Process Bypass; .\fix.ps1
# It will overwrite all corrupted files directly on disk.

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Project root: $root"

# ── tsconfig.json ──
$path = Join-Path $root 'tsconfig.json'
New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
$content = @'
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
'@
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "✅ Written: tsconfig.json"

# ── tsconfig.app.json ──
$path = Join-Path $root 'tsconfig.app.json'
New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
$content = @'
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
'@
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "✅ Written: tsconfig.app.json"

# ── tsconfig.node.json ──
$path = Join-Path $root 'tsconfig.node.json'
New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
$content = @'
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
'@
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "✅ Written: tsconfig.node.json"

# ── src/components/AIChat.tsx ──
$path = Join-Path $root 'src\\components\\AIChat.tsx'
New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
$content = @'
import { useState, useRef, useEffect } from 'react'
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const INIT = "Hi! I am your ProSculpt AI assistant. I can help you find jobs, improve your resume, or prepare for interviews. What would you like help with?"

export default function AIChat({ onClose }: { onClose: () => void }) {
  const { profile } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: INIT }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `You are ProSculpt AI. Student name: ${profile?.name ?? 'student'}. Help with jobs, resume, interviews.` },
            ...newMessages,
          ],
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.choices?.[0]?.message?.content ?? 'No response.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Try again.' }])
    }
    setLoading(false)
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50" style={{ height: '520px' }}>
      <div className="flex items-center justify-between px-5 py-4 bg-blue-600 rounded-t-2xl">
        <div className="flex items-center gap-2 text-white">
          <SparklesIcon className="w-5 h-5" />
          <span className="font-bold">ProSculpt AI</span>
        </div>
        <button onClick={onClose} className="text-white hover:text-blue-200"><XMarkIcon className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1">
              {[0,150,300].map(d => <span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-gray-100 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="Ask me anything..." />
        <button onClick={sendMessage} disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl disabled:opacity-40">
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
'@
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "✅ Written: src/components/AIChat.tsx"

# ── src/pages/admin/Assessments.tsx ──
$path = Join-Path $root 'src\\pages\\admin\\Assessments.tsx'
New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
$content = @'
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
          { label: 'Completed by Students', value: '—', icon: UsersIcon },
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
'@
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "✅ Written: src/pages/admin/Assessments.tsx"

# ── src/pages/employer/Dashboard.tsx ──
$path = Join-Path $root 'src\\pages\\employer\\Dashboard.tsx'
New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
$content = @'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { BriefcaseIcon, UsersIcon, CheckCircleIcon, ClockIcon, PlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const WEEK = [
  { name: 'Mon', v: 12 }, { name: 'Tue', v: 19 }, { name: 'Wed', v: 8 },
  { name: 'Thu', v: 24 }, { name: 'Fri', v: 17 }, { name: 'Sat', v: 6 }, { name: 'Sun', v: 3 },
]
const PIE = [
  { name: 'Applied', value: 45, color: '#3b82f6' },
  { name: 'Assessment', value: 28, color: '#8b5cf6' },
  { name: 'Shortlisted', value: 15, color: '#10b981' },
  { name: 'Rejected', value: 12, color: '#ef4444' },
]
const STATUS_BADGE: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending:  'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function EmployerDashboard() {
  const { user, profile } = useAuthStore()
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, totalApplicants: 0, shortlisted: 0 })
  const [recentJobs, setRecentJobs] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('jobs').select('*').eq('employer_id', user.id),
      supabase.from('applications').select('*, jobs!inner(employer_id)').eq('jobs.employer_id', user.id),
    ]).then(([jobs, apps]) => {
      const j = jobs.data ?? []
      const a = apps.data ?? []
      setStats({ totalJobs: j.length, activeJobs: j.filter((x: any) => x.status === 'approved').length, totalApplicants: a.length, shortlisted: a.filter((x: any) => x.status === 'shortlisted').length })
      setRecentJobs(j.slice(0, 5))
    })
  }, [user])

  return (
    <div className="space-y-6">
      {!profile?.verified && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <ShieldCheckIcon className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">Account Pending Verification</p>
            <p className="text-sm text-amber-600">Admin will verify your company within 24 hours.</p>
          </div>
        </div>
      )}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Welcome, {profile?.company_name ?? 'Employer'} 👋</h1>
          <p className="text-blue-200 mt-1">You have <strong className="text-white">{stats.totalApplicants}</strong> total applicants.</p>
        </div>
        <Link to="/employer/jobs/post" className="bg-white text-blue-700 font-bold px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-50 flex-shrink-0">
          <PlusIcon className="w-5 h-5" /> Post Job
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: stats.totalJobs, icon: BriefcaseIcon, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active Jobs', value: stats.activeJobs, icon: CheckCircleIcon, color: 'bg-green-50 text-green-600' },
          { label: 'Total Applicants', value: stats.totalApplicants, icon: UsersIcon, color: 'bg-purple-50 text-purple-600' },
          { label: 'Shortlisted', value: stats.shortlisted, icon: ClockIcon, color: 'bg-amber-50 text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="w-6 h-6" /></div>
            <div><p className="text-2xl font-black text-gray-800">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Applications This Week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEK}><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis hide /><Tooltip /><Bar dataKey="v" fill="#2563eb" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Application Status</h3>
          <div className="flex justify-center">
            <PieChart width={200} height={180}>
              <Pie data={PIE} cx={100} cy={90} innerRadius={45} outerRadius={75} dataKey="value">
                {PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie><Tooltip />
            </PieChart>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {PIE.map(p => <span key={p.name} className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-3 h-3 rounded-full" style={{ background: p.color }} />{p.name}</span>)}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Recent Job Posts</h3>
          <Link to="/employer/jobs" className="text-sm text-blue-600 hover:underline">View All</Link>
        </div>
        {recentJobs.length === 0 ? (
          <div className="text-center py-8">
            <BriefcaseIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400">No jobs posted yet.</p>
            <Link to="/employer/jobs/post" className="bg-blue-600 text-white font-bold px-5 py-2 rounded-xl mt-4 inline-block text-sm">Post Your First Job</Link>
          </div>
        ) : recentJobs.map(job => (
          <div key={job.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div><p className="font-semibold text-gray-800">{job.title}</p><p className="text-xs text-gray-500">{job.location} · {job.salary_range}</p></div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_BADGE[job.status] ?? 'bg-gray-100 text-gray-600'}`}>{job.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
'@
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "✅ Written: src/pages/employer/Dashboard.tsx"

# ── src/pages/employer/Candidates.tsx ──
$path = Join-Path $root 'src\\pages\\employer\\Candidates.tsx'
New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
$content = @'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { MagnifyingGlassIcon, StarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const STATUS_COLOR: Record<string, string> = {
  applied:         'bg-blue-100 text-blue-700',
  assessment_done: 'bg-purple-100 text-purple-700',
  shortlisted:     'bg-green-100 text-green-700',
  offered:         'bg-teal-100 text-teal-700',
  rejected:        'bg-red-100 text-red-700',
}

export default function EmployerCandidates() {
  const { user } = useAuthStore()
  const [candidates, setCandidates] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('jobs').select('id, title').eq('employer_id', user.id).then(({ data }) => setJobs(data ?? []))
    supabase.from('applications')
      .select('*, student_profiles(*), jobs!inner(employer_id, title)')
      .eq('jobs.employer_id', user.id)
      .order('assessment_score', { ascending: false })
      .then(({ data }) => { setCandidates(data ?? []); setLoading(false) })
  }, [user])

  const updateStatus = async (appId: string, status: string) => {
    await supabase.from('applications').update({ status }).eq('id', appId)
    setCandidates(prev => prev.map(c => c.id === appId ? { ...c, status } : c))
    toast.success(`Status updated to ${status}`)
  }

  const filtered = candidates.filter(c => {
    const matchJob = selectedJob === 'all' || c.job_id === selectedJob
    const q = search.toLowerCase()
    return matchJob && (c.student_profiles?.name?.toLowerCase().includes(q) || c.student_profiles?.email?.toLowerCase().includes(q))
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">Candidates</h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Search by name or email..." />
        </div>
        <select value={selectedJob} onChange={e => setSelectedJob(e.target.value)}
          className="w-56 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
          <option value="all">All Jobs</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-12 text-gray-400">No candidates found.</div>
      ) : filtered.map((c, rank) => {
        const sp = c.student_profiles
        return (
          <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-black text-blue-700 text-sm flex-shrink-0">#{rank + 1}</div>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">{sp?.name?.[0] ?? 'S'}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{sp?.name}</p>
              <p className="text-xs text-gray-500 truncate">{sp?.degree} · {sp?.college_name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {sp?.skills?.slice(0, 3).map((s: string) => <span key={s} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{s}</span>)}
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0 text-center">
              {c.assessment_score != null && <div><p className="text-lg font-black text-purple-600">{c.assessment_score}%</p><p className="text-xs text-gray-400">Assessment</p></div>}
              {sp?.ats_score > 0 && <div><p className="text-lg font-black text-blue-600">{sp.ats_score}%</p><p className="text-xs text-gray-400">ATS</p></div>}
              {sp?.mafoi_score && <div className="flex items-center gap-1"><StarIcon className="w-4 h-4 text-amber-500" /><p className="text-lg font-black text-amber-600">{sp.mafoi_score}</p></div>}
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${STATUS_COLOR[c.status] ?? 'bg-gray-100 text-gray-600'}`}>{c.status?.replace('_', ' ')}</span>
            <div className="flex gap-2 flex-shrink-0">
              {sp?.resume_url && <a href={sp.resume_url} target="_blank" rel="noreferrer" className="p-2 bg-gray-100 rounded-xl hover:bg-blue-100"><DocumentArrowDownIcon className="w-4 h-4 text-gray-600" /></a>}
              {c.status !== 'shortlisted' && c.status !== 'offered' && (
                <button onClick={() => updateStatus(c.id, 'shortlisted')} className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700">Shortlist</button>
              )}
              {c.status === 'shortlisted' && (
                <button onClick={() => updateStatus(c.id, 'offered')} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700">Send Offer</button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
'@
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "✅ Written: src/pages/employer/Candidates.tsx"

# ── src/pages/employer/OfferLetters.tsx ──
$path = Join-Path $root 'src\\pages\\employer\\OfferLetters.tsx'
New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
$content = @'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { DocumentTextIcon, PaperAirplaneIcon, EyeIcon } from '@heroicons/react/24/outline'

const BASE = `Dear {candidate_name},

We are pleased to offer you the position of {role} at {company_name}.

Your Cost to Company (CTC) will be Rs.{ctc} per annum.

Your joining date is {joining_date}.

Please confirm your acceptance by replying within 3 working days.

Congratulations and welcome to the team!

Warm regards,
{hr_name}
{company_name}`

export default function OfferLetters() {
  const { user, profile } = useAuthStore()
  const [applications, setApplications] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [preview, setPreview] = useState('')
  const [sending, setSending] = useState(false)
  const { register, watch } = useForm<any>({ defaultValues: { company_name: profile?.company_name, hr_name: profile?.name } })

  useEffect(() => {
    supabase.from('applications')
      .select('*, student_profiles(*), jobs!inner(employer_id, title)')
      .eq('jobs.employer_id', user?.id)
      .eq('status', 'shortlisted')
      .then(({ data }) => setApplications(data ?? []))
  }, [user])

  const generatePreview = () => {
    if (!selected) { toast.error('Select a candidate first'); return }
    const d = watch()
    const vars: Record<string, string> = {
      candidate_name: selected.student_profiles?.name ?? 'Candidate',
      role: d.role || selected.jobs?.title,
      company_name: d.company_name ?? '',
      ctc: d.ctc ?? '',
      joining_date: d.joining_date ?? '',
      hr_name: d.hr_name ?? '',
    }
    let letter = BASE
    Object.entries(vars).forEach(([k, v]) => { letter = letter.replaceAll(`{${k}}`, v) })
    setPreview(letter)
  }

  const sendOffer = async () => {
    if (!selected || !preview) { toast.error('Generate preview first'); return }
    setSending(true)
    await supabase.from('offer_letters').insert({ application_id: selected.id, student_id: selected.student_id, employer_id: user?.id, template: preview, status: 'sent' })
    await supabase.from('applications').update({ status: 'offered' }).eq('id', selected.id)
    setApplications(prev => prev.filter(a => a.id !== selected.id))
    setSelected(null); setPreview('')
    toast.success('Offer sent! Pending admin approval.')
    setSending(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">Offer Letters</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Select Candidate</h3>
          {applications.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">No shortlisted candidates.</p>
            : applications.map(app => (
              <button key={app.id} onClick={() => setSelected(app)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border-2 mb-2 transition-all ${selected?.id === app.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">{app.student_profiles?.name?.[0]}</div>
                <div><p className="font-semibold text-sm text-gray-800">{app.student_profiles?.name}</p><p className="text-xs text-gray-500">{app.jobs?.title}</p></div>
              </button>
            ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-bold text-gray-800">Offer Details</h3>
          <input {...register('role')} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Role / Position" />
          <input {...register('ctc')} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="CTC (e.g. 6,00,000)" />
          <input {...register('joining_date')} type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
          <input {...register('company_name')} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Company Name" />
          <input {...register('hr_name')} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="HR Name" />
          <div className="flex gap-3">
            <button type="button" onClick={generatePreview} className="border border-gray-200 text-gray-700 font-semibold px-4 py-3 rounded-xl hover:bg-gray-50 flex items-center gap-2 flex-1">
              <EyeIcon className="w-4 h-4" /> Preview
            </button>
            <button type="button" onClick={sendOffer} disabled={sending} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 rounded-xl flex items-center gap-2 flex-1">
              <PaperAirplaneIcon className="w-4 h-4" />{sending ? 'Sending...' : 'Send Offer'}
            </button>
          </div>
        </div>
      </div>
      {preview && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><DocumentTextIcon className="w-5 h-5 text-blue-600" /> Letter Preview</h3>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 font-mono text-sm whitespace-pre-wrap text-gray-700">{preview}</div>
          <p className="text-xs text-amber-600 mt-3">Reviewed by admin before delivery to candidate.</p>
        </div>
      )}
    </div>
  )
}
'@
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "✅ Written: src/pages/employer/OfferLetters.tsx"

# ── src/pages/student/Assessment.tsx ──
$path = Join-Path $root 'src\\pages\\student\\Assessment.tsx'
New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
$content = @'
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
'@
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "✅ Written: src/pages/student/Assessment.tsx"

# ── src/pages/student/Courses.tsx ──
$path = Join-Path $root 'src\\pages\\student\\Courses.tsx'
New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
$content = @'
import { useState } from 'react'
import { AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline'

const COURSES = [
  { id: 1, title: '100 Days of Coding',         category: 'IT',     bg: 'bg-blue-600',   duration: 100, enrolled: 2341, emoji: '💻', progress: 35 },
  { id: 2, title: 'Excel for Placement',         category: 'Non-IT', bg: 'bg-green-600',  duration: 30,  enrolled: 1872, emoji: '📊', progress: 0  },
  { id: 3, title: 'Communication & Soft Skills', category: 'Non-IT', bg: 'bg-purple-600', duration: 21,  enrolled: 3120, emoji: '🗣️', progress: 60 },
  { id: 4, title: 'Data Structures & Algo',      category: 'IT',     bg: 'bg-red-600',    duration: 60,  enrolled: 4201, emoji: '🧠', progress: 10 },
  { id: 5, title: 'Sales & Business Dev',        category: 'Non-IT', bg: 'bg-amber-600',  duration: 14,  enrolled: 980,  emoji: '💼', progress: 0  },
  { id: 6, title: 'SQL for Interviews',          category: 'IT',     bg: 'bg-teal-600',   duration: 15,  enrolled: 2100, emoji: '🗄️', progress: 0  },
]

export default function StudentCourses() {
  const [filter, setFilter] = useState('All')
  const [enrolled, setEnrolled] = useState<number[]>([1, 3])

  const filtered = COURSES.filter(c => filter === 'All' || c.category === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800">Courses & Learning</h1>
        <div className="flex gap-2">
          {['All', 'IT', 'Non-IT'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-blue-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">Your Learning Streak 🔥</h2>
          <p className="text-blue-200 text-sm mt-1">You have completed <strong className="text-white">3 days</strong> in a row!</p>
        </div>
        <div className="text-right"><p className="text-5xl font-black">3</p><p className="text-blue-200 text-sm">day streak</p></div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(course => {
          const isEnrolled = enrolled.includes(course.id)
          return (
            <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`${course.bg} h-36 flex items-center justify-center relative`}>
                <span className="text-6xl">{course.emoji}</span>
                <div className="absolute top-3 right-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${course.category === 'IT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{course.category}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 mb-1">{course.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" />{course.duration} days</span>
                  <span className="flex items-center gap-1"><AcademicCapIcon className="w-4 h-4" />{course.enrolled.toLocaleString()}</span>
                </div>
                {isEnrolled && course.progress > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Progress</span><span>{course.progress}%</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${course.progress}%` }} /></div>
                  </div>
                )}
                <button onClick={() => !isEnrolled && setEnrolled(prev => [...prev, course.id])}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${isEnrolled ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                  {isEnrolled ? (course.progress > 0 ? 'Continue Learning →' : 'Start Course →') : 'Enroll Free'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
'@
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "✅ Written: src/pages/student/Courses.tsx"

# ── src/pages/auth/Register.tsx ──
$path = Join-Path $root 'src\\pages\\auth\\Register.tsx'
New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
$content = @'
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
'@
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "✅ Written: src/pages/auth/Register.tsx"

Write-Host ""
Write-Host "ALL FILES WRITTEN ✅ Now run: npm run build"
