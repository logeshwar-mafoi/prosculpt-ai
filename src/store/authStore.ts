import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

export type UserRole = 'student' | 'employer' | 'college' | 'admin'

interface AuthState {
  user: any | null
  profile: any | null
  role: UserRole | null
  loading: boolean
  setUser: (user: any) => void
  setProfile: (profile: any) => void
  logout: () => Promise<void>
  fetchProfile: (userId: string, role: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      role: null,
      loading: false,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null, role: null })
      },
      fetchProfile: async (userId, role) => {
        const table =
          role === 'student'  ? 'student_profiles'  :
          role === 'employer' ? 'employer_profiles' :
          role === 'college'  ? 'college_profiles'  :
          'admin_profiles'
        const { data } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', userId)
          .single()
        set({ profile: data, role: role as UserRole })
      }
    }),
    { name: 'prosculpt-auth', partialize: (s) => ({ role: s.role }) }
  )
)
