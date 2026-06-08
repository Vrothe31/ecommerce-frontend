import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,

      login: (data) => set({
        token: data.token,
        refreshToken: data.refreshToken,
        user: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          avatarUrl: data.avatarUrl,
          emailVerified: data.emailVerified,
        }
      }),

      logout: () => set({ user: null, token: null, refreshToken: null }),

      isAdmin: () => get().user?.role === 'ADMIN',
    }),
    { name: 'shopzone-auth' }
  )
)
