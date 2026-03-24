import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  HomeIcon, BriefcaseIcon, UserIcon, DocumentTextIcon,
  AcademicCapIcon, ChartBarIcon, UsersIcon, BuildingOfficeIcon,
  CogIcon, BellIcon, Bars3Icon, XMarkIcon, ArrowLeftOnRectangleIcon,
  BookOpenIcon, CurrencyRupeeIcon, NewspaperIcon, ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import type { UserRole } from '@/store/authStore'

const navMap: Record<UserRole, {label:string, path:string, icon:any}[]> = {
  student: [
    { label:'Dashboard', path:'/student', icon: HomeIcon },
    { label:'Jobs', path:'/student/jobs', icon: BriefcaseIcon },
    { label:'Profile', path:'/student/profile', icon: UserIcon },
    { label:'Resume Builder', path:'/student/resume', icon: DocumentTextIcon },
    { label:'Courses', path:'/student/courses', icon: AcademicCapIcon },
  ],
  employer: [
    { label:'Dashboard', path:'/employer', icon: HomeIcon },
    { label:'Post Jobs', path:'/employer/jobs/post', icon: BriefcaseIcon },
    { label:'My Jobs', path:'/employer/jobs', icon: ClipboardDocumentListIcon },
    { label:'Candidates', path:'/employer/candidates', icon: UsersIcon },
    { label:'Drives', path:'/employer/drives', icon: AcademicCapIcon },
    { label:'Offer Letters', path:'/employer/offers', icon: DocumentTextIcon },
  ],
  college: [
    { label:'Dashboard', path:'/college', icon: HomeIcon },
    { label:'Students', path:'/college/students', icon: UsersIcon },
    { label:'Placements', path:'/college/placements', icon: ChartBarIcon },
  ],
  admin: [
    { label:'Dashboard', path:'/admin', icon: HomeIcon },
    { label:'Jobs', path:'/admin/jobs', icon: BriefcaseIcon },
    { label:'Users', path:'/admin/users', icon: UsersIcon },
    { label:'Colleges', path:'/admin/colleges', icon: BuildingOfficeIcon },
    { label:'Employers', path:'/admin/employers', icon: BriefcaseIcon },
    { label:'Blogs', path:'/admin/blogs', icon: NewspaperIcon },
    { label:'Assessments', path:'/admin/assessments', icon: ClipboardDocumentListIcon },
    { label:'Payments', path:'/admin/payments', icon: CurrencyRupeeIcon },
  ]
}

export default function DashboardLayout({ role, children }: { role: UserRole, children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, profile } = useAuthStore()
  const nav = navMap[role]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-6 border-b border-primary-700">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
          <span className="text-primary-700 font-black text-lg">P</span>
        </div>
        <div>
          <p className="text-white font-bold text-lg leading-none">ProSculpt</p>
          <p className="text-primary-200 text-xs capitalize">{role} Portal</p>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map(item => {
          const active = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                ${active ? 'bg-white text-primary-700 shadow-md' : 'text-primary-100 hover:bg-primary-700 hover:text-white'}`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-primary-700">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-primary-100 hover:bg-primary-700 rounded-xl transition-all text-sm">
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-primary-900 fixed h-full z-20">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-72 bg-primary-900 h-full">
            <button className="absolute top-4 right-4 text-white" onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="w-6 h-6" />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top navbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 lg:px-8 py-4 flex items-center justify-between">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="w-6 h-6 text-gray-600" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-xl">
              <BellIcon className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {profile?.name?.[0]?.toUpperCase() || role[0].toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{profile?.name || 'Welcome'}</p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 flex justify-around py-2">
        {nav.slice(0, 5).map(item => {
          const active = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl ${active ? 'text-primary-600' : 'text-gray-500'}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}