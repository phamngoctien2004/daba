/**
 * Admin Invoices Table Component
 */

import { useMemo } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import type { Invoice, PaymentStatus, PaymentMethod } from '../types'

interface InvoicesTableProps {
    data: Invoice[]
    isLoading: boolean
    page: number
    pageSize: number
    totalPages: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
}

// Status labels
const STATUS_LABELS: Record<PaymentStatus, string> = {
    CHUA_THANH_TOAN: 'Chưa thanh toán',
    DA_THANH_TOAN: 'Đã thanh toán',
    THANH_TOAN_MOT_PHAN: 'Thanh toán một phần',
}

// Status variants for Badge
const STATUS_VARIANTS: Record<PaymentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    CHUA_THANH_TOAN: 'destructive',
    DA_THANH_TOAN: 'default',
    THANH_TOAN_MOT_PHAN: 'secondary',
}

// Payment method labels
const METHOD_LABELS: Record<PaymentMethod, string> = {
    TIEN_MAT: 'Tiền mặt',
    CHUYEN_KHOAN: 'Chuyển khoản',
}

const SKELETON_ROWS = Array.from({ length: 10 })
const SKELETON_COLUMNS = Array.from({ length: 7 })

export function InvoicesTable({
    data,
    isLoading,
    page,
    pageSize,
    totalPages,
    onPageChange,
    onPageSizeChange,
}: InvoicesTableProps) {
    const columns = useMemo<ColumnDef<Invoice>[]>(
        () => [
            {
                accessorKey: 'code',
                header: 'Mã hóa đơn',
                cell: ({ row }) => (
                    <div className="font-mono font-medium">{row.original.code}</div>
                ),
            },
            {
                accessorKey: 'patientName',
                header: 'Bệnh nhân',
                cell: ({ row }) => (
                    <div className="font-medium">{row.original.patientName}</div>
                ),
            },
            {
                accessorKey: 'paymentDate',
                header: 'Ngày thanh toán',
                cell: ({ row }) => {
                    const date = row.original.paymentDate
                    if (!date) return <span className="text-muted-foreground">-</span>
                    return (
                        <div className="text-sm">
                            {format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </div>
                    )
                },
            },
            {
                accessorKey: 'totalAmount',
                header: 'Tổng tiền',
                cell: ({ row }) => (
                    <div className="text-right font-medium">
                        {row.original.totalAmount.toLocaleString('vi-VN')}đ
                    </div>
                ),
            },
            {
                accessorKey: 'paidAmount',
                header: 'Đã thanh toán',
                cell: ({ row }) => (
                    <div className="text-right font-medium text-green-600 dark:text-green-400">
                        {row.original.paidAmount.toLocaleString('vi-VN')}đ
                    </div>
                ),
            },
            {
                accessorKey: 'paymentMethod',
                header: 'Phương thức',
                cell: ({ row }) => (
                    <Badge variant="outline">
                        {METHOD_LABELS[row.original.paymentMethod]}
                    </Badge>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Trạng thái',
                cell: ({ row }) => (
                    <Badge variant={STATUS_VARIANTS[row.original.status]}>
                        {STATUS_LABELS[row.original.status]}
                    </Badge>
                ),
            },
        ],
        []
    )

    const table = useReactTable({
        data,
        columns,
        state: {
            pagination: {
                pageIndex: page,
                pageSize,
            },
        },
        manualPagination: true,
        pageCount: totalPages,
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const newState = updater({ pageIndex: page, pageSize })
                onPageChange(newState.pageIndex)
                onPageSizeChange(newState.pageSize)
            }
        },
    })

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {SKELETON_COLUMNS.map((_, index) => (
                                    <TableHead key={index}>
                                        <Skeleton className="h-4 w-24" />
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {SKELETON_ROWS.map((_, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {SKELETON_COLUMNS.map((_, colIndex) => (
                                        <TableCell key={colIndex}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination table={table} />
        </div>
    )
}
