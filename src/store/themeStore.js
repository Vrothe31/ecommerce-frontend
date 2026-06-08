import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      dark: false,
      toggle: () => {
        const next = !get().dark
        document.documentElement.classList.toggle('dark', next)
        set({ dark: next })
      },
      init: () => {
        if (get().dark) document.documentElement.classList.add('dark')
      }
    }),
    { name: 'shopzone-theme' }
  )
)
