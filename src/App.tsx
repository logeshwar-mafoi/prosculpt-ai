import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

// Public
import LandingPage from '@/pages/Landing'
import LoginPage from '@/pages/auth/Login'
import RegisterPage from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import SelectRole from '@/pages/auth/SelectRole'

// Student
import StudentDashboard from '@/pages/student/Dashboard'
import StudentJobs from '@/pages/student/Jobs'
import StudentProfile from '@/pages/student/Profile'
import ResumeBuilder from '@/pages/student/ResumeBuilder'
import Assessment from '@/pages/student/Assessment'
import StudentCourses from '@/pages/student/Courses'

// Employer
import EmployerDashboard from '@/pages/employer/Dashboard'
import EmployerJobs from '@/pages/employer/Jobs'
import PostJob from '@/pages/employer/PostJob'
import EmployerCandidates from '@/pages/employer/Candidates'
import PlacementDrive from '@/pages/employer/PlacementDrive'
import OfferLetters from '@/pages/employer/OfferLetters'

// College
import CollegeDashboard from '@/pages/college/Dashboard'
import CollegeStudents from '@/pages/college/Students'
import CollegePlacements from '@/pages/college/Placements'

// Admin
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminJobs from '@/pages/admin/Jobs'
import AdminUsers from '@/pages/admin/Users'
import AdminColleges from '@/pages/admin/Colleges'
import AdminEmployers from '@/pages/admin/Employers'
import AdminBlogs from '@/pages/admin/Blogs'
import AdminAssessments from '@/pages/admin/Assessments'
import AdminPayments from '@/pages/admin/Payments'

import ProtectedRoute from '@/components/ProtectedRoute'
import AIChat from '@/components/AIChat'

const ROLE_REDIRECTS: Record<string, string> = {
  student:  '/student',
  employer: '/employer',
  college:  '/college',
  admin:    '/admin',
}

export default function App() {
  const { setUser, fetchProfile } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Handle existing session on page load (including OAuth hash redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        const role = (
          session.user.user_metadata?.role ||
          localStorage.getItem('prosculpt-role')
        ) as string

        const path = window.location.pathname
        const hasToken = window.location.hash.includes('access_token')

        if (role && ROLE_REDIRECTS[role]) {
          localStorage.setItem('prosculpt-role', role)
          fetchProfile(session.user.id, role)
          if (hasToken || path === '/' || path === '/login') {
            window.history.replaceState(null, '', ROLE_REDIRECTS[role])
            navigate(ROLE_REDIRECTS[role], { replace: true })
          }
        } else if (hasToken || path === '/login') {
          // Logged in via Google but no role set yet
          navigate('/select-role', { replace: true })
        }
      }
    })

    // Listen for future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        const role = (
          session.user.user_metadata?.role ||
          localStorage.getItem('prosculpt-role')
        ) as string

        if (role && ROLE_REDIRECTS[role]) {
          localStorage.setItem('prosculpt-role', role)
          fetchProfile(session.user.id, role)
          navigate(ROLE_REDIRECTS[role], { replace: true })
        } else {
          navigate('/select-role', { replace: true })
        }
      }
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('prosculpt-role')
        navigate('/login', { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/select-role" element={<SelectRole />} />

        {/* Student */}
        <Route path="/student/*" element={<ProtectedRoute role="student" />}>
          <Route index element={<StudentDashboard />} />
          <Route path="jobs" element={<StudentJobs />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="resume" element={<ResumeBuilder />} />
          <Route path="assessment/:id" element={<Assessment />} />
          <Route path="courses" element={<StudentCourses />} />
        </Route>

        {/* Employer */}
        <Route path="/employer/*" element={<ProtectedRoute role="employer" />}>
          <Route index element={<EmployerDashboard />} />
          <Route path="jobs" element={<EmployerJobs />} />
          <Route path="jobs/post" element={<PostJob />} />
          <Route path="candidates" element={<EmployerCandidates />} />
          <Route path="drives" element={<PlacementDrive />} />
          <Route path="offers" element={<OfferLetters />} />
        </Route>

        {/* College */}
        <Route path="/college/*" element={<ProtectedRoute role="college" />}>
          <Route index element={<CollegeDashboard />} />
          <Route path="students" element={<CollegeStudents />} />
          <Route path="placements" element={<CollegePlacements />} />
        </Route>

        {/* Admin */}
        <Route path="/admin/*" element={<ProtectedRoute role="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="colleges" element={<AdminColleges />} />
          <Route path="employers" element={<AdminEmployers />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="assessments" element={<AdminAssessments />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <AIChat />
    </>
  )
}
