/**
 * Departments API for Filters
 * Simple endpoint for getting all departments (no pagination)
 */

import { get } from '@/lib/api-client'

export interface Department {
    id: number
    name: string
    phone: string
    description: string
}

/**
 * Check if value is a plain object
 */
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Type guard for Department
 */
function isDepartment(value: unknown): value is Department {
    if (!isRecord(value)) return false
    return (
        typeof value.id === 'number' &&
        typeof value.name === 'string' &&
        typeof value.phone === 'string' &&
        typeof value.description === 'string'
    )
}

/**
 * Fetch all departments (for filters, no pagination)
 */
export async function fetchDepartmentsForFilter(): Promise<Department[]> {
    const { data } = await get<unknown>('/departments')

    console.log('🔵 [fetchDepartmentsForFilter] Raw response:', data)

    // Handle direct array response
    if (Array.isArray(data)) {
        return data.filter(isDepartment)
    }

    // Handle wrapped response
    if (isRecord(data)) {
        const innerData = data.data
        if (Array.isArray(innerData)) {
            return innerData.filter(isDepartment)
        }
    }

    console.warn('⚠️ [fetchDepartmentsForFilter] Unexpected response format:', data)
    return []
}
