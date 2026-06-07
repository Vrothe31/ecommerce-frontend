import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: (data) => set({
        token: data.token,
        user: { id: data.id, name: data.name, email: data.email, role: data.role }
      }),

      logout: () => set({ user: null, token: null }),

      isAdmin: () => {
        const state = useAuthStore.getState()
        return state.user?.role === 'ADMIN'
      }
    }),
    { name: 'shopzone-auth' }
  )
)
