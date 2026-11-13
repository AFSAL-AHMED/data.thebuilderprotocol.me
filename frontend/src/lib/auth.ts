import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'
import { usersApi } from './api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token: string, user: User) => {
        localStorage.setItem('tbp_token', token)
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('tbp_token')
        localStorage.removeItem('tbp_user')
        set({ user: null, token: null, isAuthenticated: false })
      },

      refreshUser: async () => {
        try {
          const user = await usersApi.me()
          set({ user, isAuthenticated: true })
        } catch {
          get().logout()
        }
      },

      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'tbp-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
