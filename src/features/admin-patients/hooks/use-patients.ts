import { useQuery } from '@tanstack/react-query'
import { fetchPatients, type FetchPatientsInput } from '../api/patients'

export const usePatients = (params: FetchPatientsInput = {}) => {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => fetchPatients(params),
    retry: 1,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}
