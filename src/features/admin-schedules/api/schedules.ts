/**
 * Admin Doctor Schedules API Client
 */

import { get } from '@/lib/api-client'
import type {
    SchedulesResponse,
    ScheduleFilters,
    Department,
    DoctorBasic,
} from '../types'

// ==================== Schedules API ====================

/**
 * Fetch available schedules
 * GET /api/schedules/available
 */
export async function fetchAvailableSchedules(
    filters: ScheduleFilters
): Promise<SchedulesResponse> {
    const params = new URLSearchParams()

    params.append('startDate', filters.startDate)
    params.append('endDate', filters.endDate)

    if (filters.departmentId) {
        params.append('departmentId', filters.departmentId.toString())
    }

    if (filters.doctorId) {
        params.append('doctorId', filters.doctorId.toString())
    }

    if (filters.shift) {
        params.append('shift', filters.shift)
    }

    const response = await get<SchedulesResponse>(`/schedules/available?${params.toString()}`)

    return response.data
}

// ==================== Departments API ====================

/**
 * Fetch all departments
 * GET /api/departments
 */
export async function fetchDepartments(): Promise<Department[]> {
    const response = await get<{ data: Department[]; message: string }>('/departments')

    // Handle both array and wrapped response
    if (Array.isArray(response.data)) {
        return response.data
    }

    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data
    }

    return []
}

// ==================== Doctors API ====================

/**
 * Fetch doctors by department
 * GET /api/doctors?departmentId={id}
 */
export async function fetchDoctorsByDepartment(
    departmentId: number
): Promise<DoctorBasic[]> {
    const response = await get<{ data: any[]; message: string }>(
        `/doctors?departmentId=${departmentId}`
    )

    const rawData = response.data

    // Handle different response formats
    let doctors: any[] = []

    if (Array.isArray(rawData)) {
        doctors = rawData
    } else if (rawData && typeof rawData === 'object' && 'data' in rawData) {
        doctors = (rawData as any).data
    }

    // Map to DoctorBasic format
    return doctors.map((doctor: any) => ({
        id: doctor.id,
        fullName: doctor.fullName || doctor.name || '',
        position: doctor.position || '',
        departmentId: doctor.departmentId || departmentId,
        departmentName: doctor.departmentName || doctor.department?.name || '',
        profileImage: doctor.profileImage || doctor.avatar || '',
        available: doctor.available !== false,
    }))
}

/**
 * Fetch all doctors
 * GET /api/doctors
 */
export async function fetchAllDoctors(): Promise<DoctorBasic[]> {
    const response = await get<{ data: any[]; message: string }>('/doctors')

    const rawData = response.data

    let doctors: any[] = []

    if (Array.isArray(rawData)) {
        doctors = rawData
    } else if (rawData && typeof rawData === 'object' && 'data' in rawData) {
        doctors = (rawData as any).data
    }

    return doctors.map((doctor: any) => ({
        id: doctor.id,
        fullName: doctor.fullName || doctor.name || '',
        position: doctor.position || '',
        departmentId: doctor.departmentId || 0,
        departmentName: doctor.departmentName || doctor.department?.name || '',
        profileImage: doctor.profileImage || doctor.avatar || '',
        available: doctor.available !== false,
    }))
}
