/**
 * Admin Reports API
 */

import { get, post } from '@/lib/api-client'
import type {
    Report,
    ReportFilter,
    ExportReportRequest,
} from '../types'

/**
 * Generate report based on filters
 */
export async function generateReport(filter: ReportFilter): Promise<Report> {
    const { data } = await post<Report>('/admin/reports/generate', filter)
    return data
}

/**
 * Get report by ID
 */
export async function getReportById(id: number): Promise<Report> {
    const { data } = await get<Report>(`/admin/reports/${id}`)
    return data
}

/**
 * Get list of reports
 */
export async function getReports(params?: {
    page?: number
    size?: number
    type?: string
}): Promise<{ data: Report[]; pagination: any }> {
    const { data } = await get<{ data: Report[]; pagination: any }>('/admin/reports', { params })
    return data
}

/**
 * Export report
 */
export async function exportReport(request: ExportReportRequest): Promise<Blob> {
    const { data } = await post<Blob>(
        `/admin/reports/${request.reportId}/export`,
        { format: request.format },
        { responseType: 'blob' }
    )
    return data
}
