/**
 * Departments API
 */

import { get } from '@/lib/api-client'

export interface Department {
    id: number
    name: string
}

/**
 * Fetch all departments
 * GET /api/departments
 */
export async function fetchDepartments(): Promise<Department[]> {
    try {
        const { data } = await get<any>('/departments')

        console.log('🔵 [fetchDepartments] Raw response:', data)

        // Handle different response formats
        // Format 1: Direct array [{id, name}, ...]
        if (Array.isArray(data)) {
            console.log('🔵 [fetchDepartments] Direct array format')
            return data
        }

        // Format 2: Wrapped {data: [...]}
        if (data && Array.isArray(data.data)) {
            console.log('🔵 [fetchDepartments] Wrapped format')
            return data.data
        }

        console.warn('⚠️ [fetchDepartments] Unexpected response format, returning empty array')
        return []
    } catch (error) {
        console.error('❌ [fetchDepartments] Error:', error)
        return []
    }
}
