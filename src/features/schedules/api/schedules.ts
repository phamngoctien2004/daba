import { get } from '@/lib/api-client'

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
