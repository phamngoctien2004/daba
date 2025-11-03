/**
 * Admin Doctors Management API
 */

import { get, post, put, del } from '@/lib/api-client'
import type {
    DoctorListParams,
    DoctorsResponse,
    DoctorsListResponse,
    DoctorResponse,
    DoctorDetail,
    CreateDoctorRequest,
    UpdateDoctorRequest,
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

/**
 * Fetch all doctors (no pagination)
 * GET /api/doctors
 */
export async function fetchAllDoctors(): Promise<DoctorDetail[]> {
    console.log('🔵 [fetchAllDoctors] Request:', {
        url: '/doctors',
        method: 'GET',
    })

    const { data } = await get<DoctorsListResponse>('/doctors')

    console.log('🔵 [fetchAllDoctors] Response:', data)

    // Response format: {data: [...], message: "..."}
    return data?.data || []
}

/**
 * Fetch doctor by ID
 * GET /api/doctors/{id}
 */
export async function fetchDoctorById(id: number): Promise<DoctorDetail | null> {
    console.log('🔵 [fetchDoctorById] Request:', {
        url: `/doctors/${id}`,
        method: 'GET',
    })

    const { data } = await get<DoctorResponse>(`/doctors/${id}`)

    console.log('🔵 [fetchDoctorById] Response:', data)

    // Response format: {data: {...}, message: "..."}
    return data?.data || null
}

/**
 * Create a new doctor
 * POST /api/doctors
 */
export async function createDoctor(requestData: CreateDoctorRequest): Promise<DoctorDetail> {
    console.log('🔵 [createDoctor] Request:', {
        url: '/doctors',
        method: 'POST',
        data: requestData,
    })

    const { data } = await post<DoctorResponse>('/doctors', requestData)

    console.log('🔵 [createDoctor] Response:', data)

    // Response format: {data: {...}, message: "Created doctor successfully"}
    return data.data
}

/**
 * Update an existing doctor
 * PUT /api/doctors
 */
export async function updateDoctor(requestData: UpdateDoctorRequest): Promise<DoctorDetail> {
    console.log('🔵 [updateDoctor] Request:', {
        url: '/doctors',
        method: 'PUT',
        data: requestData,
    })

    const { data } = await put<DoctorResponse>('/doctors', requestData)

    console.log('🔵 [updateDoctor] Response:', data)

    // Response format: {data: {...}, message: "Updated doctor successfully"}
    return data.data
}

/**
 * Delete a doctor
 * DELETE /api/doctors/{id}
 */
export async function deleteDoctor(id: number): Promise<void> {
    console.log('🔵 [deleteDoctor] Request:', {
        url: `/doctors/${id}`,
        method: 'DELETE',
    })

    await del(`/doctors/${id}`)
}
