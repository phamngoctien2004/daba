import { useEffect, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { CalendarDays, RotateCcw } from 'lucide-react'
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
import { STATUS_FILTER_OPTIONS } from '../constants'
import { getAppointmentsColumns } from './appointments-columns'
import {
  type Appointment,
  type AppointmentStatus,
  DEFAULT_APPOINTMENT_PAGE,
  DEFAULT_APPOINTMENT_PAGE_SIZE,
} from '../api/appointments'
import { type AppointmentsSearch } from '../types'
import { DatePicker } from '@/components/date-picker'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const SKELETON_ROWS = Array.from({ length: 5 })
const SKELETON_COLUMNS = Array.from({ length: 7 })

const deserializeStatus = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return [value]
  }

  return []
}

type AppointmentsTableProps = {
  data: Appointment[]
  total: number
  pageCount: number
  isLoading: boolean
  isRefetching: boolean
  pendingAppointmentId: number | null
  isConfirmPending: boolean
  onUpdateStatus: (id: number, status: AppointmentStatus) => void
  onOpenMedicalRecord: (id: number) => void
  dateValue: string
  onDateChange: (date: Date | undefined) => void
  onResetFilters: () => void
  search: AppointmentsSearch
  navigate: NavigateFn
}

export function AppointmentsTable({
  data,
  total,
  pageCount,
  isLoading,
  isRefetching,
  pendingAppointmentId,
  isConfirmPending,
  onUpdateStatus,
  onOpenMedicalRecord,
  dateValue,
  onDateChange,
  onResetFilters,
  search,
  navigate,
}: AppointmentsTableProps) {
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
      defaultPage: DEFAULT_APPOINTMENT_PAGE,
      defaultPageSize: DEFAULT_APPOINTMENT_PAGE_SIZE,
    },
    globalFilter: { enabled: true, key: 'phone', trim: true },
    columnFilters: [
      {
        columnId: 'status',
        searchKey: 'status',
        type: 'array',
        serialize: (value: unknown) => value,
        deserialize: deserializeStatus,
      },
    ],
  })

  const columns = useMemo(
    () =>
      getAppointmentsColumns({
        onUpdateStatus,
        onOpenMedicalRecord,
        pendingAppointmentId,
        isConfirmPending,
      }),
    [
      onUpdateStatus,
      onOpenMedicalRecord,
      pendingAppointmentId,
      isConfirmPending,
    ]
  )

  const effectivePageCount = Math.max(pageCount, 1)

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnFilters,
      pagination,
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

  const handleResetAll = () => {
    table.resetColumnFilters()
    table.setGlobalFilter('')
    table.setPageIndex(0)
    table.setPageSize(DEFAULT_APPOINTMENT_PAGE_SIZE)
    onResetFilters()
  }

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='flex flex-1 flex-col gap-4'>
          <DataTableToolbar
            table={table}
            searchPlaceholder='Tìm theo tên hoặc số điện thoại...'
            filters={[
              {
                columnId: 'status',
                title: 'Trạng thái',
                options: STATUS_FILTER_OPTIONS,
              },
            ]}
          />
        </div>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
          <label className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
            <CalendarDays className='size-4 shrink-0 text-primary' />
            Ngày khám
          </label>
          <DatePicker
            selected={dateValue ? new Date(dateValue) : undefined}
            onSelect={onDateChange}
            placeholder='Chọn ngày khám'
            allowFuture={true}
            className='w-[200px] sm:w-[220px]'
          />
          <Button
            variant='outline'
            size='sm'
            className='sm:ms-2'
            onClick={handleResetAll}
          >
            <RotateCcw className='me-2 size-4' />
            Đặt lại
          </Button>
        </div>
      </div>

      <div className='flex flex-col gap-2 rounded-lg  bg-card/40 p-4'>
        <div className='flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground'>
          <span>Tổng cộng {total} lịch khám</span>
          {isRefetching && (
            <span className='flex items-center gap-2 text-primary'>
              {/* <Loader2 className='size-4 animate-spin' />
              Đang đồng bộ dữ liệu... */}
            </span>
          )}
        </div>
        <div className='overflow-hidden rounded-md border'>
          <Table className='min-w-[960px]'>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
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
              {isLoading && data.length === 0 ? (
                SKELETON_ROWS.map((_, rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`}>
                    {SKELETON_COLUMNS.map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className='h-4 w-full' />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          cell.column.columnDef.meta?.className,
                          cell.column.columnDef.meta?.tdClassName
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className='py-10 text-center text-muted-foreground'>
                    Không có lịch khám phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='text-sm text-muted-foreground'>
            Hiển thị {startRow} – {endRow} trên tổng {total} lịch khám.
          </div>
          <DataTablePagination table={table} />
        </div>
      </div>
    </div>
  )
}
