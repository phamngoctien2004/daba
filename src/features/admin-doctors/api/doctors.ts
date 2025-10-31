/**
 * Admin Doctors Management API
 */

import { get } from '@/lib/api-client'
import type {
    DoctorListParams,
    DoctorsResponse,
} from '../types'

/**
 * Fetch list of doctors with filters
 * GET /api/doctors/admin
 */
export async function fetchDoctors(params: DoctorListParams): Promise<{
    content: any[]
    totalPages: number
    totalElements: number
    number: number
    size: number
}> {
    const { page = 0, size = 10, sort, filters = {} } = params

    // Build query params
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('size', size.toString())

    if (sort) {
        queryParams.append('sort', sort)
    }

    // Add filters to query params (only if provided)
    if (filters.keyword) {
        queryParams.append('keyword', filters.keyword)
    }
    if (filters.departmentId) {
        queryParams.append('departmentId', filters.departmentId.toString())
    }
    if (filters.degreeId) {
        queryParams.append('degreeId', filters.degreeId.toString())
    }

    console.log('🔵 [fetchDoctors] Request:', {
        url: `/doctors/admin?${queryParams.toString()}`,
        method: 'GET',
    })

    // API endpoint: GET /api/doctors/admin
    const { data } = await get<DoctorsResponse>(
        `/doctors/admin?${queryParams.toString()}`
    )

    // Extract from nested structure
    const responseData = data?.data || {}

    return {
        content: responseData.content || [],
        totalPages: responseData.totalPages || 0,
        totalElements: responseData.totalElements || 0,
        number: responseData.number || 0,
        size: responseData.size || size,
    }
}
