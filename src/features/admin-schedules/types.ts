/**
 * Admin Doctor Schedules Types
 * API: GET /api/schedules/available
 */

// ==================== Schedule Types ====================

export type Shift = 'SANG' | 'CHIEU' | 'TOI'

export interface DoctorScheduleInfo {
    id: number
    fullName: string
    position: string
    examinationFee: number
    available: boolean
    roomName: string
    invalidTimes: string[] // Array of time strings like "09:00:00"
    shift: Shift
}

export interface ScheduleDate {
    date: string // yyyy-MM-dd format
    dateName: string // MONDAY, TUESDAY, etc.
    totalSlot: number
    doctors: DoctorScheduleInfo[]
}

export interface SchedulesResponse {
    data: ScheduleDate[]
    message: string
}

// ==================== Filter Params ====================

export interface ScheduleFilters {
    startDate: string // yyyy-MM-dd (required)
    endDate: string // yyyy-MM-dd (required)
    departmentId?: number
    doctorId?: number
    shift?: Shift
}

// ==================== Department & Doctor ====================

export interface Department {
    id: number
    name: string
    code: string
    description?: string
    floor?: string
    building?: string
}

export interface DoctorBasic {
    id: number
    fullName: string
    position: string
    departmentId: number
    departmentName?: string
    profileImage?: string
    available: boolean
}

// ==================== UI State ====================

export type ViewMode = 'day' | 'week' | 'month'

export interface ScheduleUIState {
    selectedDepartmentId: number | null
    selectedDoctorId: number | null
    viewMode: ViewMode
    currentDate: Date
}

// ==================== Time Slot ====================

export interface TimeSlot {
    time: string // HH:mm:ss
    label: string // Display label like "08:00"
    isAvailable: boolean
    appointmentCount?: number
    maxPatients?: number
}

// ==================== Calendar Cell ====================

export interface CalendarCell {
    date: string
    dayName: string
    timeSlots: {
        shift: Shift
        slots: TimeSlot[]
    }[]
}
