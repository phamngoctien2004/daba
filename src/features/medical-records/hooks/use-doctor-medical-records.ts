import { useQuery } from '@tanstack/react-query'
import { fetchDoctorMedicalRecords, type FetchDoctorMedicalRecordsInput } from '../api/medical-records'

export const useDoctorMedicalRecords = (params: FetchDoctorMedicalRecordsInput = {}) => {
  return useQuery({
    queryKey: ['doctor-medical-records', params],
    queryFn: () => fetchDoctorMedicalRecords(params),
    retry: 1,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}
