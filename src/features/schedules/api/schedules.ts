import { get, post, put, del } from '@/lib/api-client'
import type {
    LeaveRequest,
    CreateLeaveRequest,
    UpdateLeaveRequest,
    DeleteLeaveRequest,
    FetchMyLeavesParams,
} from '../types'

/**
 * Shift types matching API
 */
export type Shift = 'SANG' | 'CHIEU' | 'TOI'

/**
 * Doctor available in schedule
 */
export interface AvailableDoctor {
    id: number
    fullName: string
    position: string
    examinationFee: number
    available: boolean
    roomName: string
    invalidTimes: string[]
    shift: Shift
}

/**
 * Available schedule by date
 */
export interface AvailableSchedule {
    date: string
    dateName: string
    totalSlot: number
    doctors: AvailableDoctor[]
}

/**
 * Params for fetching available schedules
 */
export interface FetchAvailableSchedulesParams {
    startDate: string // yyyy-MM-dd
    endDate: string // yyyy-MM-dd
    doctorId?: number
    shift?: Shift
}

/**
 * Calculate current shift based on current time
 * SANG: 7-12
 * CHIEU: 12-17
 * TOI: 17-22
 */
export function getCurrentShift(): Shift {
    const now = new Date()
    const hour = now.getHours()

    if (hour >= 7 && hour < 12) {
        return 'SANG'
    } else if (hour >= 12 && hour < 17) {
        return 'CHIEU'
    } else {
        return 'TOI'
    }
}

/**
 * Fetch available schedules
 */
export const fetchAvailableSchedules = async (
    params: FetchAvailableSchedulesParams
): Promise<AvailableSchedule[]> => {
    const searchParams: Record<string, string> = {
        startDate: params.startDate,
        endDate: params.endDate,
    }

    if (params.doctorId) {
        searchParams.doctorId = String(params.doctorId)
    }

    if (params.shift) {
        searchParams.shift = params.shift
    }

    const { data } = await get<{ data: AvailableSchedule[] }>('/schedules/available', {
        params: searchParams,
    })

    return data?.data ?? []
}

/**
 * Get today's date in yyyy-MM-dd format
 */
export function getTodayDate(): string {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

/**
 * Fetch available doctors for today with current shift
 * Only returns doctors with available=true
 */
export const fetchAvailableDoctorsToday = async (): Promise<AvailableDoctor[]> => {
    const today = getTodayDate()
    const shift = getCurrentShift()

    const schedules = await fetchAvailableSchedules({
        startDate: today,
        endDate: today,
        shift,
    })

    // Extract all available doctors from all schedules
    const allDoctors = schedules.flatMap((schedule) => schedule.doctors)

    // Filter only available doctors
    const availableDoctors = allDoctors.filter((doctor) => doctor.available === true)

    return availableDoctors
}

/**
 * Params for fetching available doctors by department
 */
export interface FetchAvailableDoctorsByDepartmentParams {
    departmentId: number
    startDate: string // yyyy-MM-dd
    endDate: string // yyyy-MM-dd
    shift?: Shift // Optional shift filter
}

/**
 * Fetch available doctors by department for a specific date range
 * GET /api/schedules/available?startDate=X&endDate=Y&departmentId=Z&shift=SANG
 */
export const fetchAvailableDoctorsByDepartment = async (
    params: FetchAvailableDoctorsByDepartmentParams
): Promise<AvailableDoctor[]> => {
    const searchParams: Record<string, string> = {
        startDate: params.startDate,
        endDate: params.endDate,
        departmentId: String(params.departmentId),
    }

    // Add shift parameter if provided
    if (params.shift) {
        searchParams.shift = params.shift
    }

    const { data } = await get<{ data: AvailableSchedule[] }>('/schedules/available', {
        params: searchParams,
    })

    const schedules = data?.data ?? []

    // Extract all available doctors from all schedules
    const allDoctors = schedules.flatMap((schedule) => schedule.doctors)

    // Filter only available doctors
    const availableDoctors = allDoctors.filter((doctor) => doctor.available === true)

    return availableDoctors
}

/**
 * ============================================
 * LEAVE REQUEST APIs  
 * ============================================
 */

/**
 * Fetch my leave requests
 * GET /api/schedules/leave/me
 */
export const fetchMyLeaves = async (params?: FetchMyLeavesParams): Promise<LeaveRequest[]> => {
    const searchParams: Record<string, string> = {}

    if (params?.date) {
        searchParams.date = params.date
    }

    if (params?.leaveStatus) {
        searchParams.leaveStatus = params.leaveStatus
    }

    const { data } = await get<{ data: LeaveRequest[] }>('/schedules/leave/me', {
        params: searchParams,
    })

    const leaves = data?.data ?? []

    // Debug log to check response structure
    if (leaves.length > 0) {
        console.log('🔵 [fetchMyLeaves] First leave:', leaves[0])
    }

    return leaves
}

/**
 * Create leave request
 * POST /api/schedules/leave
 */
export const createLeaveRequest = async (payload: CreateLeaveRequest): Promise<void> => {
    await post('/schedules/leave', payload)
}

/**
 * Update leave request (for approval/rejection by admin)
 * PUT /api/schedules/leave
 */
export const updateLeaveRequest = async (payload: UpdateLeaveRequest): Promise<void> => {
    await put('/schedules/leave', payload)
}

/**
 * Delete/Cancel leave request
 * DELETE /api/schedules/leave
 */
export const deleteLeaveRequest = async (payload: DeleteLeaveRequest): Promise<void> => {
    await del('/schedules/leave', { data: payload })
}
