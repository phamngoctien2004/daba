/**
 * Admin Reports & Analytics Types
 * Based on backend API documentation
 */

export type ReportType = 'revenue' | 'appointments' | 'patients' | 'doctor-performance' | 'services'
export type ExportFormat = 'pdf' | 'excel'
export type PaymentMethod = 'TIEN_MAT' | 'CHUYEN_KHOAN' | 'THE'
export type Gender = 'NAM' | 'NU'

export interface DateRangeParams {
    fromDate: string // YYYY-MM-DD
    toDate: string // YYYY-MM-DD
}

export interface AppointmentReportParams extends DateRangeParams {
    doctorId?: number
    departmentId?: number
}

export interface DoctorPerformanceParams extends DateRangeParams {
    doctorId?: number
}

export interface ExportReportParams extends DateRangeParams {
    reportType: ReportType
}

// Revenue Report Response
export interface RevenueByDay {
    date: string
    revenue: number
    invoiceCount: number
}

export interface RevenueByPaymentMethod {
    paymentMethod: PaymentMethod
    amount: number
    count: number
}

export interface RevenueReportData {
    fromDate: string
    toDate: string
    totalRevenue: number
    totalPaid: number
    totalUnpaid: number
    totalInvoices: number
    totalPaidInvoices: number
    totalUnpaidInvoices: number
    revenueByDays: RevenueByDay[]
    revenueByPaymentMethods: RevenueByPaymentMethod[]
}

// Appointments Report Response
export interface AppointmentByDoctor {
    doctorId: number
    doctorName: string
    departmentName: string
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
}

export interface AppointmentByDepartment {
    departmentId: number
    departmentName: string
    totalAppointments: number
    completedAppointments: number
}

export interface AppointmentByDay {
    date: string
    appointmentCount: number
    completedCount: number
}

export interface AppointmentReportData {
    fromDate: string
    toDate: string
    totalAppointments: number
    confirmedAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    noShowAppointments: number
    appointmentsByDoctor: AppointmentByDoctor[]
    appointmentsByDepartment: AppointmentByDepartment[]
    appointmentsByDay: AppointmentByDay[]
}

// Patients Report Response
export interface PatientByDay {
    date: string
    newPatientCount: number
    returningPatientCount: number
}

export interface PatientByGender {
    gender: Gender
    count: number
    percentage: number
}

export interface PatientByAgeGroup {
    ageGroup: string
    count: number
    percentage: number
}

export interface PatientReportData {
    fromDate: string
    toDate: string
    totalNewPatients: number
    totalReturningPatients: number
    totalPatients: number
    patientsByDay: PatientByDay[]
    patientsByGender: PatientByGender[]
    patientsByAgeGroup: PatientByAgeGroup[]
}

// Doctor Performance Response
export interface DoctorPerformance {
    doctorId: number
    doctorName: string
    departmentName: string
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    totalPatients: number
    totalRevenue: number
    completionRate: number
    averageRating: number
    totalRatings: number
}

export interface DoctorPerformanceData {
    fromDate: string
    toDate: string
    doctorPerformances: DoctorPerformance[]
}

// Services Report Response
export interface PopularService {
    serviceId: number
    serviceName: string
    usageCount: number
    totalRevenue: number
    price: number
}

export interface ServiceByDepartment {
    departmentId: number
    departmentName: string
    serviceCount: number
    usageCount: number
    totalRevenue: number
}

export interface ServiceReportData {
    fromDate: string
    toDate: string
    totalServices: number
    popularServices: PopularService[]
    servicesByDepartment: ServiceByDepartment[]
}

// Dashboard Response
export interface DashboardReportData {
    revenue: RevenueReportData
    appointments: AppointmentReportData
    patients: PatientReportData
    services: ServiceReportData
}

// API Response Wrapper
export interface ApiResponse<T> {
    code: number
    message: string
    data: T
}
