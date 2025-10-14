import { useQuery } from '@tanstack/react-query'
import { fetchMedicalRecords, type FetchMedicalRecordsInput } from '../api/medical-records'

export const useMedicalRecords = (params: FetchMedicalRecordsInput = {}) => {
    return useQuery({
        queryKey: ['medical-records', params],
        queryFn: () => fetchMedicalRecords(params),
        retry: 1,
        staleTime: 30000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    })
}
