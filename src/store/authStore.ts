import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types/graph'
import { api } from '../lib/api/client'

type AuthState = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setTokens: (access: string, refresh?: string) => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      login: async (email, password) => {
        const { data } = await api.post('/api/v1/auth/login', { email, password })
        set({ user: data.user, accessToken: data.access_token, refreshToken: data.refresh_token })
      },

      logout: () => set({ user: null, accessToken: null, refreshToken: null }),

      setTokens: (access, refresh) =>
        set((s) => ({ accessToken: access, refreshToken: refresh ?? s.refreshToken })),

      setUser: (user) => set({ user }),
    }),
    { name: 'penlo-auth', partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user }) },
  ),
)
