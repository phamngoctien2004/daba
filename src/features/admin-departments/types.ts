/**
 * Admin Department & Room Management Types
 */

export type DepartmentStatus =
    | 'ACTIVE'        // Hoạt động
    | 'INACTIVE'      // Tạm ngưng
    | 'MAINTENANCE'   // Bảo trì

export type RoomType =
    | 'KHAM_BENH'         // Consultation Room
    | 'PHAU_THUAT'        // Operating Room
    | 'XET_NGHIEM'        // Laboratory
    | 'CHAN_DOAN_HINH_ANH' // Imaging Room
    | 'DIEU_TRI'          // Treatment Room
    | 'NOI_TRU'           // Inpatient Room
    | 'CAP_CUU'           // Emergency Room
    | 'PHUC_HOI'          // Recovery Room

export type RoomStatus =
    | 'AVAILABLE'     // Sẵn sàng
    | 'OCCUPIED'      // Đang sử dụng
    | 'MAINTENANCE'   // Bảo trì
    | 'CLOSED'        // Đóng cửa

export interface RoomEquipment {
    name: string
    quantity: number
    condition: 'GOOD' | 'FAIR' | 'POOR'
    lastMaintenanceDate: string
    nextMaintenanceDate: string
}

export interface Room {
    id: number
    roomNumber: string
    roomName: string
    departmentId: number
    type: RoomType
    floor: number
    capacity: number

    // Equipment & Facilities
    equipment: RoomEquipment[]
    facilities: string[]

    // Status & Availability
    status: RoomStatus
    isAvailable: boolean

    // Statistics
    utilizationRate: number   // Percentage
    totalBookings: number

    // System info
    createdAt: string
    updatedAt: string
    notes?: string
}

export interface DepartmentDetail {
    id: number
    code: string
    name: string
    description: string

    // Location & Contact
    floor: number
    building?: string
    phone: string
    email?: string

    // Management
    headDoctorId?: number
    headDoctorName?: string

    // Status
    status: DepartmentStatus

    // Rooms
    rooms: Room[]
    totalRooms: number
    availableRooms: number

    // Staff
    totalDoctors: number
    totalNurses: number
    totalStaff: number

    // Statistics
    totalAppointments: number
    totalPatients: number
    averageWaitTime: number    // Minutes
    patientSatisfaction: number // 0-5

    // System info
    createdAt: string
    updatedAt: string
    createdBy: string
    notes?: string
}

export interface CreateDepartmentRequest {
    code: string
    name: string
    description: string
    floor: number
    building?: string
    phone: string
    email?: string
    headDoctorId?: number
    notes?: string
}

export interface UpdateDepartmentRequest {
    code?: string
    name?: string
    description?: string
    floor?: number
    building?: string
    phone?: string
    email?: string
    headDoctorId?: number
    status?: DepartmentStatus
    notes?: string
}

export interface CreateRoomRequest {
    departmentId: number
    roomNumber: string
    roomName: string
    type: RoomType
    floor: number
    capacity: number
    equipment?: RoomEquipment[]
    facilities?: string[]
    notes?: string
}

export interface UpdateRoomRequest {
    roomNumber?: string
    roomName?: string
    type?: RoomType
    floor?: number
    capacity?: number
    equipment?: RoomEquipment[]
    facilities?: string[]
    status?: RoomStatus
    notes?: string
}

export interface DepartmentListParams {
    page?: number
    size?: number
    status?: DepartmentStatus
    floor?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface DepartmentListResponse {
    data: DepartmentDetail[]
    pagination: {
        page: number
        size: number
        total: number
        totalPages: number
    }
}

export interface RoomListParams {
    page?: number
    size?: number
    departmentId?: number
    type?: RoomType
    status?: RoomStatus
    floor?: number
    isAvailable?: boolean
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface RoomListResponse {
    data: Room[]
    pagination: {
        page: number
        size: number
        total: number
        totalPages: number
    }
}

export interface DepartmentStatistics {
    departmentId: number
    departmentName: string
    period: string

    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number

    totalPatients: number
    newPatients: number
    returningPatients: number

    totalRevenue: number
    averageRevenuePerAppointment: number

    averageWaitTime: number
    averageConsultationTime: number

    roomUtilization: {
        roomId: number
        roomName: string
        utilizationRate: number
    }[]

    doctorPerformance: {
        doctorId: number
        doctorName: string
        totalAppointments: number
        patientSatisfaction: number
    }[]
}

export interface RoomSchedule {
    roomId: number
    roomNumber: string
    date: string
    schedule: {
        startTime: string
        endTime: string
        status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED'
        appointmentId?: number
        doctorId?: number
        doctorName?: string
        patientName?: string
        purpose?: string
    }[]
}
