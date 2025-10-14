import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { fetchCurrentUser } from '../api/user'
import type { User } from '../types'

export const useCurrentUser = () => {
  const { accessToken } = useAuthStore()

  return useQuery<User | null, Error>({
    queryKey: ['currentUser', accessToken],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    enabled: !!accessToken, // Only fetch when user is authenticated
  })
}
