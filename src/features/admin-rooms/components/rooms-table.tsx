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
import { getRoomsColumns } from './rooms-columns'
import type { Room } from '../api/rooms'
import type { RoomsSearch } from '../types'

const SKELETON_ROWS = Array.from({ length: 5 })
const SKELETON_COLUMNS = Array.from({ length: 5 })

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

type RoomsTableProps = {
    data: Room[]
    total: number
    pageCount: number
    isLoading: boolean
    isRefetching: boolean
    onViewDetail: (id: number) => void
    onEdit?: (id: number) => void
    onDelete?: (id: number) => void
    search: RoomsSearch
    navigate: NavigateFn
    departmentOptions: Array<{ label: string; value: string }>
}

export function RoomsTable({
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
    departmentOptions,
}: RoomsTableProps) {
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
                columnId: 'departmentId',
                searchKey: 'departmentId',
                type: 'array',
            },
        ],
    })

    const columns = useMemo(
        () => getRoomsColumns({ onViewDetail, onEdit, onDelete }),
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
                departmentId: false, // Hide filter column
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
            <DataTableToolbar
                table={table}
                searchPlaceholder='Tìm kiếm phòng...'
                filters={[
                    {
                        columnId: 'departmentId',
                        title: 'Khoa',
                        options: departmentOptions,
                    },
                ]}
            />

            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    if (!header.column.getIsVisible()) return null

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
                                        if (!cell.column.getIsVisible()) return null

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
                                    colSpan={table.getVisibleFlatColumns().length}
                                    className='h-24 text-center'
                                >
                                    Không tìm thấy phòng nào.
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
