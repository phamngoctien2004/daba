import { get } from '@/lib/api-client'
import type { User, UserMeResponse } from '../types'

export type { User } from '../types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * Get current user info
 * GET /api/users/me
 */
export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const { data } = await get<UserMeResponse>('/users/me')

    console.log('🔵 [fetchCurrentUser] Raw response:', data)

    const response = data ?? {}
    const userData = isRecord(response) ? response.data : undefined

    if (isRecord(userData) && typeof userData.id === 'number') {
      return userData as unknown as User
    }

    return null
  } catch (error) {
    console.error('❌ [fetchCurrentUser] Error:', error)
    throw error
  }
}
