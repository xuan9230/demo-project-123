import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  setSession: (session: Session | null) => void
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (session) =>
    set({
      session,
      isAuthenticated: !!session?.user,
    }),

  setUser: (user) =>
    set({
      user,
    }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  clearAuth: () =>
    set({
      user: null,
      session: null,
      isAuthenticated: false,
    }),
}))
