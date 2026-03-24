import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

// Public
import LandingPage from '@/pages/Landing'
import LoginPage from '@/pages/auth/Login'
import RegisterPage from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'

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

export default function App() {
  const { setUser, fetchProfile, role } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        const storedRole = localStorage.getItem('prosculpt-role') as any
        if (storedRole) fetchProfile(session.user.id, storedRole)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user)
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