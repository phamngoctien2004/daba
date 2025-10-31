/**
 * Degrees API
 */

import { get } from '@/lib/api-client'

export interface Degree {
    degreeId: number
    degreeName: string
    examinationFee: number
}

/**
 * Fetch all degrees
 * GET /api/degrees
 */
export async function fetchDegrees(): Promise<Degree[]> {
    try {
        const { data } = await get<any>('/degrees')

        console.log('🔵 [fetchDegrees] Raw response:', data)

        // Handle different response formats
        // Format 1: Direct array [{degreeId, degreeName, ...}, ...]
        if (Array.isArray(data)) {
            console.log('🔵 [fetchDegrees] Direct array format')
            return data
        }

        // Format 2: Wrapped {data: [...]}
        if (data && Array.isArray(data.data)) {
            console.log('🔵 [fetchDegrees] Wrapped format')
            return data.data
        }

        console.warn('⚠️ [fetchDegrees] Unexpected response format, returning empty array')
        return []
    } catch (error) {
        console.error('❌ [fetchDegrees] Error:', error)
        return []
    }
}
