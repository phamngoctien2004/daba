import { useEffect, useMemo } from 'react'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
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
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { getDepartmentsColumns } from './departments-columns'
import type { Department } from '../api/departments-list'
import type { DepartmentsSearch } from '../types-list'

const SKELETON_ROWS = Array.from({ length: 5 })
const SKELETON_COLUMNS = Array.from({ length: 5 })

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

type DepartmentsTableProps = {
    data: Department[]
    total: number
    pageCount: number
    isLoading: boolean
    isRefetching: boolean
    onViewDetail: (id: number) => void
    onEdit?: (id: number) => void
    onDelete?: (id: number) => void
    search: DepartmentsSearch
    navigate: NavigateFn
}

export function DepartmentsTable({
    data,
    total,
    pageCount,
    isLoading,
    isRefetching,
    onViewDetail,
    onEdit,
    onDelete,
    search,
    navigate,
}: DepartmentsTableProps) {
    const {
        globalFilter,
        onGlobalFilterChange,
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
    })

    const columns = useMemo(
        () => getDepartmentsColumns({ onViewDetail, onEdit, onDelete }),
        [onViewDetail, onEdit, onDelete]
    )

    const effectivePageCount = Math.max(pageCount, 1)

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            pagination,
        },
        manualPagination: true,
        manualFiltering: true,
        pageCount: effectivePageCount,
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange,
        onGlobalFilterChange,
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
            <DataTableToolbar
                table={table}
                searchPlaceholder='Tìm kiếm khoa...'
            />

            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
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
                                        return (
                                            <TableCell key={cell.id}>
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
                                    colSpan={table.getAllColumns().length}
                                    className='h-24 text-center'
                                >
                                    Không tìm thấy khoa nào.
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
