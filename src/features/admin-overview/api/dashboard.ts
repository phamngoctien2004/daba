/**
 * Admin Overview Dashboard API
 */

import { get } from '@/lib/api-client'
import type { DashboardOverview } from '../types'

/**
 * Fetch dashboard overview data
 */
export async function fetchDashboardOverview(): Promise<DashboardOverview> {
    const { data } = await get<DashboardOverview>('/admin/dashboard/overview')
    return data
}
