import { useState } from 'react'
import { AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline'

const COURSES = [
  { id: 1, title: '100 Days of Coding',         category: 'IT',     bg: 'bg-blue-600',   duration: 100, enrolled: 2341, emoji: 'ðŸ’»', progress: 35 },
  { id: 2, title: 'Excel for Placement',         category: 'Non-IT', bg: 'bg-green-600',  duration: 30,  enrolled: 1872, emoji: 'ðŸ“Š', progress: 0  },
  { id: 3, title: 'Communication & Soft Skills', category: 'Non-IT', bg: 'bg-purple-600', duration: 21,  enrolled: 3120, emoji: 'ðŸ—£ï¸', progress: 60 },
  { id: 4, title: 'Data Structures & Algo',      category: 'IT',     bg: 'bg-red-600',    duration: 60,  enrolled: 4201, emoji: 'ðŸ§ ', progress: 10 },
  { id: 5, title: 'Sales & Business Dev',        category: 'Non-IT', bg: 'bg-amber-600',  duration: 14,  enrolled: 980,  emoji: 'ðŸ’¼', progress: 0  },
  { id: 6, title: 'SQL for Interviews',          category: 'IT',     bg: 'bg-teal-600',   duration: 15,  enrolled: 2100, emoji: 'ðŸ—„ï¸', progress: 0  },
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
          <h2 className="text-xl font-black">Your Learning Streak ðŸ”¥</h2>
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
                  {isEnrolled ? (course.progress > 0 ? 'Continue Learning â†’' : 'Start Course â†’') : 'Enroll Free'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}