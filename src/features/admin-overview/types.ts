/**
 * Admin Overview Dashboard Types
 */

export interface DashboardStats {
    totalPatients: number
    totalAppointments: number
    totalRevenue: number
    totalDoctors: number
    todayAppointments: number
    pendingAppointments: number
    completedAppointments: number
    cancelledAppointments: number
}

export interface RevenueByMonth {
    month: string
    revenue: number
    appointments: number
}

export interface AppointmentsByStatus {
    status: string
    count: number
    percentage: number
}

export interface TopService {
    id: number
    name: string
    count: number
    revenue: number
}

export interface DoctorPerformance {
    id: number
    name: string
    department: string
    totalAppointments: number
    completedAppointments: number
    rating: number
}

export interface DashboardOverview {
    stats: DashboardStats
    revenueByMonth: RevenueByMonth[]
    appointmentsByStatus: AppointmentsByStatus[]
    topServices: TopService[]
    doctorPerformance: DoctorPerformance[]
}
