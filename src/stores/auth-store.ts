import { create } from 'zustand'

import {
  clearAuthData,
  getAuthToken,
  getUserData,
  setAuthToken,
  setUserData,
} from '@/lib/auth-storage'
import { type User } from '@/types/auth'

interface AuthState {
  user: User | null
  accessToken: string
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setAccessToken: (accessToken: string) => void
  login: (user: User, accessToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => {
  // Initialize from localStorage
  const initToken = getAuthToken() || ''
  const initUser = getUserData<User>()

  return {
    user: initUser,
    accessToken: initToken,
    isAuthenticated: !!initToken && !!initUser,

    setUser: (user) => {
      if (user) {
        setUserData(user)
      }
      set({ user, isAuthenticated: !!user })
    },

    setAccessToken: (accessToken) => {
      if (accessToken) {
        setAuthToken(accessToken)
      }
      set({ accessToken, isAuthenticated: !!accessToken })
    },

    login: (user, accessToken) => {
      setUserData(user)
      setAuthToken(accessToken)
      set({
        user,
        accessToken,
        isAuthenticated: true,
      })
    },

    logout: () => {
      clearAuthData()
      set({
        user: null,
        accessToken: '',
        isAuthenticated: false,
      })
    },
  }
})
