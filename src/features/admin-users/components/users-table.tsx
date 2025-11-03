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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { DataTablePagination } from '@/components/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Cross2Icon } from '@radix-ui/react-icons'
import { getUsersColumns } from './users-columns'
import type { User } from '../api/users'
import type { UsersSearch } from '../types'

const SKELETON_ROWS = Array.from({ length: 5 })
const SKELETON_COLUMNS = Array.from({ length: 6 })

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

type UsersTableProps = {
    data: User[]
    pageCount: number
    isLoading: boolean
    isRefetching: boolean
    onViewDetail: (id: number) => void
    onEdit?: (id: number) => void
    onDelete?: (id: number) => void
    onResetPassword?: (id: number) => void
    search: UsersSearch
    navigate: NavigateFn
}

export function UsersTable({
    data,
    pageCount,
    isLoading,
    isRefetching,
    onViewDetail,
    onEdit,
    onDelete,
    onResetPassword,
    search,
    navigate,
}: UsersTableProps) {
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
                columnId: 'role',
                searchKey: 'role',
                type: 'string',
            },
        ],
    })

    const columns = useMemo(
        () => getUsersColumns({ onViewDetail, onEdit, onDelete, onResetPassword }),
        [onViewDetail, onEdit, onDelete, onResetPassword]
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
                role: true,
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

    const roleColumn = table.getColumn('role')
    const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter

    const roleOptions = [
        { label: 'Tất cả vai trò', value: 'all' },
        { label: 'Admin', value: 'ADMIN' },
        { label: 'Bác sĩ', value: 'BAC_SI' },
        { label: 'Lễ tân', value: 'LE_TAN' },
        { label: 'Bệnh nhân', value: 'BENH_NHAN' },
    ]

    return (
        <div
            className={cn(
                'space-y-4',
                isRefetching && 'pointer-events-none opacity-60'
            )}
        >
            {/* Custom Toolbar */}
            <div className='flex items-center justify-between gap-2'>
                <div className='flex flex-1 items-center gap-2'>
                    <Input
                        placeholder='Tìm kiếm tài khoản...'
                        value={globalFilter ?? ''}
                        onChange={(event) => table.setGlobalFilter(event.target.value)}
                        className='h-8 w-[150px] lg:w-[250px]'
                    />
                    <Select
                        value={(roleColumn?.getFilterValue() as string) ?? 'all'}
                        onValueChange={(value: string) => {
                            if (value === 'all') {
                                roleColumn?.setFilterValue(undefined)
                            } else {
                                roleColumn?.setFilterValue(value)
                            }
                        }}
                    >
                        <SelectTrigger className='h-8 w-[150px]'>
                            <SelectValue placeholder='Chọn vai trò' />
                        </SelectTrigger>
                        <SelectContent>
                            {roleOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {isFiltered && (
                        <Button
                            variant='ghost'
                            onClick={() => {
                                table.resetColumnFilters()
                                table.setGlobalFilter('')
                            }}
                            className='h-8 px-2 lg:px-3'
                        >
                            Reset
                            <Cross2Icon className='ms-2 h-4 w-4' />
                        </Button>
                    )}
                </div>
            </div>

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
                            SKELETON_ROWS.map((_, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {SKELETON_COLUMNS.map((_, cellIndex) => (
                                        <TableCell key={cellIndex}>
                                            <Skeleton className='h-6 w-full' />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows.length ? (
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
                                    className='h-24 text-center'
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
