/**
 * Admin Reports & Analytics Types
 */

export type ReportType = 'REVENUE' | 'APPOINTMENTS' | 'PATIENTS' | 'DOCTORS' | 'SERVICES'

export type ReportPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

export interface ReportFilter {
    type: ReportType
    period: ReportPeriod
    startDate: string
    endDate: string
    departmentId?: number
    doctorId?: number
    serviceId?: number
}

export interface RevenueReport {
    period: string
    totalRevenue: number
    totalAppointments: number
    averageRevenuePerAppointment: number
    paymentMethods: {
        method: string
        amount: number
        count: number
    }[]
}

export interface AppointmentReport {
    period: string
    total: number
    completed: number
    cancelled: number
    noShow: number
    byDepartment: {
        departmentId: number
        departmentName: string
        count: number
    }[]
    byDoctor: {
        doctorId: number
        doctorName: string
        count: number
    }[]
}

export interface PatientReport {
    period: string
    newPatients: number
    returningPatients: number
    totalVisits: number
    byGender: {
        gender: string
        count: number
    }[]
    byAgeGroup: {
        ageGroup: string
        count: number
    }[]
}

export interface DoctorReport {
    period: string
    doctorId: number
    doctorName: string
    department: string
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    averageConsultationTime: number
    patientSatisfaction: number
    revenue: number
}

export interface ServiceReport {
    period: string
    serviceId: number
    serviceName: string
    totalBookings: number
    revenue: number
    averagePrice: number
    popularityRank: number
}

export interface Report {
    id: number
    type: ReportType
    period: ReportPeriod
    startDate: string
    endDate: string
    createdAt: string
    createdBy: string
    data: RevenueReport | AppointmentReport | PatientReport | DoctorReport[] | ServiceReport[]
}

export interface ExportReportRequest {
    reportId: number
    format: 'PDF' | 'EXCEL' | 'CSV'
}
