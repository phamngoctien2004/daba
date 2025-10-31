/**
 * React Query hooks for Admin Overview Dashboard
 */

import { useQuery } from '@tanstack/react-query'
import { fetchDashboardOverview } from '../api/dashboard'

/**
 * Hook to fetch dashboard overview data
 */
export const useDashboardOverview = () => {
    return useQuery({
        queryKey: ['admin', 'dashboard', 'overview'],
        queryFn: fetchDashboardOverview,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}
