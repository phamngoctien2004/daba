/**
 * Admin Invoices Management Route
 */

import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { format } from 'date-fns'
import { FileText } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ChatButton } from '@/components/chat-button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
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
                <div className='flex items-center gap-2'>
                    <FileText className="h-6 w-6" />
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Quản lý Hóa đơn</h2>
                        <p className='text-muted-foreground'>Quản lý hóa đơn thanh toán và theo dõi công nợ</p>
                    </div>
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
