import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/store/authStore'
import DashboardLayout from './layouts/DashboardLayout'

interface Props { role: UserRole }

export default function ProtectedRoute({ role }: Props) {
  const { user, role: userRole } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (userRole && userRole !== role) return <Navigate to={`/${userRole}`} replace />
  return <DashboardLayout role={role}><Outlet /></DashboardLayout>
}