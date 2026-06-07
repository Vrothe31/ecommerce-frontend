import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const existing = get().items.find(i => i.id === product.id)
        if (existing) {
          set({
            items: get().items.map(i =>
              i.id === product.id ? { ...i, qty: i.qty + 1 } : i
            )
          })
        } else {
          set({ items: [...get().items, { ...product, qty: 1 }] })
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter(i => i.id !== id) }),

      updateQty: (id, qty) => {
        if (qty < 1) return
        set({ items: get().items.map(i => i.id === id ? { ...i, qty } : i) })
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + Number(i.price) * i.qty, 0),

      getCount: () =>
        get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'shopzone-cart' }
  )
)
