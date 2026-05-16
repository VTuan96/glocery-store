import { create } from 'zustand'
import type { CartItem } from '../types/global'

// Cart state is DERIVED from Dexie — Dexie is the source of truth.
// Every mutation must write to db.cart BEFORE updating this store.
// See architecture.md#Cart Persistence Rule

interface CartState {
  items: CartItem[]
  isCheckingOut: boolean

  setItems: (items: CartItem[]) => void
  setCheckingOut: (value: boolean) => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isCheckingOut: false,

  setItems: (items) => set({ items }),
  setCheckingOut: (value) => set({ isCheckingOut: value }),
}))
