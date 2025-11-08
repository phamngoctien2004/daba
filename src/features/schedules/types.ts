export type LeaveStatus = 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI'

export type ShiftType = 'SANG' | 'CHIEU' | 'TOI'

export type DayName = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

export interface DoctorScheduleDetail {
    id: number
    fullName: string
    position: string
    examinationFee: number
    available: boolean
    roomName: string
    invalidTimes: string[]
    shift: ShiftType
}

export interface DailySchedule {
    date: string // yyyy-MM-dd
    dateName: DayName
    totalSlot: number
    doctors: DoctorScheduleDetail[]
}

export interface AvailableSchedulesResponse {
    data: DailySchedule[]
}

export interface FetchAvailableSchedulesParams {
    startDate: string // yyyy-MM-dd
    endDate: string // yyyy-MM-dd
    departmentId?: number
    doctorId?: number
    shift?: ShiftType
}

export interface LeaveRequest {
    id: number
    doctorName: string
    startTime: string // HH:mm:ss
    endTime: string // HH:mm:ss
    date: string // yyyy-MM-dd
    submitDate: string // yyyy-MM-dd
    reason: string
    leaveStatus: LeaveStatus
    userApprover: string | null
}

export interface CreateLeaveRequest {
    doctorId?: number // Optional - backend will use current user if not provided
    day: string // yyyy-MM-dd
    reason: string
    shifts: ShiftType[] // Array of shifts: SANG, CHIEU, TOI
}

export interface UpdateLeaveRequest {
    id: number
    status: LeaveStatus
    note?: string
}

export interface DeleteLeaveRequest {
    id: number
}

export interface FetchMyLeavesParams {
    date?: string
    leaveStatus?: LeaveStatus // Changed from 'status' to match backend
}
