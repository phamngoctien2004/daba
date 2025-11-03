/**
 * Admin Invoices Management Route
 */

import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { format } from 'date-fns'
import { FileText, Download } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ChatButton } from '@/components/chat-button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { InvoicesTable } from '@/features/admin-invoices/components/invoices-table'
import { InvoiceFilters } from '@/features/admin-invoices/components/invoice-filters'
import { useInvoices } from '@/features/admin-invoices/hooks/use-invoices'
import type { InvoiceFilters as IInvoiceFilters } from '@/features/admin-invoices/types'

function AdminInvoicesPage() {
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(10)

    // Mặc định fromDate và toDate là hôm nay
    const today = format(new Date(), 'yyyy-MM-dd')
    const [filters, setFilters] = useState<IInvoiceFilters>({
        fromDate: today,
        toDate: today,
    })

    const { data, isLoading } = useInvoices({
        page,
        size: pageSize,
        sort: 'paymentDate,desc',
        filters,
    })

    const handleFiltersChange = (newFilters: IInvoiceFilters) => {
        setFilters(newFilters)
        setPage(0) // Reset to first page when filters change
    }

    const handleResetFilters = () => {
        setFilters({
            fromDate: today,
            toDate: today,
        })
        setPage(0)
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize)
        setPage(0) // Reset to first page when page size changes
    }

    const handleExport = () => {
        // Export data to CSV
        const invoices = data?.content || []
        if (invoices.length === 0) {
            alert('Không có dữ liệu để xuất')
            return
        }

        const headers = ['ID', 'Mã hóa đơn', 'Bệnh nhân', 'Tổng tiền', 'Đã thanh toán', 'Còn nợ', 'Trạng thái', 'Ngày thanh toán']
        const rows = invoices.map(invoice => [
            invoice.id,
            invoice.invoiceCode,
            invoice.patientName,
            invoice.totalAmount,
            invoice.paidAmount,
            invoice.unpaidAmount,
            invoice.paymentStatus === 'PAID' ? 'Đã thanh toán' :
                invoice.paymentStatus === 'UNPAID' ? 'Chưa thanh toán' : 'Thanh toán một phần',
            invoice.paymentDate || 'N/A'
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `hoa-don-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <>
            <Header fixed>
                <GlobalSearch />
                <div className='ms-auto flex items-center gap-1'>
                    <ThemeSwitch />
                    <ChatButton />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                        <FileText className="h-6 w-6" />
                        <div>
                            <h2 className='text-2xl font-bold tracking-tight'>Quản lý Hóa đơn</h2>
                            <p className='text-muted-foreground'>Quản lý hóa đơn thanh toán và theo dõi công nợ</p>
                        </div>
                    </div>
                    <Button onClick={handleExport} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Xuất dữ liệu
                    </Button>
                </div>

                <div className="space-y-6">
                    {/* Filters */}
                    <InvoiceFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onReset={handleResetFilters}
                    />

                    {/* Table */}
                    <InvoicesTable
                        data={data?.content || []}
                        isLoading={isLoading}
                        page={page}
                        pageSize={pageSize}
                        totalPages={data?.totalPages || 0}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </div>
            </Main>
        </>
    )
}

export const Route = createFileRoute('/_authenticated/admin/invoices')({
    component: AdminInvoicesPage,
})
