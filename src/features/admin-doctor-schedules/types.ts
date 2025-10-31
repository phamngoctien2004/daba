/**
 * Admin Doctor Schedule Management Types
 */

export type ScheduleStatus =
    | 'ACTIVE'        // Hoạt động
    | 'INACTIVE'      // Không hoạt động
    | 'LEAVE'         // Nghỉ phép
    | 'SICK_LEAVE'    // Nghỉ ốm

export type DayOfWeek =
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY'

export interface TimeSlot {
    id: number
    startTime: string   // HH:mm:ss
    endTime: string     // HH:mm:ss
    maxPatients: number
    bookedPatients: number
}

export interface DoctorSchedule {
    id: number
    doctorId: number
    doctorName: string
    departmentId: number
    departmentName: string
    dayOfWeek: DayOfWeek
    date?: string       // yyyy-MM-dd (for specific date schedules)
    timeSlots: TimeSlot[]
    status: ScheduleStatus
    notes?: string
    createdAt: string
    updatedAt: string
}

export interface CreateScheduleRequest {
    doctorId: number
    dayOfWeek?: DayOfWeek
    date?: string
    timeSlots: {
        startTime: string
        endTime: string
        maxPatients: number
    }[]
    status: ScheduleStatus
    notes?: string
}

export interface UpdateScheduleRequest {
    dayOfWeek?: DayOfWeek
    date?: string
    timeSlots?: {
        id?: number
        startTime: string
        endTime: string
        maxPatients: number
    }[]
    status?: ScheduleStatus
    notes?: string
}

export interface BulkCreateScheduleRequest {
    doctorId: number
    startDate: string
    endDate: string
    daysOfWeek: DayOfWeek[]
    timeSlots: {
        startTime: string
        endTime: string
        maxPatients: number
    }[]
    status: ScheduleStatus
    notes?: string
}

export interface ScheduleListParams {
    page?: number
    size?: number
    doctorId?: number
    departmentId?: number
    dayOfWeek?: DayOfWeek
    startDate?: string
    endDate?: string
    status?: ScheduleStatus
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface ScheduleCalendarEvent {
    id: number
    title: string
    doctorName: string
    start: Date
    end: Date
    status: ScheduleStatus
    maxPatients: number
    bookedPatients: number
}

export interface DoctorAvailability {
    doctorId: number
    doctorName: string
    date: string
    availableSlots: {
        startTime: string
        endTime: string
        available: number
    }[]
    totalSlots: number
    bookedSlots: number
}
