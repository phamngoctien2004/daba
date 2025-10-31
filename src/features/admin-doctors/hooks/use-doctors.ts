/**
 * Admin Doctors React Query Hooks
 */

import { useQuery } from '@tanstack/react-query'
import { fetchDoctors } from '../api/doctors'
import type { DoctorListParams } from '../types'

/**
 * Query keys for doctors
 */
export const doctorsKeys = {
  all: ['admin-doctors'] as const,
  lists: () => [...doctorsKeys.all, 'list'] as const,
  list: (params: DoctorListParams) => [...doctorsKeys.lists(), params] as const,
}

/**
 * Hook to fetch doctors list
 */
export function useDoctors(params: DoctorListParams) {
  return useQuery({
    queryKey: doctorsKeys.list(params),
    queryFn: () => fetchDoctors(params),
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes,
  })
}
