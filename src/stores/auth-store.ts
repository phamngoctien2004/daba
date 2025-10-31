import { create } from 'zustand'
import { queryClient } from '@/lib/query-client'

import {
  clearAuthData,
  getAuthToken,
  getUserData,
  setAuthToken,
  setUserData,
} from '@/lib/auth-storage'
import { type User, UserRole } from '@/types/auth'

/**
 * Normalize role string to UserRole enum
 * Handles case-insensitive role matching
 */
function normalizeRole(role: string): UserRole {
  const roleUpper = role.toUpperCase()

  // Direct match
  if (Object.values(UserRole).includes(roleUpper as UserRole)) {
    return roleUpper as UserRole
  }

  // Fallback mapping for common variations
  const roleMapping: Record<string, UserRole> = {
    'ADMIN': UserRole.ADMIN,
    'BAC_SI': UserRole.BAC_SI,
    'BACSI': UserRole.BAC_SI,
    'DOCTOR': UserRole.BAC_SI,
    'LE_TAN': UserRole.LE_TAN,
    'LETAN': UserRole.LE_TAN,
    'RECEPTIONIST': UserRole.LE_TAN,
  }

  return roleMapping[roleUpper] || (role as UserRole)
}

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
      // Normalize role to ensure consistency
      const normalizedUser: User = {
        ...user,
        role: normalizeRole(user.role),
      }

      console.log('🟡 [Auth Store] Original role:', user.role)
      console.log('🟡 [Auth Store] Normalized role:', normalizedUser.role)

      setUserData(normalizedUser)
      setAuthToken(accessToken)
      set({
        user: normalizedUser,
        accessToken,
        isAuthenticated: true,
      })
    },

    logout: () => {
      clearAuthData()

      // Clear all React Query cache to prevent stale data when switching accounts
      queryClient.clear()

      set({
        user: null,
        accessToken: '',
        isAuthenticated: false,
      })
    },
  }
})
