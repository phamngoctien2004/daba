import { useEffect, useMemo } from 'react'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTableUrlState, type NavigateFn } from '@/hooks/use-table-url-state'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { getServicesColumns } from './services-columns'
import type { Service } from '../api/services'
import type { ServicesSearch } from '../types'

const SKELETON_ROWS = Array.from({ length: 5 })
const SKELETON_COLUMNS = Array.from({ length: 6 })

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

type ServicesTableProps = {
    data: Service[]
    total: number
    pageCount: number
    isLoading: boolean
    isRefetching: boolean
    onViewDetail: (id: number) => void
    onEdit?: (id: number) => void
    onDelete?: (id: number) => void
    onResetFilters: () => void
    onCreateNew?: () => void
    search: ServicesSearch
    navigate: NavigateFn
}

// Price range options
const priceRangeOptions = [
    { label: 'Dưới 1 triệu', value: 'under-1m' },
    { label: '1-3 triệu', value: '1m-3m' },
    { label: '3-5 triệu', value: '3m-5m' },
    { label: 'Trên 5 triệu', value: 'over-5m' },
]

// Service type options
const serviceTypeOptions = [
    { label: 'Khác', value: 'KHAC' },
    { label: 'Dịch vụ', value: 'DICH_VU' },
    { label: 'Xét nghiệm', value: 'XET_NGHIEM' },
]

export function ServicesTable({
    data,
    total,
    pageCount,
    isLoading,
    isRefetching,
    onViewDetail,
    onEdit,
    onDelete,
    onResetFilters,
    onCreateNew,
    search,
    navigate,
}: ServicesTableProps) {
    const {
        globalFilter,
        onGlobalFilterChange,
        columnFilters,
        onColumnFiltersChange,
        pagination,
        onPaginationChange,
        ensurePageInRange,
    } = useTableUrlState({
        search,
        navigate,
        pagination: {
            defaultPage: DEFAULT_PAGE,
            defaultPageSize: DEFAULT_PAGE_SIZE,
        },
        globalFilter: { enabled: true, key: 'keyword', trim: true },
        columnFilters: [
            {
                columnId: 'priceRange',
                searchKey: 'priceRange',
                type: 'array',
            },
            {
                columnId: 'type',
                searchKey: 'type',
                type: 'array',
            },
        ],
    })

    const columns = useMemo(
        () => getServicesColumns({ onViewDetail, onEdit, onDelete }),
        [onViewDetail, onEdit, onDelete]
    )

    const effectivePageCount = Math.max(pageCount, 1)

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            columnFilters,
            pagination,
            columnVisibility: {
                priceRange: false,  // Hide filter column
                type: false,        // Hide filter column
            },
        },
        manualPagination: true,
        manualFiltering: true,
        pageCount: effectivePageCount,
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange,
        onGlobalFilterChange,
        onColumnFiltersChange,
        autoResetPageIndex: false,
    })

    useEffect(() => {
        ensurePageInRange(effectivePageCount)
    }, [effectivePageCount, ensurePageInRange])

    const startRow = data.length
        ? pagination.pageIndex * pagination.pageSize + 1
        : 0
    const endRow = data.length
        ? Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)
        : 0

    return (
        <div
            className={cn(
                'space-y-4',
                isRefetching && 'pointer-events-none opacity-60'
            )}
        >
            <div className='flex items-center justify-between gap-2'>
                <DataTableToolbar
                    table={table}
                    searchPlaceholder='Tìm kiếm dịch vụ...'
                    filters={[
                        {
                            columnId: 'priceRange',
                            title: 'Giá khám',
                            options: priceRangeOptions,
                        },
                        {
                            columnId: 'type',
                            title: 'Loại dịch vụ',
                            options: serviceTypeOptions,
                        },
                    ]}
                />
                {onCreateNew && (
                    <Button onClick={onCreateNew} className='shrink-0'>
                        <Plus className='mr-2 h-4 w-4' />
                        Thêm dịch vụ
                    </Button>
                )}
            </div>

            <div className='rounded-md border'>
                <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    // Skip hidden columns
                                    if (!header.column.getIsVisible()) return null

                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={{ width: header.getSize() }}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <>
                                {SKELETON_ROWS.map((_, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {SKELETON_COLUMNS.map((_, cellIndex) => (
                                            <TableCell key={cellIndex}>
                                                <Skeleton className='h-6 w-full' />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        // Skip hidden columns
                                        if (!cell.column.getIsVisible()) return null

                                        return (
                                            <TableCell
                                                key={cell.id}
                                                style={{ width: cell.column.getSize() }}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={table.getVisibleFlatColumns().length}
                                    className='h-24 text-center'
                                >
                                    Không tìm thấy dịch vụ nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {!isLoading && data.length > 0 && (
                <div className='flex items-center justify-between px-2'>
                    <div className='flex-1 text-sm text-muted-foreground'>
                        Hiển thị {startRow} đến {endRow} của {total} kết quả
                    </div>
                    <DataTablePagination table={table} />
                </div>
            )}
        </div>
    )
}

