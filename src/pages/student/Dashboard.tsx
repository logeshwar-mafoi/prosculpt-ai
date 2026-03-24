import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  BriefcaseIcon, DocumentTextIcon, AcademicCapIcon,
  StarIcon, ArrowTrendingUpIcon, FireIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function ActivityHeatmap() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const today = new Date()
  const days = Array.from({ length: 52 * 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (52*7 - i))
    return { date: d, count: Math.floor(Math.random() * 5) }
  })
  const getColor = (c: number) => c === 0 ? 'bg-gray-100' : c === 1 ? 'bg-primary-200' : c === 2 ? 'bg-primary-400' : c === 3 ? 'bg-primary-600' : 'bg-primary-800'

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-[700px]">
        {Array.from({ length: 52 }).map((_, w) => (
          <div key={w} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, d) => {
              const item = days[w * 7 + d]
              return item ? (
                <div key={d} title={`${item.count} activities`}
                  className={`w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all ${getColor(item.count)}`} />
              ) : null
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({ applied: 0, saved: 0, atsScore: 0, mafoiScore: null as number | null })

  const chartData = [
    { name: 'Mon', activities: 3 }, { name: 'Tue', activities: 7 },
    { name: 'Wed', activities: 5 }, { name: 'Thu', activities: 9 },
    { name: 'Fri', activities: 4 }, { name: 'Sat', activities: 6 }, { name: 'Sun', activities: 2 }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-hero-gradient rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        <h1 className="text-2xl font-black mb-1">Welcome back, {profile?.name?.split(' ')[0] || 'Student'}! 👋</h1>
        <p className="text-primary-200">You have <strong className="text-white">3 new job matches</strong> and <strong className="text-white">1 assessment pending</strong></p>
        <div className="flex gap-4 mt-4 flex-wrap">
          <Link to="/student/jobs" className="bg-white text-primary-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-primary-50 transition-colors">
            View Jobs →
          </Link>
          <Link to="/student/resume" className="border border-white text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors">
            Build Resume
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Jobs Applied', value: '12', icon: BriefcaseIcon, color: 'text-blue-600 bg-blue-50' },
          { label: 'ATS Score', value: '72%', icon: DocumentTextIcon, color: 'text-green-600 bg-green-50' },
          { label: 'Ma Foi Score', value: profile?.mafoi_score ? `${profile.mafoi_score}` : 'Not Taken', icon: StarIcon, color: 'text-amber-600 bg-amber-50' },
          { label: 'Profile %', value: '65%', icon: ArrowTrendingUpIcon, color: 'text-purple-600 bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-orange-500" /> Weekly Activity
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="activities" fill="#2563eb" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Heatmap */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5 text-primary-600" /> Login Streak
          </h3>
          <ActivityHeatmap />
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <span>Less</span>
            {['bg-gray-100','bg-primary-200','bg-primary-400','bg-primary-600','bg-primary-800'].map(c => (
              <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4">🤖 AI-Recommended Jobs for You</h3>
        <div className="space-y-3">
          {[
            { title: 'Frontend Developer', company: 'TCS', match: 92, location: 'Chennai', salary: '6-10 LPA' },
            { title: 'React Developer', company: 'Infosys', match: 87, location: 'Bangalore', salary: '5-8 LPA' },
            { title: 'UI/UX Designer', company: 'Wipro', match: 81, location: 'Remote', salary: '4-7 LPA' },
          ].map((job, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-primary-300 transition-colors">
              <div>
                <p className="font-semibold text-gray-800">{job.title}</p>
                <p className="text-sm text-gray-500">{job.company} • {job.location} • {job.salary}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge bg-green-100 text-green-700">{job.match}% Match</span>
                <Link to="/student/jobs" className="btn-primary py-2 px-4 text-sm">Apply</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}