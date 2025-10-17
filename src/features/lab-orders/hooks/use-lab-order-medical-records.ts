import { useQuery } from '@tanstack/react-query'
import { fetchDoctorLabOrders, type FetchLabOrdersInput } from '../api/lab-orders'

/**
 * Hook to fetch lab orders for doctor
 * Uses the /api/lab-orders/doctor endpoint
 */
export function useDoctorLabOrders(input: FetchLabOrdersInput = {}) {
  return useQuery({
    queryKey: ['doctor-lab-orders', input],
    queryFn: () => fetchDoctorLabOrders(input),
    placeholderData: (previous) => previous,
    staleTime: 30_000, // 30 seconds
  })
}
