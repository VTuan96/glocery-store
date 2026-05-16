import { create } from 'zustand'
import type { UserRole } from '../types/global'

interface AuthState {
  // Access token stored in-memory ONLY — never localStorage or sessionStorage
  accessToken: string | null
  role: UserRole | null
  storeId: string | null
  isAuthenticated: boolean

  setAuth: (token: string, role: UserRole, storeId: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  role: null,
  storeId: null,
  isAuthenticated: false,

  setAuth: (token, role, storeId) =>
    set({ accessToken: token, role, storeId, isAuthenticated: true }),

  clearAuth: () =>
    set({ accessToken: null, role: null, storeId: null, isAuthenticated: false }),
}))
