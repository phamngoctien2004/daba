import { useQuery } from '@tanstack/react-query'
import { fetchPatient } from '../api/patients'

/**
 * Hook to fetch patient detail by ID
 * Uses React Query for caching and state management
 */
export function usePatientDetail(patientId: number | null) {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => {
      if (!patientId) {
        throw new Error('Patient ID is required')
      }
      return fetchPatient(patientId)
    },
    enabled: !!patientId, // Only fetch when patientId is provided
    staleTime: 30_000, // Cache for 30 seconds
    retry: 1,
  })
}
