import { create } from 'zustand'
import type { User } from '@/types'
import { mockUser } from '@/data/mock'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
}

// Always start with mock user logged in (per requirements)
export const useAuthStore = create<AuthState>((set) => ({
  user: mockUser,
  isAuthenticated: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}))
