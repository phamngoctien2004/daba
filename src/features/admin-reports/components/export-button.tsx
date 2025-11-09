/**
 * Export Report Button Component
 */

import { FileDown, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useExportPDF, useExportExcel } from '../hooks/use-reports'
import type { ReportType } from '../types'
import type { DateRange } from './date-range-picker'

interface ExportReportButtonProps {
    reportType: ReportType
    dateRange: DateRange
    disabled?: boolean
}

export function ExportReportButton({ reportType, dateRange, disabled }: ExportReportButtonProps) {
    const exportPDF = useExportPDF()
    const exportExcel = useExportExcel()

    const handleExportPDF = () => {
        exportPDF.mutate({
            reportType,
            fromDate: dateRange.fromDate,
            toDate: dateRange.toDate,
        })
    }

    const handleExportExcel = () => {
        exportExcel.mutate({
            reportType,
            fromDate: dateRange.fromDate,
            toDate: dateRange.toDate,
        })
    }

    const isLoading = exportPDF.isPending || exportExcel.isPending

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='outline' disabled={disabled || isLoading}>
                    <FileDown className='mr-2 h-4 w-4' />
                    {isLoading ? 'Đang xuất...' : 'Xuất báo cáo'}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={handleExportPDF} disabled={isLoading}>
                    <FileDown className='mr-2 h-4 w-4' />
                    Xuất PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel} disabled={isLoading}>
                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                    Xuất Excel
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
