/**
 * Admin Doctor Schedules API
 */

import { get, post, put, del } from '@/lib/api-client'
import type {
    DoctorSchedule,
    ScheduleListParams,
    CreateScheduleRequest,
    UpdateScheduleRequest,
    BulkCreateScheduleRequest,
    DoctorAvailability,
    ScheduleCalendarEvent,
} from '../types'

/**
 * Get list of doctor schedules
 */
export async function fetchDoctorSchedules(
    params: ScheduleListParams
): Promise<{ data: DoctorSchedule[]; pagination: any }> {
    const { data } = await get<{ data: DoctorSchedule[]; pagination: any }>(
        '/admin/doctor-schedules',
        { params }
    )
    return data
}

/**
 * Get schedule by ID
 */
export async function getScheduleById(id: number): Promise<DoctorSchedule> {
    const { data } = await get<DoctorSchedule>(`/admin/doctor-schedules/${id}`)
    return data
}

/**
 * Create new schedule
 */
export async function createSchedule(request: CreateScheduleRequest): Promise<DoctorSchedule> {
    const { data } = await post<DoctorSchedule>('/admin/doctor-schedules', request)
    return data
}

/**
 * Bulk create schedules
 */
export async function bulkCreateSchedules(
    request: BulkCreateScheduleRequest
): Promise<DoctorSchedule[]> {
    const { data } = await post<DoctorSchedule[]>('/admin/doctor-schedules/bulk', request)
    return data
}

/**
 * Update schedule
 */
export async function updateSchedule(
    id: number,
    request: UpdateScheduleRequest
): Promise<DoctorSchedule> {
    const { data } = await put<DoctorSchedule>(`/admin/doctor-schedules/${id}`, request)
    return data
}

/**
 * Delete schedule
 */
export async function deleteSchedule(id: number): Promise<void> {
    await del(`/admin/doctor-schedules/${id}`)
}

/**
 * Get calendar events for schedules
 */
export async function getScheduleCalendarEvents(params: {
    startDate: string
    endDate: string
    doctorId?: number
    departmentId?: number
}): Promise<ScheduleCalendarEvent[]> {
    const { data } = await get<ScheduleCalendarEvent[]>('/admin/doctor-schedules/calendar', {
        params,
    })
    return data
}

/**
 * Get doctor availability
 */
export async function getDoctorAvailability(params: {
    doctorId: number
    startDate: string
    endDate: string
}): Promise<DoctorAvailability[]> {
    const { data } = await get<DoctorAvailability[]>(
        `/admin/doctor-schedules/doctors/${params.doctorId}/availability`,
        { params }
    )
    return data
}
