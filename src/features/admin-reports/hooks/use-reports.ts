/**
 * React Query hooks for reports
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import type {
    DateRangeParams,
    AppointmentReportParams,
    DoctorPerformanceParams,
    ExportReportParams,
} from '../types'
import {
    fetchRevenueReport,
    fetchAppointmentsReport,
    fetchPatientsReport,
    fetchDoctorPerformanceReport,
    fetchServicesReport,
    fetchDashboardReport,
    exportReportPDF,
    exportReportExcel,
    downloadFile,
} from '../api/reports'

/**
 * Hook to fetch revenue report
 */
export function useRevenueReport(params: DateRangeParams, enabled = true) {
    return useQuery({
        queryKey: ['reports', 'revenue', params],
        queryFn: () => fetchRevenueReport(params),
        enabled,
    })
}

/**
 * Hook to fetch appointments report
 */
export function useAppointmentsReport(params: AppointmentReportParams, enabled = true) {
    return useQuery({
        queryKey: ['reports', 'appointments', params],
        queryFn: () => fetchAppointmentsReport(params),
        enabled,
    })
}

/**
 * Hook to fetch patients report
 */
export function usePatientsReport(params: DateRangeParams, enabled = true) {
    return useQuery({
        queryKey: ['reports', 'patients', params],
        queryFn: () => fetchPatientsReport(params),
        enabled,
    })
}

/**
 * Hook to fetch doctor performance report
 */
export function useDoctorPerformanceReport(params: DoctorPerformanceParams, enabled = true) {
    return useQuery({
        queryKey: ['reports', 'doctor-performance', params],
        queryFn: () => fetchDoctorPerformanceReport(params),
        enabled,
    })
}

/**
 * Hook to fetch services report
 */
export function useServicesReport(params: DateRangeParams, enabled = true) {
    return useQuery({
        queryKey: ['reports', 'services', params],
        queryFn: () => fetchServicesReport(params),
        enabled,
    })
}

/**
 * Hook to fetch dashboard report (all reports combined)
 */
export function useDashboardReport(params: DateRangeParams, enabled = true) {
    return useQuery({
        queryKey: ['reports', 'dashboard', params],
        queryFn: () => fetchDashboardReport(params),
        enabled,
    })
}

/**
 * Hook to export report as PDF
 */
export function useExportPDF() {
    const { toast } = useToast()

    return useMutation({
        mutationFn: (params: ExportReportParams) => exportReportPDF(params),
        onSuccess: (blob, variables) => {
            const filename = `bao-cao-${variables.reportType}-${variables.fromDate}-${variables.toDate}.pdf`
            downloadFile(blob, filename)
            toast({
                title: 'Xuất báo cáo thành công',
                description: `File ${filename} đã được tải xuống`,
            })
        },
        onError: () => {
            toast({
                title: 'Xuất báo cáo thất bại',
                description: 'Không thể xuất báo cáo. Vui lòng thử lại sau.',
                variant: 'destructive',
            })
        },
    })
}

/**
 * Hook to export report as Excel
 */
export function useExportExcel() {
    const { toast } = useToast()

    return useMutation({
        mutationFn: (params: ExportReportParams) => exportReportExcel(params),
        onSuccess: (blob, variables) => {
            const filename = `bao-cao-${variables.reportType}-${variables.fromDate}-${variables.toDate}.xlsx`
            downloadFile(blob, filename)
            toast({
                title: 'Xuất báo cáo thành công',
                description: `File ${filename} đã được tải xuống`,
            })
        },
        onError: () => {
            toast({
                title: 'Xuất báo cáo thất bại',
                description: 'Không thể xuất báo cáo. Vui lòng thử lại sau.',
                variant: 'destructive',
            })
        },
    })
}
