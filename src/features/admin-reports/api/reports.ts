/**
 * Admin Reports API
 * Based on backend API documentation
 */

import { get } from '@/lib/api-client'
import type {
    ApiResponse,
    RevenueReportData,
    AppointmentReportData,
    PatientReportData,
    DoctorPerformanceData,
    ServiceReportData,
    DashboardReportData,
    DateRangeParams,
    AppointmentReportParams,
    DoctorPerformanceParams,
    ExportReportParams,
} from '../types'

/**
 * Fetch revenue report
 */
export async function fetchRevenueReport(params: DateRangeParams): Promise<RevenueReportData> {
    const { data } = await get<ApiResponse<RevenueReportData>>('/reports/revenue', { params })
    return data.data
}

/**
 * Fetch appointments report
 */
export async function fetchAppointmentsReport(params: AppointmentReportParams): Promise<AppointmentReportData> {
    const { data } = await get<ApiResponse<AppointmentReportData>>('/reports/appointments', { params })
    return data.data
}

/**
 * Fetch patients report
 */
export async function fetchPatientsReport(params: DateRangeParams): Promise<PatientReportData> {
    const { data } = await get<ApiResponse<PatientReportData>>('/reports/patients', { params })
    return data.data
}

/**
 * Fetch doctor performance report
 */
export async function fetchDoctorPerformanceReport(params: DoctorPerformanceParams): Promise<DoctorPerformanceData> {
    const { data } = await get<ApiResponse<DoctorPerformanceData>>('/reports/doctor-performance', { params })
    return data.data
}

/**
 * Fetch services report
 */
export async function fetchServicesReport(params: DateRangeParams): Promise<ServiceReportData> {
    const { data } = await get<ApiResponse<ServiceReportData>>('/reports/services', { params })
    return data.data
}

/**
 * Fetch dashboard report (all reports combined)
 */
export async function fetchDashboardReport(params: DateRangeParams): Promise<DashboardReportData> {
    const { data } = await get<ApiResponse<DashboardReportData>>('/reports/dashboard', { params })
    console.log('🔵 [Dashboard Report] Raw response:', data)
    console.log('🔵 [Dashboard Report] Appointments data:', data.data.appointments)
    return data.data
}

/**
 * Export report as PDF
 */
export async function exportReportPDF(params: ExportReportParams): Promise<Blob> {
    const { data } = await get<Blob>('/reports/export/pdf', {
        params,
        responseType: 'blob',
    })
    return data
}

/**
 * Export report as Excel
 */
export async function exportReportExcel(params: ExportReportParams): Promise<Blob> {
    const { data } = await get<Blob>('/reports/export/excel', {
        params,
        responseType: 'blob',
    })
    return data
}

/**
 * Helper function to download blob as file
 */
export function downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
}
